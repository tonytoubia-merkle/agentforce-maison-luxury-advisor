import type { CustomerProfile } from '@/types/customer';
import type { PersonaMeta, PersonaStub } from '@/mocks/customerPersonas';

// ─── Isabelle Durand: Known, VIC Platinum, High Jewelry Collector ─────
const isabelleDurand: CustomerProfile = {
  id: 'lv-persona-isabelle',
  name: 'Isabelle',
  email: 'isabelle.durand@example.com',

  luxuryProfile: {
    stylePreference: 'classic',
    concerns: ['leather goods', 'haute joaillerie', 'limited editions'],
    allergies: [],
    preferredBrands: ['HAUTE MAROQUINERIE', 'HAUTE JOAILLERIE'],
    ageRange: '40-50',
  },

  orders: [
    {
      orderId: 'ORD-2025-LV-0301',
      orderDate: '2025-04-10',
      channel: 'in-store',
      status: 'completed',
      totalAmount: 5500.00,
      lineItems: [
        { productId: 'lv-capucines-bb', productName: 'Capucines BB', quantity: 1, unitPrice: 5500.00 },
      ],
    },
    {
      orderId: 'ORD-2025-LV-0589',
      orderDate: '2025-07-22',
      channel: 'online',
      status: 'completed',
      totalAmount: 2480.00,
      lineItems: [
        { productId: 'lv-keepall-45', productName: 'Keepall Bandouliere 45', quantity: 1, unitPrice: 2480.00 },
      ],
    },
    {
      orderId: 'ORD-2025-LV-0940',
      orderDate: '2025-10-15',
      channel: 'in-store',
      status: 'completed',
      totalAmount: 845.00,
      lineItems: [
        { productId: 'lv-vivienne-pendant', productName: 'Vivienne Pendant Necklace', quantity: 1, unitPrice: 845.00 },
      ],
    },
    {
      orderId: 'ORD-2025-LV-1200',
      orderDate: '2025-12-18',
      channel: 'online',
      status: 'completed',
      totalAmount: 450.00,
      lineItems: [
        { productId: 'lv-ombre-nomade', productName: 'Ombre Nomade', quantity: 1, unitPrice: 450.00 },
      ],
    },
  ],

  chatSummaries: [
    {
      sessionDate: '2025-07-22',
      summary: 'Isabelle purchased the Keepall 45 for an upcoming trip to the Amalfi Coast. Discussed monogramming options — she chose hot stamping with her initials. Also expressed interest in the new Capucines color for next season.',
      sentiment: 'positive',
      topicsDiscussed: ['travel', 'monogramming', 'Capucines', 'seasonal colors'],
    },
    {
      sessionDate: '2025-12-18',
      summary: 'Isabelle called to order Ombre Nomade as a holiday gift for her husband. She asked about the new high jewelry collection launching in January. Mentioned her daughter\'s 18th birthday in March — interested in a special piece.',
      sentiment: 'positive',
      topicsDiscussed: ['gifting', 'fragrance', 'high jewelry', 'daughter birthday'],
    },
  ],

  meaningfulEvents: [
    {
      eventType: 'preference',
      description: 'Prefers in-store appointments for leather goods — values the tactile experience',
      capturedAt: '2025-04-10',
      agentNote: 'Schedule private appointments at flagship when possible.',
    },
    {
      eventType: 'life-event',
      description: 'Daughter turning 18 in March — looking for a milestone gift',
      capturedAt: '2025-12-18',
      agentNote: 'Recommend something meaningful: first luxury bag or jewelry piece. Budget likely $1,500-3,000.',
      metadata: { occasion: 'daughter-birthday', month: 'March' },
    },
    {
      eventType: 'intent',
      description: 'Interested in new Capucines seasonal colors and high jewelry collection',
      capturedAt: '2025-12-18',
      agentNote: 'Notify when January high jewelry drops. She responds well to exclusive previews.',
    },
  ],

  agentCapturedProfile: {
    luxuryPriority: {
      value: 'Investment collector — values craftsmanship, exclusivity, and heritage pieces',
      capturedAt: '2025-04-10',
      capturedFrom: 'chat session 2025-04-10',
      confidence: 'inferred',
    },
    giftsFor: {
      value: ['husband', 'daughter'],
      capturedAt: '2025-12-18',
      capturedFrom: 'chat session 2025-12-18',
      confidence: 'stated',
    },
    priceRange: {
      value: 'High-end collector, comfortable with $5,000+ pieces',
      capturedAt: '2025-04-10',
      capturedFrom: 'inferred from purchase pattern',
      confidence: 'inferred',
    },
  },

  browseSessions: [
    {
      sessionDate: '2026-01-20',
      categoriesBrowsed: ['handbag', 'jewelry'],
      productsViewed: ['lv-capucines-bb', 'lv-vivienne-pendant'],
      durationMinutes: 15,
      device: 'desktop',
    },
  ],

  loyalty: {
    tier: 'platinum',
    pointsBalance: 28500,
    lifetimePoints: 52000,
    memberSince: '2022-06-01',
    rewardsAvailable: [
      { name: 'Private shopping appointment', pointsCost: 10000 },
      { name: 'Exclusive trunk show invitation', pointsCost: 20000 },
    ],
    tierExpiryDate: '2027-06-01',
  },

  merkuryIdentity: {
    merkuryId: 'MRK-ID-LV-10001',
    identityTier: 'known',
    confidence: 0.99,
    resolvedAt: new Date().toISOString(),
  },

  purchaseHistory: [],
  savedPaymentMethods: [
    { id: 'pm-lv-1', type: 'card', last4: '9876', brand: 'amex', isDefault: true },
  ],
  shippingAddresses: [
    { id: 'addr-lv-1', name: 'Isabelle Durand', line1: '15 Avenue Montaigne', city: 'New York', state: 'NY', postalCode: '10065', country: 'US', isDefault: true },
  ],
  recentActivity: [],
  lifetimeValue: 9275,
};

// ─── Alexander Chen: Known, Gold, Business Traveler ──────────────
const alexanderChen: CustomerProfile = {
  id: 'lv-persona-alexander',
  name: 'Alexander',
  email: 'alexander.chen@example.com',

  luxuryProfile: {
    stylePreference: 'classic',
    concerns: ['travel pieces', 'menswear', 'business accessories'],
    allergies: [],
    preferredBrands: ['MAISON'],
    ageRange: '35-45',
  },

  orders: [
    {
      orderId: 'ORD-2025-LV-0450',
      orderDate: '2025-06-15',
      channel: 'online',
      status: 'completed',
      totalAmount: 2480.00,
      lineItems: [
        { productId: 'lv-keepall-45', productName: 'Keepall Bandouliere 45', quantity: 1, unitPrice: 2480.00 },
      ],
    },
    {
      orderId: 'ORD-2025-LV-0890',
      orderDate: '2025-09-02',
      channel: 'online',
      status: 'completed',
      totalAmount: 1080.00,
      lineItems: [
        { productId: 'lv-card-holder', productName: 'Card Holder', quantity: 1, unitPrice: 400.00 },
        { productId: 'lv-belt-initiales', productName: 'LV Initiales 40MM Belt', quantity: 1, unitPrice: 680.00 },
      ],
    },
  ],

  chatSummaries: [
    {
      sessionDate: '2025-06-15',
      summary: 'Alexander was looking for a weekend travel bag. Chose the Keepall 45 for cabin carry. Mentioned he travels to Hong Kong and London monthly for work.',
      sentiment: 'positive',
      topicsDiscussed: ['travel', 'business accessories', 'Keepall'],
    },
    {
      sessionDate: '2025-12-28',
      summary: 'Alexander asked about luggage options for a longer trip to Tokyo. He also mentioned wanting to gift something to his wife for their wedding anniversary in February.',
      sentiment: 'positive',
      topicsDiscussed: ['luggage', 'Tokyo trip', 'anniversary gift', 'women\'s leather goods'],
    },
  ],

  meaningfulEvents: [
    {
      eventType: 'life-event',
      description: 'Wedding anniversary in February — looking for a special gift for his wife',
      capturedAt: '2025-12-28',
      agentNote: 'Consider women\'s leather goods or jewelry. He mentioned she likes structured bags.',
      metadata: { occasion: 'anniversary', month: 'February', giftFor: 'wife' },
    },
    {
      eventType: 'preference',
      description: 'Travels frequently for business — Hong Kong, London, Tokyo circuit',
      capturedAt: '2025-06-15',
      agentNote: 'Travel pieces are his primary interest. Values functionality + luxury.',
    },
  ],

  agentCapturedProfile: {
    workEnvironment: {
      value: 'Finance executive, international travel monthly',
      capturedAt: '2025-06-15',
      capturedFrom: 'chat session 2025-06-15',
      confidence: 'stated',
    },
    anniversary: {
      value: 'February — wedding anniversary',
      capturedAt: '2025-12-28',
      capturedFrom: 'chat session 2025-12-28',
      confidence: 'stated',
    },
    giftsFor: {
      value: ['wife'],
      capturedAt: '2025-12-28',
      capturedFrom: 'chat session 2025-12-28',
      confidence: 'stated',
    },
  },

  browseSessions: [
    {
      sessionDate: '2026-01-25',
      categoriesBrowsed: ['travel', 'handbag'],
      productsViewed: ['lv-horizon-55', 'lv-pochette-metis'],
      durationMinutes: 10,
      device: 'mobile',
    },
  ],

  loyalty: {
    tier: 'gold',
    pointsBalance: 5600,
    lifetimePoints: 8200,
    memberSince: '2025-06-15',
    rewardsAvailable: [
      { name: 'Complimentary hot stamping', pointsCost: 3000 },
    ],
    nextTierThreshold: 15000,
    tierExpiryDate: '2026-06-15',
  },

  merkuryIdentity: {
    merkuryId: 'MRK-ID-LV-10002',
    identityTier: 'known',
    confidence: 0.96,
    resolvedAt: new Date().toISOString(),
  },

  purchaseHistory: [],
  savedPaymentMethods: [
    { id: 'pm-lv-2', type: 'card', last4: '4444', brand: 'visa', isDefault: true },
  ],
  shippingAddresses: [
    { id: 'addr-lv-2', name: 'Alexander Chen', line1: '200 Park Ave', city: 'New York', state: 'NY', postalCode: '10166', country: 'US', isDefault: true },
  ],
  recentActivity: [],
  lifetimeValue: 3560,
};

// ─── Sofia Martinez: Known, Silver, First Luxury Buyer ───────────
const sofiaMartinez: CustomerProfile = {
  id: 'lv-persona-sofia',
  name: 'Sofia',
  email: 'sofia.martinez@example.com',

  luxuryProfile: {
    stylePreference: 'classic',
    concerns: ['entry-level luxury', 'small leather goods', 'accessories'],
    allergies: [],
    preferredBrands: ['MAISON'],
    ageRange: '25-30',
  },

  orders: [
    {
      orderId: 'ORD-2026-LV-0012',
      orderDate: '2026-01-10',
      channel: 'online',
      status: 'completed',
      totalAmount: 400.00,
      lineItems: [
        { productId: 'lv-card-holder', productName: 'Card Holder', quantity: 1, unitPrice: 400.00 },
      ],
    },
  ],

  chatSummaries: [
    {
      sessionDate: '2026-01-10',
      summary: 'Sofia made her first purchase — a Monogram Eclipse card holder. She mentioned it was a gift to herself for a promotion. She asked about bags but said she was "working up to" her first one.',
      sentiment: 'positive',
      topicsDiscussed: ['first purchase', 'card holder', 'self-gift', 'bag aspirations'],
    },
  ],

  meaningfulEvents: [
    {
      eventType: 'milestone',
      description: 'First luxury purchase — card holder as self-gift for work promotion',
      capturedAt: '2026-01-10',
      agentNote: 'Nurture toward first bag. She\'s aspirational but budget-conscious. Consider Speedy or Alma.',
    },
  ],

  agentCapturedProfile: {
    luxuryPriority: {
      value: 'Aspirational first-time luxury buyer — values quality and timeless design',
      capturedAt: '2026-01-10',
      capturedFrom: 'chat session 2026-01-10',
      confidence: 'inferred',
    },
    priceRange: {
      value: 'Entry luxury — comfortable up to $2,000 for a significant piece',
      capturedAt: '2026-01-10',
      capturedFrom: 'inferred from conversation',
      confidence: 'inferred',
    },
  },

  browseSessions: [
    {
      sessionDate: '2026-01-22',
      categoriesBrowsed: ['handbag'],
      productsViewed: ['lv-speedy-25', 'lv-neverfull-mm', 'lv-alma-bb-epi'],
      durationMinutes: 20,
      device: 'mobile',
    },
  ],

  loyalty: {
    tier: 'silver',
    pointsBalance: 400,
    lifetimePoints: 400,
    memberSince: '2026-01-10',
    rewardsAvailable: [],
    nextTierThreshold: 3000,
    tierExpiryDate: '2027-01-10',
  },

  merkuryIdentity: {
    merkuryId: 'MRK-ID-LV-10003',
    identityTier: 'known',
    confidence: 0.93,
    resolvedAt: new Date().toISOString(),
  },

  purchaseHistory: [],
  savedPaymentMethods: [
    { id: 'pm-lv-3', type: 'applepay', isDefault: true },
  ],
  shippingAddresses: [
    { id: 'addr-lv-3', name: 'Sofia Martinez', line1: '456 Melrose Ave', city: 'Los Angeles', state: 'CA', postalCode: '90046', country: 'US', isDefault: true },
  ],
  recentActivity: [],
  lifetimeValue: 400,
};

// ─── Appended: Luxury Shopper (No 1P data) ───────────────────────
const appendedLuxuryShopper: CustomerProfile = {
  id: 'lv-persona-appended',
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
    merkuryId: 'MRK-ID-LV-20001',
    identityTier: 'appended',
    confidence: 0.72,
    resolvedAt: new Date().toISOString(),
  },

  appendedProfile: {
    ageRange: '35-45',
    gender: 'female',
    householdIncome: '$200k+',
    hasChildren: true,
    homeOwnership: 'own',
    educationLevel: "master's",
    interests: ['luxury fashion', 'fine dining', 'art collecting', 'travel'],
    lifestyleSignals: ['affluent urban', 'frequent traveler', 'luxury buyer'],
    geoRegion: 'San Francisco Bay Area',
  },
};

// ─── Anonymous Visitor ───────────────────────────────────────────
const anonymousLVVisitor: CustomerProfile = {
  id: 'lv-persona-anonymous',
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

export const LV_PERSONAS: PersonaMeta[] = [
  {
    id: 'lv-isabelle',
    label: 'Isabelle Durand',
    subtitle: 'Known \u00b7 VIC Platinum',
    traits: ['High jewelry collector', '4 orders', "Daughter's 18th birthday", '28,500 pts', 'Capucines lover'],
    profile: isabelleDurand,
  },
  {
    id: 'lv-alexander',
    label: 'Alexander Chen',
    subtitle: 'Known \u00b7 Gold',
    traits: ['Business traveler', '2 orders', 'Anniversary gift search', 'Finance executive'],
    profile: alexanderChen,
  },
  {
    id: 'lv-sofia',
    label: 'Sofia Martinez',
    subtitle: 'Known \u00b7 Silver',
    traits: ['First luxury buyer', '1 order', 'Browsing bags', 'Aspirational'],
    profile: sofiaMartinez,
  },
  {
    id: 'lv-appended',
    label: 'Luxury Shopper',
    subtitle: 'Merkury Appended Only',
    traits: ['New to brand', 'Luxury fashion interest', 'Affluent urban', 'SF Bay Area'],
    profile: appendedLuxuryShopper,
  },
  {
    id: 'lv-anonymous',
    label: 'Anonymous Visitor',
    subtitle: 'Merkury: No Match',
    traits: ['No identity resolved', 'No history', 'Discovery mode'],
    profile: anonymousLVVisitor,
  },
];

export const LV_PERSONA_STUBS: PersonaStub[] = [
  { id: 'lv-isabelle', merkuryId: 'MRK-ID-LV-10001', identityTier: 'known', defaultLabel: 'Isabelle Durand', defaultSubtitle: 'Merkury: Matched' },
  { id: 'lv-alexander', merkuryId: 'MRK-ID-LV-10002', identityTier: 'known', defaultLabel: 'Alexander Chen', defaultSubtitle: 'Merkury: Matched' },
  { id: 'lv-sofia', merkuryId: 'MRK-ID-LV-10003', identityTier: 'known', defaultLabel: 'Sofia Martinez', defaultSubtitle: 'Merkury: Matched' },
  { id: 'lv-appended', merkuryId: 'MRK-ID-LV-20001', identityTier: 'appended', defaultLabel: 'Luxury Shopper', defaultSubtitle: 'Merkury: Matched \u00b7 Appended Only' },
  { id: 'lv-anonymous', merkuryId: '', identityTier: 'anonymous', defaultLabel: 'Anonymous Visitor', defaultSubtitle: 'Merkury: No Match' },
];
