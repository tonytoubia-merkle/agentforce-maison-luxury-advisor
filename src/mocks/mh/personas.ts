import type { CustomerProfile } from '@/types/customer';
import type { PersonaMeta, PersonaStub } from '@/mocks/customerPersonas';

// ─── Laurent Bertrand: Known, Platinum, Cognac Collector ─────────
const laurentBertrand: CustomerProfile = {
  id: 'mh-persona-laurent',
  name: 'Laurent',
  email: 'laurent.bertrand@example.com',

  luxuryProfile: {
    stylePreference: 'classic',
    concerns: ['cognac', 'rare vintages', 'cellar building'],
    allergies: [],
    preferredBrands: ['HENNESSY', 'DOM P\u00c9RIGNON'],
    ageRange: '50-60',
  },

  orders: [
    {
      orderId: 'ORD-2025-MH-0201',
      orderDate: '2025-03-15',
      channel: 'in-store',
      status: 'completed',
      totalAmount: 1100.00,
      lineItems: [
        { productId: 'mh-hennessy-paradis', productName: 'Hennessy Paradis', quantity: 1, unitPrice: 1100.00 },
      ],
    },
    {
      orderId: 'ORD-2025-MH-0590',
      orderDate: '2025-06-22',
      channel: 'online',
      status: 'completed',
      totalAmount: 549.00,
      lineItems: [
        { productId: 'mh-dom-perignon-rose', productName: 'Dom P\u00e9rignon Ros\u00e9 Vintage 2012', quantity: 1, unitPrice: 549.00 },
      ],
    },
    {
      orderId: 'ORD-2025-MH-0920',
      orderDate: '2025-10-10',
      channel: 'online',
      status: 'completed',
      totalAmount: 458.00,
      lineItems: [
        { productId: 'mh-hennessy-xo', productName: 'Hennessy X.O', quantity: 2, unitPrice: 229.00 },
      ],
    },
    {
      orderId: 'ORD-2025-MH-1180',
      orderDate: '2025-12-20',
      channel: 'in-store',
      status: 'completed',
      totalAmount: 289.00,
      lineItems: [
        { productId: 'mh-dom-perignon-vintage', productName: 'Dom P\u00e9rignon Vintage 2015', quantity: 1, unitPrice: 289.00 },
      ],
    },
  ],

  chatSummaries: [
    {
      sessionDate: '2025-06-22',
      summary: 'Laurent purchased Dom P\u00e9rignon Ros\u00e9 2012 for a summer dinner party at his vineyard estate. He discussed his preference for Pinot Noir-dominant champagnes and asked about the P2 and P3 vintages.',
      sentiment: 'positive',
      topicsDiscussed: ['champagne', 'vintage collection', 'dinner pairing', 'P2/P3 releases'],
    },
    {
      sessionDate: '2025-12-20',
      summary: 'Laurent came in for holiday entertaining selections. Bought Dom P\u00e9rignon 2015 for New Year\'s Eve. Mentioned planning a private tasting event in March for his 60th birthday — interested in a Hennessy masterclass.',
      sentiment: 'positive',
      topicsDiscussed: ['holiday entertaining', 'birthday planning', 'private tasting', 'Hennessy masterclass'],
    },
  ],

  meaningfulEvents: [
    {
      eventType: 'preference',
      description: 'Prefers Pinot Noir-dominant champagnes and aged cognacs — connoisseur palate',
      capturedAt: '2025-06-22',
      agentNote: 'Lead with premium vintages and rare bottlings. He appreciates tasting notes and provenance stories.',
    },
    {
      eventType: 'life-event',
      description: '60th birthday in March — planning a private tasting event',
      capturedAt: '2025-12-20',
      agentNote: 'Interested in Hennessy masterclass experience. High-value event opportunity. Budget likely $5,000+.',
      metadata: { occasion: '60th-birthday', month: 'March' },
    },
  ],

  agentCapturedProfile: {
    luxuryPriority: {
      value: 'Serious collector — values provenance, aging, and rare bottlings',
      capturedAt: '2025-06-22',
      capturedFrom: 'chat session 2025-06-22',
      confidence: 'inferred',
    },
    priceRange: {
      value: 'Ultra-premium — regularly purchases $500+ bottles, open to $1,000+',
      capturedAt: '2025-03-15',
      capturedFrom: 'inferred from purchase pattern',
      confidence: 'inferred',
    },
    workEnvironment: {
      value: 'Vineyard estate owner, hosts regular dinner parties',
      capturedAt: '2025-06-22',
      capturedFrom: 'chat session 2025-06-22',
      confidence: 'stated',
    },
  },

  browseSessions: [
    {
      sessionDate: '2026-01-20',
      categoriesBrowsed: ['cognac', 'champagne'],
      productsViewed: ['mh-hennessy-paradis', 'mh-dom-perignon-rose'],
      durationMinutes: 12,
      device: 'desktop',
    },
  ],

  loyalty: {
    tier: 'platinum',
    pointsBalance: 32000,
    lifetimePoints: 58000,
    memberSince: '2022-01-15',
    rewardsAvailable: [
      { name: 'Private cellar tour experience', pointsCost: 15000 },
      { name: 'Exclusive vintage allocation', pointsCost: 25000 },
    ],
    tierExpiryDate: '2027-01-15',
  },

  merkuryIdentity: {
    merkuryId: 'MRK-ID-MH-10001',
    identityTier: 'known',
    confidence: 0.99,
    resolvedAt: new Date().toISOString(),
  },

  purchaseHistory: [],
  savedPaymentMethods: [
    { id: 'pm-mh-1', type: 'card', last4: '7777', brand: 'amex', isDefault: true },
  ],
  shippingAddresses: [
    { id: 'addr-mh-1', name: 'Laurent Bertrand', line1: '42 Rue du Faubourg', city: 'Napa', state: 'CA', postalCode: '94558', country: 'US', isDefault: true },
  ],
  recentActivity: [],
  lifetimeValue: 2396,
};

// ─── Olivia Park: Known, Gold, Champagne Enthusiast ──────────────
const oliviaPark: CustomerProfile = {
  id: 'mh-persona-olivia',
  name: 'Olivia',
  email: 'olivia.park@example.com',

  luxuryProfile: {
    stylePreference: 'classic',
    concerns: ['champagne', 'entertaining', 'food pairing'],
    allergies: [],
    preferredBrands: ['MO\u00cbT & CHANDON', 'VEUVE CLICQUOT', 'RUINART'],
    ageRange: '30-40',
  },

  orders: [
    {
      orderId: 'ORD-2025-MH-0345',
      orderDate: '2025-05-20',
      channel: 'online',
      status: 'completed',
      totalAmount: 124.00,
      lineItems: [
        { productId: 'mh-veuve-clicquot-brut', productName: 'Veuve Clicquot Yellow Label Brut', quantity: 2, unitPrice: 62.00 },
      ],
    },
    {
      orderId: 'ORD-2025-MH-0780',
      orderDate: '2025-08-15',
      channel: 'online',
      status: 'completed',
      totalAmount: 89.00,
      lineItems: [
        { productId: 'mh-ruinart-blanc-de-blancs', productName: 'Ruinart Blanc de Blancs', quantity: 1, unitPrice: 89.00 },
      ],
    },
    {
      orderId: 'ORD-2025-MH-1050',
      orderDate: '2025-11-28',
      channel: 'online',
      status: 'completed',
      totalAmount: 199.00,
      lineItems: [
        { productId: 'mh-champagne-tasting-set', productName: 'Champagne Discovery Collection', quantity: 1, unitPrice: 199.00 },
      ],
    },
  ],

  chatSummaries: [
    {
      sessionDate: '2025-08-15',
      summary: 'Olivia was looking for a champagne to pair with a seafood dinner. Recommended Ruinart Blanc de Blancs for its minerality. She mentioned she hosts monthly dinner parties and loves discovering new pairings.',
      sentiment: 'positive',
      topicsDiscussed: ['champagne', 'food pairing', 'seafood', 'dinner parties'],
    },
    {
      sessionDate: '2025-11-28',
      summary: 'Olivia bought the Champagne Discovery Collection as a gift for her sister. Also mentioned she\'s planning a New Year\'s Eve party for 20 people and needs recommendations for a crowd-pleasing selection.',
      sentiment: 'positive',
      topicsDiscussed: ['gifting', 'New Year\'s party', 'entertaining', 'crowd selection'],
    },
  ],

  meaningfulEvents: [
    {
      eventType: 'preference',
      description: 'Hosts monthly dinner parties — values food-pairing expertise',
      capturedAt: '2025-08-15',
      agentNote: 'Always suggest pairing recommendations. She loves learning about champagne-food combinations.',
    },
    {
      eventType: 'intent',
      description: 'Planning a New Year\'s Eve party for 20 — needs large-format or multiple bottles',
      capturedAt: '2025-11-28',
      agentNote: 'Consider recommending cases or magnums. Budget likely $500-800 for the event.',
      metadata: { occasion: 'new-years-party', guestCount: '20' },
    },
  ],

  agentCapturedProfile: {
    luxuryPriority: {
      value: 'Champagne-focused — loves discovering pairings and sharing with friends',
      capturedAt: '2025-08-15',
      capturedFrom: 'chat session 2025-08-15',
      confidence: 'inferred',
    },
    giftsFor: {
      value: ['sister'],
      capturedAt: '2025-11-28',
      capturedFrom: 'chat session 2025-11-28',
      confidence: 'stated',
    },
  },

  browseSessions: [
    {
      sessionDate: '2026-01-15',
      categoriesBrowsed: ['champagne', 'wine'],
      productsViewed: ['mh-moet-rose', 'mh-cloudy-bay-sauvignon'],
      durationMinutes: 8,
      device: 'mobile',
    },
  ],

  loyalty: {
    tier: 'gold',
    pointsBalance: 3200,
    lifetimePoints: 5400,
    memberSince: '2025-05-20',
    rewardsAvailable: [
      { name: 'Complimentary gift wrapping', pointsCost: 1000 },
    ],
    nextTierThreshold: 10000,
    tierExpiryDate: '2026-05-20',
  },

  merkuryIdentity: {
    merkuryId: 'MRK-ID-MH-10002',
    identityTier: 'known',
    confidence: 0.95,
    resolvedAt: new Date().toISOString(),
  },

  purchaseHistory: [],
  savedPaymentMethods: [
    { id: 'pm-mh-2', type: 'card', last4: '3333', brand: 'visa', isDefault: true },
  ],
  shippingAddresses: [
    { id: 'addr-mh-2', name: 'Olivia Park', line1: '88 King St', city: 'Charleston', state: 'SC', postalCode: '29401', country: 'US', isDefault: true },
  ],
  recentActivity: [],
  lifetimeValue: 412,
};

// ─── Marcus Johnson: Known, No Loyalty, Whisky Explorer ──────────
const marcusJohnson: CustomerProfile = {
  id: 'mh-persona-marcus',
  name: 'Marcus',
  email: 'marcus.j@example.com',

  luxuryProfile: {
    stylePreference: 'classic',
    concerns: ['whisky', 'exploration', 'cocktails'],
    allergies: [],
    preferredBrands: ['GLENMORANGIE', 'ARDBEG'],
    ageRange: '28-35',
  },

  orders: [
    {
      orderId: 'ORD-2025-MH-0920',
      orderDate: '2025-09-05',
      channel: 'online',
      status: 'completed',
      totalAmount: 58.00,
      lineItems: [
        { productId: 'mh-ardbeg-10', productName: 'Ardbeg Ten Years Old', quantity: 1, unitPrice: 58.00 },
      ],
    },
  ],

  chatSummaries: [
    {
      sessionDate: '2025-09-05',
      summary: 'Marcus was new to peated whisky and wanted to try something smoky. Recommended Ardbeg 10 as the definitive introduction. He mentioned he usually drinks bourbon but wants to explore Scotch. Also asked about whisky and cognac cocktail recipes.',
      sentiment: 'positive',
      topicsDiscussed: ['peated whisky', 'bourbon transition', 'cocktails', 'exploration'],
    },
  ],

  meaningfulEvents: [
    {
      eventType: 'intent',
      description: 'Transitioning from bourbon to Scotch — wants to explore different styles',
      capturedAt: '2025-09-05',
      agentNote: 'Guide through the spectrum: Glenmorangie (light/fruity) to Ardbeg (heavy peat). Good candidate for a tasting journey.',
    },
  ],

  agentCapturedProfile: {
    luxuryPriority: {
      value: 'Explorer — curious about different styles, enjoys cocktails and neat sipping',
      capturedAt: '2025-09-05',
      capturedFrom: 'chat session 2025-09-05',
      confidence: 'inferred',
    },
  },

  browseSessions: [
    {
      sessionDate: '2026-01-22',
      categoriesBrowsed: ['whisky', 'cognac'],
      productsViewed: ['mh-glenmorangie-18', 'mh-hennessy-vs'],
      durationMinutes: 9,
      device: 'mobile',
    },
  ],

  loyalty: null,

  merkuryIdentity: {
    merkuryId: 'MRK-ID-MH-10003',
    identityTier: 'known',
    confidence: 0.91,
    resolvedAt: new Date().toISOString(),
  },

  purchaseHistory: [],
  savedPaymentMethods: [
    { id: 'pm-mh-3', type: 'card', last4: '1111', brand: 'mastercard', isDefault: true },
  ],
  shippingAddresses: [
    { id: 'addr-mh-3', name: 'Marcus Johnson', line1: '234 N Michigan Ave', city: 'Chicago', state: 'IL', postalCode: '60601', country: 'US', isDefault: true },
  ],
  recentActivity: [],
  lifetimeValue: 58,
};

// ─── Appended: Wine & Spirits Enthusiast ─────────────────────────
const appendedSpiritsEnthusiast: CustomerProfile = {
  id: 'mh-persona-appended',
  name: 'Guest',
  email: '',

  luxuryProfile: {
    stylePreference: 'classic',
    concerns: [],
    allergies: [],
    preferredBrands: [],
  },

  orders: [],
  chatSummaries: [],
  meaningfulEvents: [],
  browseSessions: [],
  loyalty: null,
  purchaseHistory: [],
  savedPaymentMethods: [],
  shippingAddresses: [],
  recentActivity: [],

  merkuryIdentity: {
    merkuryId: 'MRK-ID-MH-20001',
    identityTier: 'appended',
    confidence: 0.70,
    resolvedAt: new Date().toISOString(),
  },

  appendedProfile: {
    ageRange: '35-45',
    gender: 'male',
    householdIncome: '$150k-$250k',
    hasChildren: false,
    homeOwnership: 'own',
    educationLevel: "master's",
    interests: ['fine wine', 'spirits', 'craft cocktails', 'gastronomy'],
    lifestyleSignals: ['foodie', 'entertainer', 'luxury consumer'],
    geoRegion: 'Miami Metro',
  },
};

// ─── Anonymous Visitor ───────────────────────────────────────────
const anonymousMHVisitor: CustomerProfile = {
  id: 'mh-persona-anonymous',
  name: 'Guest',
  email: '',

  luxuryProfile: {
    stylePreference: 'classic',
    concerns: [],
    allergies: [],
    preferredBrands: [],
  },

  orders: [],
  chatSummaries: [],
  meaningfulEvents: [],
  browseSessions: [],
  loyalty: null,
  purchaseHistory: [],
  savedPaymentMethods: [],
  shippingAddresses: [],
  recentActivity: [],

  merkuryIdentity: {
    merkuryId: '',
    identityTier: 'anonymous',
    confidence: 0,
    resolvedAt: new Date().toISOString(),
  },
};

export const MH_PERSONAS: PersonaMeta[] = [
  {
    id: 'mh-laurent',
    label: 'Laurent Bertrand',
    subtitle: 'Known \u00b7 Platinum',
    traits: ['Cognac collector', '4 orders', '60th birthday tasting', '32,000 pts', 'Paradis buyer'],
    profile: laurentBertrand,
  },
  {
    id: 'mh-olivia',
    label: 'Olivia Park',
    subtitle: 'Known \u00b7 Gold',
    traits: ['Champagne enthusiast', '3 orders', 'Dinner party host', 'Food pairing lover'],
    profile: oliviaPark,
  },
  {
    id: 'mh-marcus',
    label: 'Marcus Johnson',
    subtitle: 'Known \u00b7 No Loyalty',
    traits: ['Whisky explorer', '1 order', 'Bourbon to Scotch journey', 'Cocktail curious'],
    profile: marcusJohnson,
  },
  {
    id: 'mh-appended',
    label: 'Spirits Enthusiast',
    subtitle: 'Merkury Appended Only',
    traits: ['New to brand', 'Fine wine interest', 'Gastronomy', 'Miami'],
    profile: appendedSpiritsEnthusiast,
  },
  {
    id: 'mh-anonymous',
    label: 'Anonymous Visitor',
    subtitle: 'Merkury: No Match',
    traits: ['No identity resolved', 'No history', 'Discovery mode'],
    profile: anonymousMHVisitor,
  },
];

export const MH_PERSONA_STUBS: PersonaStub[] = [
  { id: 'mh-laurent', merkuryId: 'MRK-ID-MH-10001', identityTier: 'known', defaultLabel: 'Laurent Bertrand', defaultSubtitle: 'Merkury: Matched' },
  { id: 'mh-olivia', merkuryId: 'MRK-ID-MH-10002', identityTier: 'known', defaultLabel: 'Olivia Park', defaultSubtitle: 'Merkury: Matched' },
  { id: 'mh-marcus', merkuryId: 'MRK-ID-MH-10003', identityTier: 'known', defaultLabel: 'Marcus Johnson', defaultSubtitle: 'Merkury: Matched' },
  { id: 'mh-appended', merkuryId: 'MRK-ID-MH-20001', identityTier: 'appended', defaultLabel: 'Spirits Enthusiast', defaultSubtitle: 'Merkury: Matched \u00b7 Appended Only' },
  { id: 'mh-anonymous', merkuryId: '', identityTier: 'anonymous', defaultLabel: 'Anonymous Visitor', defaultSubtitle: 'Merkury: No Match' },
];
