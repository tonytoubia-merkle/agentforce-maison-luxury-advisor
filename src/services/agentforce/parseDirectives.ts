import type { UIDirective, UIAction } from '@/types/agent';
import type { Product } from '@/types/product';
import type { RawAgentResponse } from './types';

/**
 * Strip invisible/control characters that Agentforce sometimes injects,
 * keeping only standard whitespace (\n, \r, \t, space) intact.
 */
function sanitize(raw: string): string {
  // eslint-disable-next-line no-control-regex
  return raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u200B-\u200F\uFEFF]/g, '').trim();
}

/** Ensure every product has an `id` — agent responses may use different field names. */
function normalizeProducts(products: unknown[]): Product[] {
  return products.map((p, i) => {
    const raw = p as Record<string, unknown>;
    if (!raw.id) {
      raw.id = raw.productId || raw.sku || raw.productCode || `product-${i}`;
    }
    return raw as unknown as Product;
  });
}

function extractDirective(obj: unknown): UIDirective | undefined {
  if (obj && typeof obj === 'object' && 'uiDirective' in (obj as Record<string, unknown>)) {
    const d = (obj as Record<string, unknown>).uiDirective as Record<string, unknown>;
    if (d && d.action) {
      const payload = (d.payload || {}) as UIDirective['payload'];
      if (payload.products && Array.isArray(payload.products)) {
        payload.products = normalizeProducts(payload.products);
      }
      if (payload.checkoutData?.products && Array.isArray(payload.checkoutData.products)) {
        payload.checkoutData.products = normalizeProducts(payload.checkoutData.products);
      }
      return { action: d.action as UIAction, payload };
    }
  }
  return undefined;
}

function tryParseJSON(text: string): unknown | undefined {
  const clean = sanitize(text);

  // Direct parse
  try {
    return JSON.parse(clean);
  } catch { /* continue */ }

  // Extract substring from first '{' to last '}'
  const start = clean.indexOf('{');
  if (start === -1) return undefined;
  const end = clean.lastIndexOf('}');
  if (end <= start) return undefined;

  const candidate = clean.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch { /* continue */ }

  // Agentforce sometimes returns JSON with missing closing braces.
  // Count unmatched braces/brackets and append them.
  let depth = 0;
  let bracketDepth = 0;
  let inStr = false;
  let esc = false;
  for (let i = 0; i < candidate.length; i++) {
    const ch = candidate[i];
    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '[') bracketDepth++;
    else if (ch === ']') bracketDepth--;
  }

  if (depth > 0 || bracketDepth > 0) {
    const repaired = candidate + ']'.repeat(Math.max(0, bracketDepth)) + '}'.repeat(Math.max(0, depth));
    try {
      console.warn(`[parseDirectives] Repaired JSON: added ${depth} closing brace(s), ${bracketDepth} closing bracket(s)`);
      return JSON.parse(repaired);
    } catch { /* continue */ }
  }

  return undefined;
}

export function parseUIDirective(response: RawAgentResponse): UIDirective | undefined {
  if (response.metadata?.uiDirective) {
    return extractDirective({ uiDirective: response.metadata.uiDirective });
  }

  const text = response.message || response.rawText || '';
  const parsed = tryParseJSON(text);
  if (parsed) {
    return extractDirective(parsed);
  }

  return undefined;
}
