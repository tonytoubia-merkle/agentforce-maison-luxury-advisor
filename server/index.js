import http from 'node:http';
import https from 'node:https';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = {};
  try {
    const content = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
    }
  } catch { /* .env.local not found */ }
  return env;
}

const env = loadEnv();
const SF_INSTANCE = env.VITE_AGENTFORCE_INSTANCE_URL || 'https://me1769724439764.my.salesforce.com';
const PORT = process.env.API_PORT || 3001;

const routes = [
  { prefix: '/api/oauth/token',            target: SF_INSTANCE,                                 rewrite: '/services/oauth2/token' },
  { prefix: '/api/agentforce',             target: 'https://api.salesforce.com',                rewrite: '/einstein/ai-agent/v1' },
  { prefix: '/api/cms-media',              target: SF_INSTANCE,                                 rewrite: '/cms/delivery/media' },
  { prefix: '/api/cms',                    target: SF_INSTANCE,                                 rewrite: '/services/data/v60.0/connect/cms' },
  { prefix: '/api/imagen/generate',        target: 'https://generativelanguage.googleapis.com', rewrite: '/v1beta/models/imagen-4.0-generate-001:predict' },
  { prefix: '/api/gemini/generateContent', target: 'https://generativelanguage.googleapis.com', rewrite: '/v1beta/models/gemini-2.5-flash-image:generateContent' },
  { prefix: '/api/firefly/token',          target: 'https://ims-na1.adobelogin.com',            rewrite: '/ims/token/v3' },
  { prefix: '/api/firefly/generate',       target: 'https://firefly-api.adobe.io',              rewrite: '/v3/images/generate' },
  { prefix: '/api/datacloud',             target: SF_INSTANCE,                                 rewrite: '/services/data/v60.0' },
];

function findRoute(url) {
  for (const route of routes) {
    if (url === route.prefix || url.startsWith(route.prefix + '/') || url.startsWith(route.prefix + '?')) {
      return route;
    }
  }
  return null;
}

// Catch unhandled errors to prevent server crash
process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception:', err.message, err.stack?.split('\n')[1]);
});
process.on('unhandledRejection', (err) => {
  console.error('[server] Unhandled rejection:', err);
});

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-goog-api-key, x-api-key',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // --- SOQL query proxy (used by ContentVersion read path) ---
  if (req.url === '/api/sf-query' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const { soql, token } = JSON.parse(Buffer.concat(chunks).toString());
        if (!soql || !token) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Missing soql or token' }));
          return;
        }
        const sfUrl = new URL(SF_INSTANCE);
        const queryPath = `/services/data/v60.0/query?q=${encodeURIComponent(soql)}`;
        const opts = {
          hostname: sfUrl.hostname,
          port: 443,
          path: queryPath,
          method: 'GET',
          headers: {
            host: sfUrl.hostname,
            authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        };
        console.log(`[sf-query] ${soql.substring(0, 120)}`);
        const proxyReq = https.request(opts, (proxyRes) => {
          const resChunks = [];
          proxyRes.on('data', (c) => resChunks.push(c));
          proxyRes.on('end', () => {
            const body = Buffer.concat(resChunks);
            res.writeHead(proxyRes.statusCode, {
              'content-type': 'application/json',
              'access-control-allow-origin': '*',
              'content-length': body.length,
            });
            res.end(body);
          });
        });
        proxyReq.on('error', (err) => {
          console.error('[sf-query] Error:', err.message);
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        proxyReq.end();
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
    return;
  }

  // --- Create/Update Salesforce sObject records (Scene_Asset__c, etc.) ---
  if (req.url === '/api/sf-record' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const { sobject, fields, token } = JSON.parse(Buffer.concat(chunks).toString());
        if (!sobject || !fields || !token) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Missing sobject, fields, or token' }));
          return;
        }
        const body = JSON.stringify(fields);
        const sfUrl = new URL(SF_INSTANCE);
        const opts = {
          hostname: sfUrl.hostname,
          port: 443,
          path: `/services/data/v60.0/sobjects/${sobject}`,
          method: 'POST',
          headers: {
            host: sfUrl.hostname,
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(body),
            authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        };
        console.log(`[sf-record] Creating ${sobject}`);
        const proxyReq = https.request(opts, (proxyRes) => {
          const resChunks = [];
          proxyRes.on('data', (c) => resChunks.push(c));
          proxyRes.on('end', () => {
            const resBody = Buffer.concat(resChunks);
            res.writeHead(proxyRes.statusCode, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'content-length': resBody.length });
            res.end(resBody);
          });
        });
        proxyReq.on('error', (err) => {
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        proxyReq.end(body);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
    return;
  }

  // PATCH /api/sf-record/{id} — update an existing record
  if (req.url.startsWith('/api/sf-record/') && req.method === 'PATCH') {
    const parts = req.url.split('/api/sf-record/')[1]?.split('?');
    const recordId = parts?.[0];
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const { sobject, fields, token } = JSON.parse(Buffer.concat(chunks).toString());
        if (!sobject || !recordId || !token) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Missing sobject, recordId, or token' }));
          return;
        }
        const body = JSON.stringify(fields);
        const sfUrl = new URL(SF_INSTANCE);
        const opts = {
          hostname: sfUrl.hostname,
          port: 443,
          path: `/services/data/v60.0/sobjects/${sobject}/${recordId}`,
          method: 'PATCH',
          headers: {
            host: sfUrl.hostname,
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(body),
            authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        };
        console.log(`[sf-record] Updating ${sobject}/${recordId}`);
        const proxyReq = https.request(opts, (proxyRes) => {
          const resChunks = [];
          proxyRes.on('data', (c) => resChunks.push(c));
          proxyRes.on('end', () => {
            const resBody = Buffer.concat(resChunks);
            // PATCH returns 204 No Content on success
            if (proxyRes.statusCode === 204) {
              res.writeHead(204, { 'access-control-allow-origin': '*' });
              res.end();
            } else {
              res.writeHead(proxyRes.statusCode, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'content-length': resBody.length });
              res.end(resBody);
            }
          });
        });
        proxyReq.on('error', (err) => {
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        proxyReq.end(body);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
    return;
  }

  // --- Upload image via Salesforce ContentVersion API (works with any org) ---
  if (req.url === '/api/cms-upload' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const { imageBase64, fileName, title, tags, token } = JSON.parse(Buffer.concat(chunks).toString());
        const imageBuffer = Buffer.from(imageBase64, 'base64');

        // Use ContentVersion REST API — universally available, no CMS 2.0 required
        const contentVersionBody = JSON.stringify({
          Title: title || fileName,
          PathOnClient: fileName,
          Description: (tags || []).join(', '),
          VersionData: imageBase64,
        });

        const sfUrl = new URL(SF_INSTANCE);
        const options = {
          hostname: sfUrl.hostname,
          port: 443,
          path: '/services/data/v60.0/sobjects/ContentVersion',
          method: 'POST',
          headers: {
            host: sfUrl.hostname,
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(contentVersionBody),
            authorization: `Bearer ${token}`,
            accept: 'application/json',
          },
        };

        console.log(`[cms-upload] Uploading ${fileName} via ContentVersion (${imageBuffer.length} bytes)`);

        const proxyReq = https.request(options, (proxyRes) => {
          const resChunks = [];
          proxyRes.on('data', (c) => resChunks.push(c));
          proxyRes.on('end', () => {
            const resBody = Buffer.concat(resChunks);
            const resText = resBody.toString();
            console.log(`[cms-upload] Salesforce responded ${proxyRes.statusCode}:`, resText.substring(0, 500));

            // If successful, fetch the ContentDocumentId so we can build a download URL
            if (proxyRes.statusCode === 201) {
              try {
                const { id: versionId } = JSON.parse(resText);
                // Query ContentDocumentId from the new ContentVersion
                const queryPath = `/services/data/v60.0/sobjects/ContentVersion/${versionId}?fields=ContentDocumentId`;
                const queryOpts = {
                  hostname: sfUrl.hostname,
                  port: 443,
                  path: queryPath,
                  method: 'GET',
                  headers: {
                    host: sfUrl.hostname,
                    authorization: `Bearer ${token}`,
                    accept: 'application/json',
                  },
                };
                const queryReq = https.request(queryOpts, (queryRes) => {
                  const qChunks = [];
                  queryRes.on('data', (c) => qChunks.push(c));
                  queryRes.on('end', () => {
                    try {
                      const qData = JSON.parse(Buffer.concat(qChunks).toString());
                      const docId = qData.ContentDocumentId;
                      const imageUrl = `/api/sf-file/${versionId}`;
                      const result = JSON.stringify({ id: versionId, contentDocumentId: docId, imageUrl });
                      res.writeHead(201, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Content-Length': Buffer.byteLength(result) });
                      res.end(result);
                    } catch {
                      const result = JSON.stringify({ id: versionId, imageUrl: `/api/sf-file/${versionId}` });
                      res.writeHead(201, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Content-Length': Buffer.byteLength(result) });
                      res.end(result);
                    }
                  });
                });
                queryReq.on('error', () => {
                  const result = JSON.stringify({ id: versionId, imageUrl: `/api/sf-file/${versionId}` });
                  res.writeHead(201, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Content-Length': Buffer.byteLength(result) });
                  res.end(result);
                });
                queryReq.end();
                return;
              } catch { /* fall through to raw response */ }
            }

            const resHeaders = { 'access-control-allow-origin': '*', 'content-type': 'application/json', 'content-length': resBody.length };
            res.writeHead(proxyRes.statusCode, resHeaders);
            res.end(resBody);
          });
        });
        proxyReq.on('error', (err) => {
          console.error('[cms-upload] Error:', err.message);
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        proxyReq.end(contentVersionBody);
      } catch (err) {
        console.error('[cms-upload] Parse error:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
    return;
  }

  // --- Serve ContentVersion file data (proxy to Salesforce) ---
  if (req.url.startsWith('/api/sf-file/') && req.method === 'GET') {
    const versionId = req.url.split('/api/sf-file/')[1]?.split('?')[0];
    if (!versionId) {
      res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'Missing version ID' }));
      return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.writeHead(401, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'Missing authorization' }));
      return;
    }
    const sfUrl = new URL(SF_INSTANCE);
    const filePath = `/services/data/v60.0/sobjects/ContentVersion/${versionId}/VersionData`;
    const fileOpts = {
      hostname: sfUrl.hostname,
      port: 443,
      path: filePath,
      method: 'GET',
      headers: { host: sfUrl.hostname, authorization: authHeader, accept: '*/*' },
    };
    const fileReq = https.request(fileOpts, (fileRes) => {
      const resHeaders = { 'access-control-allow-origin': '*' };
      if (fileRes.headers['content-type']) resHeaders['content-type'] = fileRes.headers['content-type'];
      if (fileRes.headers['content-length']) resHeaders['content-length'] = fileRes.headers['content-length'];
      res.writeHead(fileRes.statusCode, resHeaders);
      fileRes.pipe(res);
    });
    fileReq.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    fileReq.end();
    return;
  }

  const route = findRoute(req.url);
  if (!route) {
    res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const targetUrl = new URL(route.target);
  const remotePath = route.rewrite + req.url.slice(route.prefix.length);
  const isHttps = targetUrl.protocol === 'https:';

  console.log(`[proxy] ${req.method} ${req.url} → ${targetUrl.host}${remotePath}`);
  if (req.url.startsWith('/api/cms/contents')) {
    console.log('[proxy] CMS upload headers:', JSON.stringify({
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'transfer-encoding': req.headers['transfer-encoding'],
    }));
  }

  // Only forward headers that the target API needs — avoid browser headers
  // that make Salesforce return a login page instead of a JSON response
  const headers = { host: targetUrl.hostname };
  const forwardHeaders = [
    'content-type', 'content-length', 'authorization',
    'x-goog-api-key', 'x-api-key', 'accept', 'transfer-encoding',
  ];
  for (const h of forwardHeaders) {
    if (req.headers[h]) headers[h] = req.headers[h];
  }
  if (!headers.accept || headers.accept.includes('text/html')) {
    headers.accept = 'application/json';
  }
  // CMS uploads will be buffered — don't forward transfer-encoding
  if (req.url.startsWith('/api/cms/contents') && req.method === 'POST') {
    delete headers['transfer-encoding'];
    delete headers['content-length']; // will be set after buffering
  }

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || (isHttps ? 443 : 80),
    path: remotePath,
    method: req.method,
    headers,
  };

  const proxyReq = (isHttps ? https : http).request(options, (proxyRes) => {
    const resHeaders = { ...proxyRes.headers, 'access-control-allow-origin': '*' };
    res.writeHead(proxyRes.statusCode, resHeaders);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[proxy] Error proxying ${req.url}:`, err.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
    }
  });

  // For CMS uploads: buffer the body so we can set content-length
  // (Salesforce rejects chunked transfer-encoding for multipart uploads)
  const needsBuffering = req.url.startsWith('/api/cms/contents') && req.method === 'POST';
  if (needsBuffering) {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      proxyReq.setHeader('content-length', body.length);
      proxyReq.removeHeader('transfer-encoding');
      console.log(`[proxy] CMS upload buffered: ${body.length} bytes`);
      proxyReq.end(body);
    });
  } else {
    req.pipe(proxyReq);
  }
});

// Allow large uploads and long-running proxy requests
server.timeout = 120000;
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;
server.requestTimeout = 120000;

server.listen(PORT, () => {
  console.log(`[server] API proxy running on http://localhost:${PORT}`);
  console.log(`[server] Salesforce instance: ${SF_INSTANCE}`);
});
