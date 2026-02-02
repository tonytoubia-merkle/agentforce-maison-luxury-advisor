import type { AgentResponse, UIAction } from '@/types/agent';
import type { CustomerSessionContext } from '@/types/customer';
import type { MaisonId } from '@/types/maison';
import { getProducts, findProduct } from '@/mocks/maisonData';

interface ConversationState {
  lastShownProductIds: string[];
  currentProductId: string | null;
  shownCategories: string[];
  hasGreeted: boolean;
}

const state: ConversationState = {
  lastShownProductIds: [],
  currentProductId: null,
  shownCategories: [],
  hasGreeted: false,
};

let customerCtx: CustomerSessionContext | null = null;
let activeMaison: MaisonId = 'lv';

export function setMaisonMockContext(ctx: CustomerSessionContext | null, maisonId: MaisonId): void {
  customerCtx = ctx;
  activeMaison = maisonId;
  state.lastShownProductIds = [];
  state.currentProductId = null;
  state.shownCategories = [];
  state.hasGreeted = false;
}

export interface MaisonMockSnapshot {
  state: ConversationState;
  customerCtx: CustomerSessionContext | null;
  maisonId: MaisonId;
}

export function getMaisonMockSnapshot(): MaisonMockSnapshot {
  return { state: { ...state }, customerCtx, maisonId: activeMaison };
}

export function restoreMaisonMockSnapshot(snapshot: MaisonMockSnapshot): void {
  Object.assign(state, snapshot.state);
  customerCtx = snapshot.customerCtx;
  activeMaison = snapshot.maisonId;
}

const find = (id: string) => findProduct(activeMaison, id);
const products = () => getProducts(activeMaison);

// ─── Welcome responses ───────────────────────────────────────────

function generateLVWelcome(): AgentResponse | null {
  if (state.hasGreeted) return null;
  state.hasGreeted = true;
  if (!customerCtx) return null;

  const tier = customerCtx.identityTier;

  if (tier === 'known') {
    const hasAnniversary = customerCtx.meaningfulEvents?.some((e) => e.toLowerCase().includes('anniversary'));
    const hasBirthday = customerCtx.meaningfulEvents?.some((e) => e.toLowerCase().includes('birthday'));
    const loyaltyInfo = customerCtx.loyaltyTier
      ? `${customerCtx.loyaltyTier} member${customerCtx.loyaltyPoints ? ` with ${customerCtx.loyaltyPoints.toLocaleString()} points` : ''}`
      : null;
    const isNotLoyalty = !customerCtx.loyaltyTier;
    const hasBrowseBags = customerCtx.browseInterests?.some((b) => /handbag|bag|speedy|neverfull|alma|capucines/i.test(b));
    const hasBrowseTravel = customerCtx.browseInterests?.some((b) => /travel|keepall|horizon|luggage/i.test(b));

    // Isabelle-like: platinum + birthday event + collector
    if (hasBirthday && loyaltyInfo?.includes('platinum')) {
      return {
        sessionId: 'mock-session',
        message: `Welcome back, ${customerCtx.name}. As a ${loyaltyInfo}, I have some exclusive pieces to show you — and I remember you were looking for something special for March.`,
        uiDirective: {
          action: 'WELCOME_SCENE' as UIAction,
          payload: {
            welcomeMessage: `Welcome back, ${customerCtx.name}.`,
            welcomeSubtext: `Your private selection is ready. Let me show you our latest arrivals and that special piece we discussed.`,
            sceneContext: {
              setting: 'boutique',
              mood: 'exclusive-vip',
              generateBackground: true,
              backgroundPrompt: 'Luxurious private boutique salon, warm golden lighting, marble floors, exclusive leather goods display, haute couture atmosphere',
            },
          },
        },
        suggestedActions: ['Show me new arrivals', 'Help me find a gift', 'Show me Capucines'],
        confidence: 0.98,
      };
    }

    // Alexander-like: anniversary gift + travel
    if (hasAnniversary) {
      return {
        sessionId: 'mock-session',
        message: `Welcome back, ${customerCtx.name}. I recall you mentioned a special anniversary coming up. Shall we find the perfect gift?`,
        uiDirective: {
          action: 'WELCOME_SCENE' as UIAction,
          payload: {
            welcomeMessage: `Welcome back, ${customerCtx.name}.`,
            welcomeSubtext: `Let me curate something exceptional for your anniversary.`,
            sceneContext: {
              setting: 'boutique',
              mood: 'intimate-gifting',
              generateBackground: true,
              backgroundPrompt: 'Intimate luxury boutique setting, soft warm lighting, gift wrapping station, elegant leather goods display, romantic atmosphere',
            },
          },
        },
        suggestedActions: ['Help me find a gift for her', 'Show me leather goods', 'Show me travel pieces'],
        confidence: 0.97,
      };
    }

    // Sofia-like: aspirational new buyer browsing bags
    if (hasBrowseBags && isNotLoyalty) {
      return {
        sessionId: 'mock-session',
        message: `Welcome back, ${customerCtx.name}! I noticed you've been exploring our handbag collection. Ready to find your perfect piece?`,
        uiDirective: {
          action: 'WELCOME_SCENE' as UIAction,
          payload: {
            welcomeMessage: `Welcome back, ${customerCtx.name}!`,
            welcomeSubtext: `Your journey with the Maison continues. Let me help you find the one.`,
            sceneContext: {
              setting: 'boutique',
              mood: 'discovery',
              generateBackground: true,
              backgroundPrompt: 'Bright modern luxury boutique, curated handbag display, natural light, welcoming atmosphere, leather goods showcase',
            },
          },
        },
        suggestedActions: ['Show me handbags', 'Help me choose my first bag', 'Show me what\'s new'],
        confidence: 0.96,
      };
    }

    // Generic known with loyalty
    const loyaltySubtext = loyaltyInfo
      ? `As a ${loyaltyInfo}, you have access to our exclusive selections.`
      : "Let me show you our latest creations.";
    return {
      sessionId: 'mock-session',
      message: `Welcome back, ${customerCtx.name}. It's a pleasure to see you again.`,
      uiDirective: {
        action: 'WELCOME_SCENE' as UIAction,
        payload: {
          welcomeMessage: `Welcome back, ${customerCtx.name}.`,
          welcomeSubtext: loyaltySubtext,
          sceneContext: {
            setting: 'boutique',
            mood: 'personalized-welcome',
            generateBackground: true,
            backgroundPrompt: 'Elegant luxury boutique interior, warm ambient lighting, Parisian aesthetic, high-end leather goods display',
          },
        },
      },
      suggestedActions: ['Show me new arrivals', 'Restock my favorites', 'Show me something special'],
      confidence: 0.95,
    };
  }

  if (tier === 'appended') {
    const interests = customerCtx.appendedInterests || [];
    const isLuxury = interests.some((i) => i.includes('luxury') || i.includes('fashion'));
    return {
      sessionId: 'mock-session',
      message: "Welcome to the Maison. I'm here to help you discover our world of exceptional craftsmanship.",
      uiDirective: {
        action: 'WELCOME_SCENE' as UIAction,
        payload: {
          welcomeMessage: 'Welcome.',
          welcomeSubtext: "Your personal luxury advisor \u2014 let me guide you through our collections.",
          sceneContext: { setting: 'neutral', generateBackground: false },
        },
      },
      suggestedActions: [
        isLuxury ? 'Show me iconic pieces' : 'Show me leather goods',
        'Help me find a gift',
        'Show me bestsellers',
      ],
      confidence: 0.9,
    };
  }

  return {
    sessionId: 'mock-session',
    message: "Welcome to the Maison. How may I assist you today?",
    uiDirective: {
      action: 'WELCOME_SCENE' as UIAction,
      payload: {
        welcomeMessage: 'Welcome.',
        welcomeSubtext: 'Your Maison Luxury Advisor is ready to help you discover something extraordinary.',
        sceneContext: { setting: 'neutral', generateBackground: false },
      },
    },
    suggestedActions: ['Show me leather goods', 'I need a travel piece', 'What do you recommend?'],
    confidence: 0.85,
  };
}

function generateMHWelcome(): AgentResponse | null {
  if (state.hasGreeted) return null;
  state.hasGreeted = true;
  if (!customerCtx) return null;

  const tier = customerCtx.identityTier;

  if (tier === 'known') {
    const hasBirthday = customerCtx.meaningfulEvents?.some((e) => e.toLowerCase().includes('birthday'));
    const hasTasting = customerCtx.meaningfulEvents?.some((e) => e.toLowerCase().includes('tasting'));
    const loyaltyInfo = customerCtx.loyaltyTier
      ? `${customerCtx.loyaltyTier} member${customerCtx.loyaltyPoints ? ` with ${customerCtx.loyaltyPoints.toLocaleString()} points` : ''}`
      : null;
    const isNotLoyalty = !customerCtx.loyaltyTier;
    const hasBrowseChampagne = customerCtx.browseInterests?.some((b) => /champagne|dom|mo.t|veuve|ruinart/i.test(b));
    const hasBrowseWhisky = customerCtx.browseInterests?.some((b) => /whisky|scotch|glenmorangie|ardbeg/i.test(b));
    const hasPartyEvent = customerCtx.meaningfulEvents?.some((e) => e.toLowerCase().includes('party'));

    // Laurent-like: platinum + birthday tasting
    if ((hasBirthday || hasTasting) && loyaltyInfo?.includes('platinum')) {
      return {
        sessionId: 'mock-session',
        message: `Welcome back, ${customerCtx.name}. As a ${loyaltyInfo}, I have some exceptional selections for you \u2014 and I haven't forgotten about that special occasion in March.`,
        uiDirective: {
          action: 'WELCOME_SCENE' as UIAction,
          payload: {
            welcomeMessage: `Welcome back, ${customerCtx.name}.`,
            welcomeSubtext: `Your private cellar selections await. Let me help you plan that extraordinary celebration.`,
            sceneContext: {
              setting: 'cellar',
              mood: 'exclusive-tasting',
              generateBackground: true,
              backgroundPrompt: 'Luxurious private wine cellar, warm candlelight, oak barrels, crystal decanters, cognac tasting atmosphere, exclusive VIP setting',
            },
          },
        },
        suggestedActions: ['Show me rare cognacs', 'Plan my tasting event', 'Show me new vintages'],
        confidence: 0.98,
      };
    }

    // Olivia-like: entertaining + champagne enthusiast
    if (hasPartyEvent || hasBrowseChampagne) {
      return {
        sessionId: 'mock-session',
        message: `Welcome back, ${customerCtx.name}! ${hasBrowseChampagne ? "I see you've been exploring our champagnes" : "Ready for your next celebration"}?`,
        uiDirective: {
          action: 'WELCOME_SCENE' as UIAction,
          payload: {
            welcomeMessage: `Welcome back, ${customerCtx.name}!`,
            welcomeSubtext: `Let me help you find the perfect selection for your next gathering.`,
            sceneContext: {
              setting: 'lounge',
              mood: 'celebration',
              generateBackground: true,
              backgroundPrompt: 'Elegant champagne lounge, soft ambient lighting, crystal flutes, ice buckets, sophisticated entertaining atmosphere',
            },
          },
        },
        suggestedActions: ['Show me champagnes', 'Help me plan for a dinner party', 'Recommend a food pairing'],
        confidence: 0.96,
      };
    }

    // Marcus-like: explorer + whisky curiosity
    if (hasBrowseWhisky && isNotLoyalty) {
      return {
        sessionId: 'mock-session',
        message: `Welcome back, ${customerCtx.name}! Ready to continue your whisky journey?`,
        uiDirective: {
          action: 'WELCOME_SCENE' as UIAction,
          payload: {
            welcomeMessage: `Welcome back, ${customerCtx.name}!`,
            welcomeSubtext: `Let me introduce you to some new expressions that match your evolving palate.`,
            sceneContext: {
              setting: 'tasting-room',
              mood: 'exploration',
              generateBackground: true,
              backgroundPrompt: 'Cozy whisky tasting room, warm wood paneling, leather armchairs, amber-lit bar, single malt collection display',
            },
          },
        },
        suggestedActions: ['Show me single malts', 'I want to try cognac', 'Recommend a cocktail'],
        confidence: 0.96,
      };
    }

    const loyaltySubtext = loyaltyInfo
      ? `As a ${loyaltyInfo}, you have access to our exclusive allocations.`
      : "Let me guide you through our collections today.";
    return {
      sessionId: 'mock-session',
      message: `Welcome back, ${customerCtx.name}. A pleasure to see you again.`,
      uiDirective: {
        action: 'WELCOME_SCENE' as UIAction,
        payload: {
          welcomeMessage: `Welcome back, ${customerCtx.name}.`,
          welcomeSubtext: loyaltySubtext,
          sceneContext: {
            setting: 'lounge',
            mood: 'personalized-welcome',
            generateBackground: true,
            backgroundPrompt: 'Refined spirits lounge, warm amber lighting, crystal decanters, elegant bar atmosphere',
          },
        },
      },
      suggestedActions: ['Show me what\'s new', 'Restock my favorites', 'Recommend something special'],
      confidence: 0.95,
    };
  }

  if (tier === 'appended') {
    return {
      sessionId: 'mock-session',
      message: "Welcome! I'm here to help you discover our exceptional collection of fine spirits and champagnes.",
      uiDirective: {
        action: 'WELCOME_SCENE' as UIAction,
        payload: {
          welcomeMessage: 'Welcome.',
          welcomeSubtext: "Your personal spirits advisor \u2014 let me guide you through our world of fine champagne, cognac, and whisky.",
          sceneContext: { setting: 'neutral', generateBackground: false },
        },
      },
      suggestedActions: ['Show me champagnes', 'Help me find a gift', 'What do you recommend?'],
      confidence: 0.9,
    };
  }

  return {
    sessionId: 'mock-session',
    message: "Welcome! Your spirits advisor is here to help you discover something extraordinary.",
    uiDirective: {
      action: 'WELCOME_SCENE' as UIAction,
      payload: {
        welcomeMessage: 'Welcome.',
        welcomeSubtext: 'Discover our world of fine champagne, cognac, and spirits.',
        sceneContext: { setting: 'neutral', generateBackground: false },
      },
    },
    suggestedActions: ['Show me champagnes', 'Show me cognacs', 'What do you recommend?'],
    confidence: 0.85,
  };
}

function generateWelcome(): AgentResponse | null {
  return activeMaison === 'lv' ? generateLVWelcome() : generateMHWelcome();
}

// ─── LV Response Patterns ────────────────────────────────────────

const LV_PATTERNS: { pattern: RegExp; response: () => Partial<AgentResponse> }[] = [
  {
    pattern: /handbag|bag|tote|purse|leather good/i,
    response: () => {
      const bags = products().filter((p) => (p.category as string) === 'handbag');
      state.lastShownProductIds = bags.map((p) => p.id);
      return {
        message: "Let me show you our leather goods collection. Each piece is crafted by master artisans with the finest materials.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: bags.slice(0, 4),
            sceneContext: { setting: 'boutique' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Tell me about the Capucines', 'Show me the Speedy', 'I need something for travel'],
      };
    },
  },
  {
    pattern: /neverfull|tote/i,
    response: () => {
      const p = find('lv-neverfull-mm')!;
      state.currentProductId = p.id;
      return {
        message: `The ${p.name} is our most iconic tote \u2014 timeless Monogram canvas with natural cowhide that develops a beautiful patina over time. The removable pochette adds versatility.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: { products: [p], sceneContext: { setting: 'boutique' as any, generateBackground: false } },
        },
        suggestedActions: ['Add to bag', 'Show me the Speedy instead', 'Can I personalize it?'],
      };
    },
  },
  {
    pattern: /speedy/i,
    response: () => {
      const p = find('lv-speedy-25')!;
      state.currentProductId = p.id;
      return {
        message: `The ${p.name} is a true icon \u2014 compact yet spacious, with the added convenience of a removable strap for crossbody wear. It transitions effortlessly from day to evening.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: { products: [p], sceneContext: { setting: 'boutique' as any, generateBackground: false } },
        },
        suggestedActions: ['Add to bag', 'Show me the Neverfull', 'What about the Alma?'],
      };
    },
  },
  {
    pattern: /capucines|haute maroquinerie|high.end|investment|special|artisan/i,
    response: () => {
      const p = find('lv-capucines-bb')!;
      state.currentProductId = p.id;
      return {
        message: `The Capucines BB is from our Haute Maroquinerie collection \u2014 hand-finished by our most experienced artisans in full-grain Taurillon leather. An investment piece that only grows more beautiful with time.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: { products: [p], sceneContext: { setting: 'boutique' as any, generateBackground: false } },
        },
        suggestedActions: ['Add to bag', 'Tell me about the craftsmanship', 'Show me other investment pieces'],
      };
    },
  },
  {
    pattern: /travel|keepall|luggage|trip|weekend|cabin/i,
    response: () => {
      const travelPieces = products().filter((p) => (p.category as string) === 'travel');
      state.lastShownProductIds = travelPieces.map((p) => p.id);
      return {
        message: "Travel is in our heritage. The Keepall is the legendary weekend companion, while the Horizon rolling luggage offers modern luxury for the frequent traveler.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: travelPieces,
            sceneContext: { setting: 'travel' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Tell me about the Keepall', 'Show me the Horizon luggage', 'Can I monogram it?'],
      };
    },
  },
  {
    pattern: /wallet|card holder|small leather|slg/i,
    response: () => {
      const slg = products().filter((p) => (p.category as string) === 'wallet');
      state.lastShownProductIds = slg.map((p) => p.id);
      return {
        message: "Our small leather goods are perfect as gifts or personal essentials. The Zippy Wallet offers generous organization, while the Card Holder is the ultimate compact companion.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: slg,
            sceneContext: { setting: 'boutique' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Add to bag', 'Show me the card holder', 'I want something for a gift'],
      };
    },
  },
  {
    pattern: /jewelry|necklace|bracelet|pendant|ring/i,
    response: () => {
      const jewelry = products().filter((p) => (p.category as string) === 'jewelry');
      state.lastShownProductIds = jewelry.map((p) => p.id);
      return {
        message: "Our fine jewelry collection brings the Maison's creative vision to precious metals and stones. The Vivienne pendant and Nanogram cuff are signature pieces that pair beautifully with any look.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: jewelry,
            sceneContext: { setting: 'boutique' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Tell me about the Vivienne', 'Show me the Nanogram cuff', 'I\'m looking for a gift'],
      };
    },
  },
  {
    pattern: /belt|accessori/i,
    response: () => {
      const accessories = products().filter((p) => (p.category as string) === 'accessory');
      state.lastShownProductIds = accessories.map((p) => p.id);
      return {
        message: "Our accessories embody the Maison's savoir-faire. The reversible Initiales belt offers two looks in one, and our silk scarves are hand-finished works of art.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: accessories,
            sceneContext: { setting: 'boutique' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Show me the belt', 'Tell me about the silk scarf', 'Show me leather goods'],
      };
    },
  },
  {
    pattern: /fragrance|perfume|scent|ombre nomade|imagination/i,
    response: () => {
      const fragrances = products().filter((p) => p.category === 'fragrance');
      state.lastShownProductIds = fragrances.map((p) => p.id);
      return {
        message: "Our Les Parfums collection. Ombre Nomade is a captivating oud masterpiece \u2014 deep, smoky, and hypnotic. Imagination is radiant citrus and tea \u2014 pure optimism in a bottle.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: fragrances,
            sceneContext: { setting: 'bedroom' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Tell me about Ombre Nomade', 'I prefer fresh scents', 'This would make a great gift'],
      };
    },
  },
  {
    pattern: /gift|present|occasion|birthday|anniversary/i,
    response: () => {
      const giftPicks = [find('lv-silk-scarf'), find('lv-card-holder'), find('lv-vivienne-pendant'), find('lv-zippy-wallet')].filter(Boolean) as any[];
      state.lastShownProductIds = giftPicks.map((p: any) => p.id);
      return {
        message: "I've curated our most giftable selections \u2014 from silk scarves to fine jewelry. Each comes beautifully presented in our signature packaging. Shall I help you narrow it down?",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: giftPicks,
            sceneContext: { setting: 'boutique' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Gift for a woman', 'Gift for a man', 'Show me personalization options'],
      };
    },
  },
  {
    pattern: /monogram|personal|hot stamp|initial|engrav/i,
    response: () => ({
      message: "Personalization is at the heart of the Maison. We offer hot stamping of initials on leather goods, bespoke color combinations on select pieces, and mon monogram customization. Would you like to personalize something?",
      suggestedActions: ['Personalize a bag', 'Show me monogram options', 'What can be personalized?'],
    }),
  },
  {
    pattern: /first bag|first piece|start|entry|begin|new to/i,
    response: () => {
      const starter = [find('lv-speedy-25'), find('lv-neverfull-mm'), find('lv-alma-bb-epi')].filter(Boolean) as any[];
      state.lastShownProductIds = starter.map((p: any) => p.id);
      return {
        message: "These are our most beloved icons \u2014 each a perfect first piece. The Speedy is timeless and compact, the Neverfull is endlessly versatile, and the Alma in Epi leather offers understated elegance.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: starter,
            sceneContext: { setting: 'boutique' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Tell me about the Speedy', 'I like the Neverfull', 'Which is best for everyday?'],
      };
    },
  },
];

// ─── MH Response Patterns ────────────────────────────────────────

const MH_PATTERNS: { pattern: RegExp; response: () => Partial<AgentResponse> }[] = [
  {
    pattern: /champagne|bubbly|sparkling|celebration|toast/i,
    response: () => {
      const champagnes = products().filter((p) => (p.category as string) === 'champagne');
      state.lastShownProductIds = champagnes.map((p) => p.id);
      return {
        message: "Step into our champagne collection. From the iconic Dom P\u00e9rignon to the everyday elegance of Mo\u00ebt Imp\u00e9rial, each bottle tells a story of terroir and time.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: champagnes.slice(0, 4),
            sceneContext: { setting: 'lounge' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Tell me about Dom P\u00e9rignon', 'Show me ros\u00e9 champagnes', 'What pairs well with seafood?'],
      };
    },
  },
  {
    pattern: /dom p.rignon|dp|prestige cuvee/i,
    response: () => {
      const dp = products().filter((p) => p.brand === 'DOM P\u00c9RIGNON');
      state.lastShownProductIds = dp.map((p) => p.id);
      return {
        message: "Dom P\u00e9rignon \u2014 the quintessence of champagne. The 2015 Vintage is radiant and intense, while the 2012 Ros\u00e9 is an extraordinary expression of Pinot Noir. Both are exceptional.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: dp,
            sceneContext: { setting: 'cellar' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Add the Vintage', 'Tell me about the Ros\u00e9', 'Show me all champagnes'],
      };
    },
  },
  {
    pattern: /cognac|hennessy|brandy|after dinner|digestif/i,
    response: () => {
      const cognacs = products().filter((p) => (p.category as string) === 'cognac');
      state.lastShownProductIds = cognacs.map((p) => p.id);
      return {
        message: "Hennessy \u2014 the world's finest cognac house. From the bold versatility of V.S to the ethereal complexity of Paradis, each expression represents centuries of blending expertise.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: cognacs,
            sceneContext: { setting: 'cellar' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Tell me about X.O', 'Show me Paradis', 'What\'s good for cocktails?'],
      };
    },
  },
  {
    pattern: /xo|extra old/i,
    response: () => {
      const p = find('mh-hennessy-xo')!;
      state.currentProductId = p.id;
      return {
        message: `${p.name} \u2014 the original Extra Old. A blend of over 100 eaux-de-vie aged at least 10 years. Rich, spicy, intense \u2014 with layers of candied fruit, dark chocolate, and leather. Best enjoyed neat or with a single ice sphere.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: { products: [p], sceneContext: { setting: 'cellar' as any, generateBackground: false } },
        },
        suggestedActions: ['Add to bag', 'Show me the gift set', 'Tell me about Paradis'],
      };
    },
  },
  {
    pattern: /paradis|rare|collector|ultra.?premium/i,
    response: () => {
      const p = find('mh-hennessy-paradis')!;
      state.currentProductId = p.id;
      return {
        message: `${p.name} \u2014 an ethereal masterpiece. Over 100 rare eaux-de-vie, some dating to the 19th century. Silky jasmine, honey, and dried fruit in perfect harmony. Truly extraordinary.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: { products: [p], sceneContext: { setting: 'cellar' as any, generateBackground: false } },
        },
        suggestedActions: ['Add to bag', 'Show me the X.O instead', 'Is this good for a gift?'],
      };
    },
  },
  {
    pattern: /whisky|scotch|single malt|highland|islay/i,
    response: () => {
      const whiskies = products().filter((p) => (p.category as string) === 'whisky');
      state.lastShownProductIds = whiskies.map((p) => p.id);
      return {
        message: "From the floral elegance of Glenmorangie to the bold peat of Ardbeg \u2014 two distinct expressions of Scotland's finest. Which style speaks to you?",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: whiskies,
            sceneContext: { setting: 'tasting-room' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Tell me about Glenmorangie', 'I like smoky flavors', 'What\'s good for beginners?'],
      };
    },
  },
  {
    pattern: /glenmorangie|highland|fruity|floral/i,
    response: () => {
      const p = find('mh-glenmorangie-18')!;
      state.currentProductId = p.id;
      return {
        message: `${p.name} \u2014 eighteen years of patience rewarded. Rich and floral with dried apricot, orange blossom, and dark chocolate. Finished in Oloroso sherry casks for extraordinary depth.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: { products: [p], sceneContext: { setting: 'tasting-room' as any, generateBackground: false } },
        },
        suggestedActions: ['Add to bag', 'I prefer something smoky', 'Show me cognac instead'],
      };
    },
  },
  {
    pattern: /ardbeg|peat|smoky|islay/i,
    response: () => {
      const p = find('mh-ardbeg-10')!;
      state.currentProductId = p.id;
      return {
        message: `${p.name} \u2014 the definitive peated Islay malt. Layers of espresso, dark chocolate, and maritime salinity beneath that signature smoke. Surprisingly balanced and endlessly complex.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: { products: [p], sceneContext: { setting: 'tasting-room' as any, generateBackground: false } },
        },
        suggestedActions: ['Add to bag', 'Show me something lighter', 'What cocktails can I make?'],
      };
    },
  },
  {
    pattern: /wine|ros.?|sauvignon|white wine|red wine/i,
    response: () => {
      const wines = products().filter((p) => (p.category as string) === 'wine');
      state.lastShownProductIds = wines.map((p) => p.id);
      return {
        message: "From the benchmark Cloudy Bay Sauvignon Blanc to the iconic Whispering Angel Ros\u00e9 \u2014 wines that define their regions. Perfect for summer entertaining or casual elegance.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: wines,
            sceneContext: { setting: 'lounge' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Tell me about Cloudy Bay', 'I love ros\u00e9', 'What pairs well with grilled fish?'],
      };
    },
  },
  {
    pattern: /gift|present|occasion|birthday|anniversary|set/i,
    response: () => {
      const giftSets = products().filter((p) => (p.category as string) === 'gift-set');
      state.lastShownProductIds = giftSets.map((p) => p.id);
      return {
        message: "Our gift collections are crafted for memorable moments. The Hennessy X.O Gift Set includes crystal tasting glasses, and our Champagne Discovery Collection offers a journey through three prestigious houses.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: giftSets,
            sceneContext: { setting: 'lounge' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Show me the X.O gift set', 'The champagne collection is perfect', 'Can you gift wrap?'],
      };
    },
  },
  {
    pattern: /cocktail|mix|drink|recipe/i,
    response: () => {
      const cocktailBases = [find('mh-hennessy-vs'), find('mh-moet-rose')].filter(Boolean) as any[];
      state.lastShownProductIds = cocktailBases.map((p: any) => p.id);
      return {
        message: "Hennessy V.S is the ultimate cocktail cognac \u2014 try a Hennessy Sidecar or a French 75 twist. Mo\u00ebt Ros\u00e9 makes a stunning Champagne cocktail or bellini base.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: cocktailBases,
            sceneContext: { setting: 'lounge' as any, generateBackground: false },
          },
        },
        suggestedActions: ['Get the Hennessy V.S', 'Tell me a cocktail recipe', 'Show me something for sipping'],
      };
    },
  },
  {
    pattern: /pair|food|dinner|seafood|cheese|chocolate/i,
    response: () => ({
      message: "Excellent question! For seafood, I'd suggest Ruinart Blanc de Blancs or Cloudy Bay. For rich meats, Hennessy X.O is extraordinary. For chocolate desserts, Dom P\u00e9rignon Ros\u00e9 creates magic. What are you serving?",
      suggestedActions: ['Pairing for seafood', 'Pairing for steak', 'Pairing for dessert'],
    }),
  },
  {
    pattern: /veuve|yellow label/i,
    response: () => {
      const p = find('mh-veuve-clicquot-brut')!;
      state.currentProductId = p.id;
      return {
        message: `${p.name} \u2014 the gold standard of non-vintage champagne. Full-bodied with a toasty, biscuity character balanced by fresh fruit and a long, silky finish. Iconic for a reason.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: { products: [p], sceneContext: { setting: 'lounge' as any, generateBackground: false } },
        },
        suggestedActions: ['Add to bag', 'Show me the ros\u00e9 version', 'What pairs well with it?'],
      };
    },
  },
  {
    pattern: /ruinart|blanc de blanc/i,
    response: () => {
      const p = find('mh-ruinart-blanc-de-blancs')!;
      state.currentProductId = p.id;
      return {
        message: `${p.name} \u2014 from the oldest established champagne house. Pure Chardonnay elegance \u2014 crystalline, with notes of citrus, white peach, and hazelnut. Remarkably refined and perfect with seafood.`,
        uiDirective: {
          action: 'SHOW_PRODUCT' as UIAction,
          payload: { products: [p], sceneContext: { setting: 'lounge' as any, generateBackground: false } },
        },
        suggestedActions: ['Add to bag', 'Compare with Mo\u00ebt', 'What food pairings do you suggest?'],
      };
    },
  },
];

// ─── Shared patterns ─────────────────────────────────────────────

const SHARED_PATTERNS: { pattern: RegExp; response: () => Partial<AgentResponse> }[] = [
  {
    pattern: /restock|running low|refill|favorite|my (product|order)/i,
    response: () => {
      if (customerCtx?.recentPurchases?.length) {
        const uniqueIds = [...new Set(customerCtx.recentPurchases)];
        const prods = uniqueIds.map((id) => find(id)).filter(Boolean) as any[];
        if (prods.length) {
          state.lastShownProductIds = prods.map((p: any) => p.id);
          return {
            message: `Here are your recent selections, ${customerCtx.name}. Shall I arrange a reorder?`,
            uiDirective: {
              action: 'SHOW_PRODUCTS' as UIAction,
              payload: {
                products: prods,
                sceneContext: { setting: (activeMaison === 'lv' ? 'boutique' : 'lounge') as any, generateBackground: false },
              },
            },
            suggestedActions: ['Reorder all', 'Show me something new', 'Just the first one'],
          };
        }
      }
      return {
        message: "I'd love to help you restock! What would you like to reorder?",
        suggestedActions: activeMaison === 'lv'
          ? ['My leather goods', 'Fragrances', 'Show me everything']
          : ['My champagnes', 'My cognacs', 'Show me everything'],
      };
    },
  },
  {
    pattern: /recommend|what should|suggest|what do you|for me|bestseller|new|what.?s new/i,
    response: () => {
      const allProds = products();
      const picks = allProds.sort((a, b) => (b.personalizationScore || 0) - (a.personalizationScore || 0)).slice(0, 4);
      state.lastShownProductIds = picks.map((p) => p.id);
      const setting = activeMaison === 'lv' ? 'boutique' : 'lounge';
      return {
        message: activeMaison === 'lv'
          ? "Here are my top recommendations \u2014 from iconic leather goods to fine jewelry, each piece embodies the Maison's exceptional craftsmanship."
          : "Here are my curated selections \u2014 from prestige champagne to rare cognac, each bottle represents the finest in its category.",
        uiDirective: {
          action: 'SHOW_PRODUCTS' as UIAction,
          payload: {
            products: picks,
            sceneContext: { setting: setting as any, generateBackground: false },
          },
        },
        suggestedActions: activeMaison === 'lv'
          ? ['Show me leather goods', 'Show me jewelry', 'Show me fragrances']
          : ['Show me champagnes', 'Show me cognacs', 'Show me whisky'],
      };
    },
  },
  {
    pattern: /buy|purchase|add to (bag|cart)|get (it|this|both|all|the|them)/i,
    response: () => ({
      message: "Excellent choice. I'll arrange that for you.",
      uiDirective: {
        action: 'INITIATE_CHECKOUT' as UIAction,
        payload: { checkoutData: { products: [], useStoredPayment: true } },
      },
      suggestedActions: [],
    }),
  },
  {
    pattern: /thank|thanks|bye|goodbye|merci/i,
    response: () => ({
      message: activeMaison === 'lv'
        ? "It has been my pleasure assisting you. Enjoy your selections \u2014 and welcome back anytime."
        : "It has been a pleasure. Enjoy \u2014 and \u00e0 votre sant\u00e9!",
      uiDirective: {
        action: 'RESET_SCENE' as UIAction,
        payload: {},
      },
      suggestedActions: [],
    }),
  },
  {
    pattern: /hi|hello|hey|good (morning|afternoon|evening)|bonjour/i,
    response: () => {
      const welcome = generateWelcome();
      if (welcome) return welcome;
      return {
        message: activeMaison === 'lv'
          ? "Welcome to the Maison. How may I assist you today?"
          : "Welcome. What may I help you discover today?",
        suggestedActions: activeMaison === 'lv'
          ? ['Show me leather goods', 'Show me travel pieces', 'I need a gift']
          : ['Show me champagnes', 'Show me cognacs', 'I need a gift'],
      };
    },
  },
];

export const generateMaisonMockResponse = async (message: string): Promise<AgentResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

  if (message === '[WELCOME]' || message.startsWith('[WELCOME]')) {
    const welcome = generateWelcome();
    if (welcome) return welcome;
  }

  const patterns = activeMaison === 'lv' ? [...LV_PATTERNS, ...SHARED_PATTERNS] : [...MH_PATTERNS, ...SHARED_PATTERNS];

  for (const { pattern, response } of patterns) {
    if (message.match(pattern)) {
      const result = response();
      return {
        sessionId: 'mock-session',
        message: result.message!,
        uiDirective: result.uiDirective,
        suggestedActions: result.suggestedActions || [],
        confidence: result.confidence || 0.95,
      };
    }
  }

  return {
    sessionId: 'mock-session',
    message: activeMaison === 'lv'
      ? "I'd be delighted to help. I can show you leather goods, travel pieces, jewelry, fragrances, or accessories. What interests you?"
      : "I'd be delighted to help. I can show you champagnes, cognacs, whiskies, wines, or curated gift sets. What interests you?",
    suggestedActions: activeMaison === 'lv'
      ? ['Show me leather goods', 'Show me travel pieces', 'Show me jewelry', 'I need a gift']
      : ['Show me champagnes', 'Show me cognacs', 'Show me whiskies', 'I need a gift'],
    confidence: 0.8,
  };
};
