/**
 * Seed Salesforce CRM with demo persona data.
 *
 * Usage:
 *   node scripts/seed-salesforce.js
 *
 * Prerequisites:
 *   - The Express proxy server must be running (npm run dev)
 *   - .env.local must have valid VITE_AGENTFORCE_CLIENT_ID / SECRET / INSTANCE_URL
 *
 * What it creates (for each "known" persona):
 *   1. Account → Contact (with custom luxury profile fields)
 *   2. Chat_Summary__c records
 *   3. Meaningful_Event__c records
 *   4. Agent_Captured_Profile__c records
 *   5. Browse_Session__c records
 *
 * The CRM Connector in Data Cloud will sync these to Data Cloud automatically.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_BASE = 'http://localhost:3001';

// ─── Load env ───────────────────────────────────────────────────
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

// ─── OAuth ──────────────────────────────────────────────────────
async function getAccessToken() {
  const clientId = env.VITE_AGENTFORCE_CLIENT_ID;
  const clientSecret = env.VITE_AGENTFORCE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Missing VITE_AGENTFORCE_CLIENT_ID or SECRET in .env.local');

  const res = await fetch(`${API_BASE}/api/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
  });
  if (!res.ok) throw new Error(`OAuth failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// ─── Salesforce REST helpers ────────────────────────────────────
async function sfCreate(token, sobject, fields) {
  const res = await fetch(`${API_BASE}/api/datacloud/sobjects/${sobject}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`  ✗ Create ${sobject} failed (${res.status}): ${text}`);
    return null;
  }
  const result = JSON.parse(text);
  console.log(`  ✓ Created ${sobject}: ${result.id}`);
  return result.id;
}

async function sfUpdate(token, sobject, id, fields) {
  const res = await fetch(`${API_BASE}/api/datacloud/sobjects/${sobject}/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    console.error(`  ✗ Update ${sobject}/${id} failed (${res.status}): ${text}`);
    return false;
  }
  return true;
}

async function sfQuery(token, soql) {
  const res = await fetch(`${API_BASE}/api/datacloud/query?q=${encodeURIComponent(soql)}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    console.error(`  ✗ Query failed (${res.status}): ${await res.text()}`);
    return { records: [] };
  }
  return res.json();
}

async function cleanupOrphanedAccounts(token) {
  console.log('\n🧹 Cleaning up orphaned Accounts from previous run...');
  const names = [
    'Isabelle Durand Household', 'Alexander Chen Household', 'Sofia Martinez Household',
    'Laurent Bertrand Household', 'Olivia Park Household', 'Marcus Johnson Household',
  ];
  for (const name of names) {
    const data = await sfQuery(token, `SELECT Id FROM Account WHERE Name = '${name}'`);
    for (const record of data.records || []) {
      const res = await fetch(`${API_BASE}/api/datacloud/sobjects/Account/${record.Id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 204) {
        console.log(`  ✓ Deleted orphaned Account: ${record.Id} (${name})`);
      } else {
        console.log(`  ✗ Failed to delete ${record.Id}: ${res.status}`);
      }
    }
  }
}

// ─── Lookup Product2 IDs by product name ────────────────────────
async function buildProductMap(token) {
  const data = await sfQuery(token, "SELECT Id, Name FROM Product2 WHERE IsActive = true");
  const map = {};
  for (const r of data.records || []) {
    map[r.Name] = r.Id;
  }
  console.log(`  Found ${Object.keys(map).length} active products in org`);
  return map;
}

// ─── Persona Data ───────────────────────────────────────────────

// La Maison personas
const lvPersonas = [
  {
    name: { first: 'Isabelle', last: 'Durand' },
    email: 'isabelle.durand@example.com',
    merkuryId: 'MRK-ID-75001',
    preferredMaison: 'La Maison',
    preferredBrands: 'MAISON;HAUTE JOAILLERIE',
    stylePreference: 'Classic with statement pieces',
    address: { street: '12 Avenue Montaigne', city: 'Paris', state: '', zip: '75008', country: 'FR' },
    orders: [
      { id: 'ORD-2025-0301', date: '2025-03-14', channel: 'in-store', status: 'Activated', total: 5500, items: [{ name: 'Capucines BB', qty: 1, price: 5500 }] },
      { id: 'ORD-2025-0612', date: '2025-06-12', channel: 'online', status: 'Activated', total: 1375, items: [{ name: 'Vivienne Pendant Necklace', qty: 1, price: 845 }, { name: 'Nanogram Cuff Bracelet', qty: 1, price: 530 }] },
      { id: 'ORD-2025-0918', date: '2025-09-18', channel: 'in-store', status: 'Activated', total: 2030, items: [{ name: 'Neverfull MM', qty: 1, price: 2030 }] },
      { id: 'ORD-2025-1201', date: '2025-12-01', channel: 'online', status: 'Activated', total: 400, items: [{ name: 'Card Holder', qty: 1, price: 400 }] },
    ],
    loyalty: { tier: 'Platinum', points: 8200, lifetime: 9275, since: '2024-01-15', expires: '2027-01-15' },
    chatSummaries: [
      { date: '2025-06-12', summary: 'VIC customer shopping for jewelry to match her Capucines. Selected Vivienne pendant and Nanogram cuff. Mentioned daughter turning 18 next year.', sentiment: 'positive', topics: 'jewelry;matching set;daughter birthday' },
      { date: '2025-12-01', summary: 'Quick gifting purchase — card holder for nephew. Asked about monogramming options.', sentiment: 'positive', topics: 'gifting;monogram;small leather goods' },
    ],
    meaningfulEvents: [
      { type: 'life-event', desc: "Daughter Camille turning 18 — wants something unforgettable", at: '2025-06-12', note: 'High jewelry or signature handbag would be ideal', meta: { occasion: 'birthday', giftFor: 'daughter Camille', age: 18 } },
      { type: 'preference', desc: 'Collects jewelry that matches her handbags — coordination is key', at: '2025-06-12', note: 'Always suggest complementary pieces' },
    ],
    capturedProfile: [
      { field: 'stylePreference', value: 'Classic Parisian elegance with bold statement jewelry', at: '2025-06-12', from: 'chat', confidence: 'inferred' },
      { field: 'giftsFor', value: 'daughter Camille;nephew', at: '2025-12-01', from: 'chat', confidence: 'stated', dataType: 'array' },
      { field: 'collectorInterests', value: 'Fine jewelry, coordinates with leather goods', at: '2025-06-12', from: 'purchase pattern', confidence: 'inferred' },
    ],
    browseSessions: [
      { date: '2026-01-20', categories: 'jewelry;handbag', products: 'lv-vivienne-pendant;lv-capucines-bb', duration: 15, device: 'desktop' },
    ],
  },
  {
    name: { first: 'Alexander', last: 'Chen' },
    email: 'alexander.chen@example.com',
    merkuryId: 'MRK-AC-10001',
    preferredMaison: 'La Maison',
    preferredBrands: 'MAISON',
    stylePreference: 'Modern minimalist',
    address: { street: '88 Park Ave', city: 'New York', state: 'NY', zip: '10016', country: 'US' },
    orders: [
      { id: 'ORD-2025-0515', date: '2025-05-15', channel: 'online', status: 'Activated', total: 2480, items: [{ name: 'Keepall Bandouliere 45', qty: 1, price: 2480 }] },
      { id: 'ORD-2025-1108', date: '2025-11-08', channel: 'online', status: 'Activated', total: 1010, items: [{ name: 'Zippy Wallet', qty: 1, price: 1010 }] },
    ],
    loyalty: { tier: 'Gold', points: 3200, lifetime: 3560, since: '2025-05-15', expires: '2027-05-15' },
    chatSummaries: [
      { date: '2025-05-15', summary: 'Business traveler looking for quality travel bag. Chose Keepall 45 — prefers soft bags. Travels NYC-London-HK monthly.', sentiment: 'positive', topics: 'travel;business;keepall;frequent flyer' },
      { date: '2025-11-08', summary: 'Anniversary gift for wife — chose Zippy Wallet. Asked about matching bag options for future.', sentiment: 'positive', topics: 'anniversary;gifting;wallet;matching bag' },
    ],
    meaningfulEvents: [
      { type: 'life-event', desc: 'Anniversary gift — wants to build matching set for wife over time', at: '2025-11-08', note: 'Suggest Neverfull or Speedy to match Zippy Wallet', meta: { occasion: 'anniversary', giftFor: 'wife' } },
      { type: 'preference', desc: 'Frequent business traveler: NYC-London-Hong Kong circuit', at: '2025-05-15', note: 'Prioritize travel pieces and cabin-friendly sizes' },
    ],
    capturedProfile: [
      { field: 'travelFrequency', value: 'Monthly — NYC, London, Hong Kong', at: '2025-05-15', from: 'chat', confidence: 'stated' },
      { field: 'anniversary', value: 'November', at: '2025-11-08', from: 'chat', confidence: 'stated' },
      { field: 'giftsFor', value: 'wife', at: '2025-11-08', from: 'chat', confidence: 'stated', dataType: 'array' },
    ],
    browseSessions: [
      { date: '2026-01-25', categories: 'handbag;travel', products: 'lv-neverfull-mm;lv-horizon-55', duration: 8, device: 'mobile' },
    ],
  },
];

// Maison des Esprits personas
const mhPersonas = [
  {
    name: { first: 'Laurent', last: 'Bertrand' },
    email: 'laurent.bertrand@example.com',
    merkuryId: 'MRK-LB-69001',
    preferredMaison: 'Maison des Esprits',
    preferredBrands: 'HENNESSY;DOM PÉRIGNON',
    tastingPreferences: 'Bold cognac, vintage champagne',
    address: { street: '45 Quai de la Tournelle', city: 'Lyon', state: '', zip: '69002', country: 'FR' },
    orders: [
      { id: 'ORD-2025-0220', date: '2025-02-20', channel: 'online', status: 'Activated', total: 229, items: [{ name: 'Hennessy X.O', qty: 1, price: 229 }] },
      { id: 'ORD-2025-0601', date: '2025-06-01', channel: 'in-store', status: 'Activated', total: 289, items: [{ name: 'Dom Pérignon Vintage 2015', qty: 1, price: 289 }] },
      { id: 'ORD-2025-0915', date: '2025-09-15', channel: 'online', status: 'Activated', total: 778, items: [{ name: 'Dom Pérignon Rosé Vintage 2012', qty: 1, price: 549 }, { name: 'Hennessy X.O', qty: 1, price: 229 }] },
      { id: 'ORD-2025-1210', date: '2025-12-10', channel: 'online', status: 'Activated', total: 1100, items: [{ name: 'Hennessy Paradis', qty: 1, price: 1100 }] },
    ],
    loyalty: { tier: 'Platinum', points: 6500, lifetime: 2396, since: '2024-06-01', expires: '2027-06-01' },
    chatSummaries: [
      { date: '2025-06-01', summary: 'Cognac collector visiting boutique. Purchased Dom Pérignon Vintage for his cellar. Discussed 60th birthday tasting event plans.', sentiment: 'positive', topics: 'cognac;champagne;collector;birthday tasting' },
      { date: '2025-12-10', summary: 'Purchased Hennessy Paradis for collection. Planning milestone 60th birthday tasting for friends.', sentiment: 'positive', topics: 'rare spirits;Paradis;collector;60th birthday' },
    ],
    meaningfulEvents: [
      { type: 'life-event', desc: '60th birthday approaching — planning intimate tasting event for close friends', at: '2025-12-10', note: 'Curate a multi-house tasting experience', meta: { occasion: '60th birthday', type: 'tasting event', guests: 'close friends' } },
      { type: 'preference', desc: 'Serious cognac collector — has Hennessy V.S through Paradis in cellar', at: '2025-06-01', note: 'Suggest rare releases and limited editions' },
    ],
    capturedProfile: [
      { field: 'entertainingStyle', value: 'Intimate tasting events for close friends, 8-12 guests', at: '2025-12-10', from: 'chat', confidence: 'stated' },
      { field: 'collectorInterests', value: 'Cognac (full Hennessy range), vintage champagne', at: '2025-12-10', from: 'purchase pattern', confidence: 'inferred' },
      { field: 'birthday', value: 'Approaching 60th', at: '2025-12-10', from: 'chat', confidence: 'stated' },
    ],
    browseSessions: [
      { date: '2026-01-28', categories: 'cognac;gift-set', products: 'mh-hennessy-paradis;mh-hennessy-xo-gift', duration: 12, device: 'desktop' },
    ],
  },
  {
    name: { first: 'Olivia', last: 'Park' },
    email: 'olivia.park@example.com',
    merkuryId: 'MRK-OP-90210',
    preferredMaison: 'Maison des Esprits',
    preferredBrands: 'DOM PÉRIGNON;VEUVE CLICQUOT;RUINART',
    tastingPreferences: 'Champagne, light rosé',
    address: { street: '2200 Wilshire Blvd', city: 'Los Angeles', state: 'CA', zip: '90210', country: 'US' },
    orders: [
      { id: 'ORD-2025-0410', date: '2025-04-10', channel: 'online', status: 'Activated', total: 62, items: [{ name: 'Veuve Clicquot Yellow Label Brut', qty: 1, price: 62 }] },
      { id: 'ORD-2025-0720', date: '2025-07-20', channel: 'online', status: 'Activated', total: 89, items: [{ name: 'Ruinart Blanc de Blancs', qty: 1, price: 89 }] },
      { id: 'ORD-2025-1105', date: '2025-11-05', channel: 'in-store', status: 'Activated', total: 261, items: [{ name: 'Champagne Discovery Collection', qty: 1, price: 199 }, { name: 'Veuve Clicquot Yellow Label Brut', qty: 1, price: 62 }] },
    ],
    loyalty: { tier: 'Gold', points: 1800, lifetime: 412, since: '2025-04-10', expires: '2027-04-10' },
    chatSummaries: [
      { date: '2025-07-20', summary: 'Champagne enthusiast hosting summer garden party. Recommended Ruinart for elegance. Interested in food pairing guidance.', sentiment: 'positive', topics: 'champagne;entertaining;garden party;pairing' },
      { date: '2025-11-05', summary: 'Bought Discovery Collection as holiday gift for parents. Restocked Veuve for Thanksgiving. Hosts frequently.', sentiment: 'positive', topics: 'gifting;holiday;entertaining;champagne' },
    ],
    meaningfulEvents: [
      { type: 'preference', desc: 'Hosts dinner and garden parties frequently — champagne is central', at: '2025-07-20', note: 'Suggest entertaining quantities and pairing guidance' },
      { type: 'intent', desc: 'Parents enjoy champagne — gifting channel for discovery sets', at: '2025-11-05', note: 'Gift sets and collections for parents around holidays', meta: { giftFor: 'parents' } },
    ],
    capturedProfile: [
      { field: 'entertainingStyle', value: 'Frequent dinner parties and garden parties, 10-20 guests', at: '2025-07-20', from: 'chat', confidence: 'stated' },
      { field: 'giftsFor', value: 'parents', at: '2025-11-05', from: 'chat', confidence: 'stated', dataType: 'array' },
    ],
    browseSessions: [
      { date: '2026-01-22', categories: 'champagne;wine', products: 'mh-dom-perignon-vintage;mh-whispering-angel', duration: 10, device: 'mobile' },
    ],
  },
];

const personas = [...lvPersonas, ...mhPersonas];

// ─── Seed Logic ─────────────────────────────────────────────────
async function seedPersona(token, persona, productMap) {
  console.log(`\n══════════════════════════════════════`);
  console.log(`Seeding: ${persona.name.first} ${persona.name.last} (${persona.merkuryId})`);
  console.log(`══════════════════════════════════════`);

  // 1. Create Account
  const accountId = await sfCreate(token, 'Account', {
    Name: `${persona.name.first} ${persona.name.last} Household`,
  });
  if (!accountId) return;

  // 2. Create Contact with custom luxury profile fields
  const contactFields = {
    FirstName: persona.name.first,
    LastName: persona.name.last,
    Email: persona.email,
    AccountId: accountId,
    MailingStreet: persona.address.street,
    MailingCity: persona.address.city,
    MailingState: persona.address.state,
    MailingPostalCode: persona.address.zip,
    MailingCountry: persona.address.country,
    ...(persona.preferredMaison && { Preferred_Maison__c: persona.preferredMaison }),
    ...(persona.preferredBrands && { Preferred_Brands__c: persona.preferredBrands }),
    ...(persona.stylePreference && { Style_Preference__c: persona.stylePreference }),
    ...(persona.tastingPreferences && { Tasting_Preferences__c: persona.tastingPreferences }),
  };

  const contactId = await sfCreate(token, 'Contact', contactFields);
  if (!contactId) return;

  // 3. Create Orders (with OrderItems)
  for (const order of persona.orders) {
    const pbData = await sfQuery(token, "SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1");
    const pricebookId = pbData.records?.[0]?.Id;

    const orderId = await sfCreate(token, 'Order', {
      AccountId: accountId,
      EffectiveDate: order.date,
      Status: 'Draft',
      Pricebook2Id: pricebookId,
      OrderReferenceNumber: order.id,
    });
    if (!orderId) continue;

    for (const item of order.items) {
      const product2Id = productMap[item.name];
      if (!product2Id) {
        console.log(`    ⚠ Product not found: "${item.name}" — skipping line item`);
        continue;
      }

      const pbeData = await sfQuery(token, `SELECT Id FROM PricebookEntry WHERE Product2Id = '${product2Id}' AND Pricebook2Id = '${pricebookId}' LIMIT 1`);
      let pbeId = pbeData.records?.[0]?.Id;

      if (!pbeId) {
        pbeId = await sfCreate(token, 'PricebookEntry', {
          Pricebook2Id: pricebookId,
          Product2Id: product2Id,
          UnitPrice: item.price,
          IsActive: true,
        });
      }
      if (!pbeId) continue;

      await sfCreate(token, 'OrderItem', {
        OrderId: orderId,
        Product2Id: product2Id,
        PricebookEntryId: pbeId,
        Quantity: item.qty,
        UnitPrice: item.price,
      });
    }

    if (order.status === 'Activated') {
      const activated = await sfUpdate(token, 'Order', orderId, { Status: 'Activated' });
      if (activated) console.log(`    ✓ Order ${order.id} activated`);
    }
  }

  // 4. Create Chat Summaries
  for (const chat of persona.chatSummaries) {
    await sfCreate(token, 'Chat_Summary__c', {
      Customer_Id__c: contactId,
      Session_Date__c: chat.date,
      Summary_Text__c: chat.summary,
      Sentiment__c: chat.sentiment,
      Topics_Discussed__c: chat.topics,
    });
  }

  // 5. Create Meaningful Events
  for (const event of persona.meaningfulEvents) {
    await sfCreate(token, 'Meaningful_Event__c', {
      Customer_Id__c: contactId,
      Event_Type__c: event.type,
      Description__c: event.desc,
      Captured_At__c: event.at,
      Agent_Note__c: event.note,
      Metadata_JSON__c: event.meta ? JSON.stringify(event.meta) : null,
    });
  }

  // 6. Create Agent Captured Profile fields
  for (const field of persona.capturedProfile) {
    await sfCreate(token, 'Agent_Captured_Profile__c', {
      Customer_Id__c: contactId,
      Field_Name__c: field.field,
      Field_Value__c: typeof field.value === 'object' ? JSON.stringify(field.value) : field.value,
      Captured_At__c: field.at,
      Captured_From__c: field.from,
      Confidence__c: field.confidence,
      Data_Type__c: field.dataType || 'string',
    });
  }

  // 7. Create Browse Sessions
  for (const browse of persona.browseSessions) {
    await sfCreate(token, 'Browse_Session__c', {
      Customer_Id__c: contactId,
      Session_Date__c: browse.date,
      Categories_Browsed__c: browse.categories,
      Products_Viewed__c: browse.products,
      Duration_Minutes__c: browse.duration,
      Device__c: browse.device,
    });
  }

  console.log(`  ✅ Done: ${persona.name.first} ${persona.name.last}`);
  return contactId;
}

// ─── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('🔐 Authenticating with Salesforce...');
  const token = await getAccessToken();
  console.log('  ✓ Token acquired');

  await cleanupOrphanedAccounts(token);

  console.log('\n📦 Loading Product2 catalog...');
  const productMap = await buildProductMap(token);

  const contactMap = {};
  for (const persona of personas) {
    const contactId = await seedPersona(token, persona, productMap);
    if (contactId) {
      contactMap[persona.merkuryId] = contactId;
    }
  }

  console.log('\n\n══════════════════════════════════════');
  console.log('📋 Merkury ID → Contact ID mapping:');
  console.log('══════════════════════════════════════');
  for (const [merkuryId, contactId] of Object.entries(contactMap)) {
    console.log(`  ${merkuryId} → ${contactId}`);
  }
  console.log('\nIf the CRM Connector is set up, these records will sync to Data Cloud automatically.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
