#!/usr/bin/env node

/**
 * Generate Product2 records for Salesforce import.
 * Creates the exact products from both maisons plus additional catalog depth.
 *
 * Usage:
 *   node scripts/generate-luxury-products.js > data/Product2.json
 *   node scripts/generate-luxury-products.js --extra 50 > data/Product2.json
 *
 * The --extra flag generates additional random products beyond the core catalog.
 * Deploy with: sf data import tree --file data/Product2.json --target-org my-org
 */

const extraCount = parseInt(process.argv.find(a => a.startsWith('--extra='))?.split('=')[1] || '0');

// ─── Core La Maison products (match src/mocks/lv/products.ts) ──────
const LV_PRODUCTS = [
  { id: 'lv-neverfull-mm', name: 'Neverfull MM', brand: 'MAISON', subBrand: 'MAISON', category: 'Handbag', price: 2030, desc: 'Iconic Monogram canvas tote with natural cowhide trim and removable pochette.', isTravel: false },
  { id: 'lv-speedy-25', name: 'Speedy Bandouliere 25', brand: 'MAISON', subBrand: 'MAISON', category: 'Handbag', price: 1960, desc: 'Compact Monogram icon with adjustable crossbody strap.', isTravel: false },
  { id: 'lv-capucines-bb', name: 'Capucines BB', brand: 'HAUTE MAROQUINERIE', subBrand: 'HAUTE MAROQUINERIE', category: 'Handbag', price: 5500, desc: 'Artisan-crafted Taurillon leather with jewel-like LV signature.', isTravel: false },
  { id: 'lv-pochette-metis', name: 'Pochette Metis', brand: 'MAISON', subBrand: 'MAISON', category: 'Handbag', price: 2570, desc: 'Structured Monogram crossbody with S-lock closure.', isTravel: false },
  { id: 'lv-alma-bb-epi', name: 'Alma BB Epi', brand: 'MAISON', subBrand: 'MAISON', category: 'Handbag', price: 1920, desc: 'Structured Epi leather icon with removable crossbody strap.', isTravel: false },
  { id: 'lv-zippy-wallet', name: 'Zippy Wallet', brand: 'MAISON', subBrand: 'MAISON', category: 'Small Leather Goods', price: 1010, desc: 'Monogram canvas zip-around wallet with 12 card slots.', isTravel: false },
  { id: 'lv-card-holder', name: 'Card Holder', brand: 'MAISON', subBrand: 'MAISON', category: 'Small Leather Goods', price: 400, desc: 'Monogram Eclipse canvas card holder for 5 cards.', isTravel: true },
  { id: 'lv-keepall-45', name: 'Keepall Bandouliere 45', brand: 'MAISON', subBrand: 'MAISON', category: 'Travel', price: 2480, desc: 'Legendary Monogram canvas cabin travel bag with shoulder strap.', isTravel: true },
  { id: 'lv-horizon-55', name: 'Horizon 55 Rolling Luggage', brand: 'MAISON', subBrand: 'MAISON', category: 'Travel', price: 3950, desc: 'Ultra-lightweight Monogram cabin trolley with silent-roll wheels.', isTravel: true },
  { id: 'lv-belt-initiales', name: 'LV Initiales 40MM Belt', brand: 'MAISON', subBrand: 'MAISON', category: 'Accessory', price: 680, desc: 'Reversible Monogram canvas and smooth leather belt.', isTravel: false },
  { id: 'lv-silk-scarf', name: 'Monogram Giant Silk Square', brand: 'MAISON', subBrand: 'MAISON', category: 'Accessory', price: 590, desc: 'Silk twill square with oversized Monogram and hand-rolled edges.', isTravel: false },
  { id: 'lv-vivienne-pendant', name: 'Vivienne Pendant Necklace', brand: 'HAUTE JOAILLERIE', subBrand: 'HAUTE JOAILLERIE', category: 'Jewelry', price: 845, desc: 'Gold-color pendant with crystal Vivienne house mascot.', isTravel: false },
  { id: 'lv-nanogram-bracelet', name: 'Nanogram Cuff Bracelet', brand: 'MAISON', subBrand: 'MAISON', category: 'Jewelry', price: 530, desc: 'Gold-color cuff with micro-engraved LV Monogram.', isTravel: false },
  { id: 'lv-ombre-nomade', name: 'Ombre Nomade', brand: 'LES PARFUMS', subBrand: 'LES PARFUMS', category: 'Fragrance', price: 450, desc: 'Captivating oud-based fragrance with Damascena rose and raspberry.', isTravel: false },
  { id: 'lv-imagination', name: 'Imagination', brand: 'LES PARFUMS', subBrand: 'LES PARFUMS', category: 'Fragrance', price: 350, desc: 'Vibrant citrus-tea fragrance with Calabrian bergamot.', isTravel: false },
];

// ─── Core Maison des Esprits products (match src/mocks/mh/products.ts) ──
const MH_PRODUCTS = [
  { id: 'mh-dom-perignon-vintage', name: 'Dom Pérignon Vintage 2015', brand: 'DOM PÉRIGNON', subBrand: 'DOM PÉRIGNON', category: 'Champagne', price: 289, desc: 'Iconic vintage prestige cuvée with radiant intensity.', isTravel: false },
  { id: 'mh-dom-perignon-rose', name: 'Dom Pérignon Rosé Vintage 2012', brand: 'DOM PÉRIGNON', subBrand: 'DOM PÉRIGNON', category: 'Champagne', price: 549, desc: 'Rare vintage rosé with Pinot Noir dominance.', isTravel: false },
  { id: 'mh-moet-imperial', name: 'Moët & Chandon Impérial', brand: 'MOËT & CHANDON', subBrand: 'MOËT & CHANDON', category: 'Champagne', price: 52, desc: 'Iconic house champagne with perfect balance.', isTravel: false },
  { id: 'mh-moet-rose', name: 'Moët & Chandon Rosé Impérial', brand: 'MOËT & CHANDON', subBrand: 'MOËT & CHANDON', category: 'Champagne', price: 62, desc: 'Vibrant rosé champagne with wild strawberry.', isTravel: false },
  { id: 'mh-veuve-clicquot-brut', name: 'Veuve Clicquot Yellow Label Brut', brand: 'VEUVE CLICQUOT', subBrand: 'VEUVE CLICQUOT', category: 'Champagne', price: 62, desc: 'Signature full-bodied brut with toasty character.', isTravel: false },
  { id: 'mh-ruinart-blanc-de-blancs', name: 'Ruinart Blanc de Blancs', brand: 'RUINART', subBrand: 'RUINART', category: 'Champagne', price: 89, desc: 'Pure Chardonnay expression from the oldest champagne house.', isTravel: false },
  { id: 'mh-hennessy-vs', name: 'Hennessy V.S', brand: 'HENNESSY', subBrand: 'HENNESSY', category: 'Cognac', price: 42, desc: 'Bold and versatile cognac for cocktails or sipping.', isTravel: false },
  { id: 'mh-hennessy-xo', name: 'Hennessy X.O', brand: 'HENNESSY', subBrand: 'HENNESSY', category: 'Cognac', price: 229, desc: 'The original Extra Old cognac, minimum 10 years aging.', isTravel: false },
  { id: 'mh-hennessy-paradis', name: 'Hennessy Paradis', brand: 'HENNESSY', subBrand: 'HENNESSY', category: 'Cognac', price: 1100, desc: 'Ethereal blend of over 100 rare eaux-de-vie.', isTravel: false },
  { id: 'mh-glenmorangie-18', name: 'Glenmorangie 18 Year Old', brand: 'GLENMORANGIE', subBrand: 'GLENMORANGIE', category: 'Whisky', price: 130, desc: '18-year Highland single malt with Oloroso sherry finish.', isTravel: false },
  { id: 'mh-ardbeg-10', name: 'Ardbeg Ten Years Old', brand: 'ARDBEG', subBrand: 'ARDBEG', category: 'Whisky', price: 58, desc: 'Iconic peated Islay single malt.', isTravel: false },
  { id: 'mh-cloudy-bay-sauvignon', name: 'Cloudy Bay Sauvignon Blanc 2024', brand: 'CLOUDY BAY', subBrand: 'CLOUDY BAY', category: 'Wine', price: 28, desc: 'Benchmark New Zealand Sauvignon Blanc.', isTravel: false },
  { id: 'mh-chateau-desclans-whispering', name: 'Whispering Angel Rosé 2024', brand: "CHÂTEAU D'ESCLANS", subBrand: "CHÂTEAU D'ESCLANS", category: 'Wine', price: 24, desc: "Iconic Provençal rosé.", isTravel: false },
  { id: 'mh-hennessy-xo-gift', name: 'Hennessy X.O Gift Set', brand: 'HENNESSY', subBrand: 'HENNESSY', category: 'Gift Set', price: 269, desc: 'X.O with two crystal tasting glasses in luxury gift box.', isTravel: false },
  { id: 'mh-champagne-tasting-set', name: 'Champagne Discovery Collection', brand: 'MAISON DES ESPRITS', subBrand: 'MAISON DES ESPRITS', category: 'Gift Set', price: 199, desc: 'Three-house champagne discovery: Moët, Veuve, Ruinart half bottles.', isTravel: true },
];

// ─── Additional product templates for --extra generation ────────────
const EXTRA_LV_TEMPLATES = [
  { category: 'Handbag', names: ['Dauphine MM', 'Twist PM', 'Go-14 MM', 'Monceau BB', 'NéoNoé BB', 'Petit Sac Plat', 'OnTheGo GM', 'Papillon BB'] },
  { category: 'Small Leather Goods', names: ['Victorine Wallet', 'Clémence Wallet', 'Key Pouch', 'Coin Purse', 'Passport Cover', 'Phone Case'] },
  { category: 'Travel', names: ['Packing Cube Set', 'Toiletry Pouch 26', 'Garment Bag', 'Shoe Bag', 'Travel Organizer'] },
  { category: 'Accessory', names: ['Monogram Tie', 'Leather Gloves', 'Beanie Hat', 'Cashmere Stole', 'Logo Sunglasses', 'Chain Links Necklace'] },
  { category: 'Jewelry', names: ['Empreinte Ring', 'Color Blossom Earrings', 'Star Blossom Bracelet', 'Idylle Blossom Pendant', 'LV Volt Ring'] },
  { category: 'Fragrance', names: ['Attrape-Rêves', 'Les Sables Roses', 'Apogée', 'Turbulences', 'Contre Moi', 'Rose des Vents', 'Cœur Battant'] },
];

const EXTRA_MH_TEMPLATES = [
  { category: 'Champagne', names: ['Krug Grande Cuvée', 'Krug Rosé', 'Veuve Clicquot La Grande Dame', 'Moët & Chandon Nectar Impérial', 'Ruinart Rosé', 'Dom Pérignon P2'] },
  { category: 'Cognac', names: ['Hennessy V.S.O.P', 'Hennessy Master Blender No.5', 'Hennessy Richard', 'Hennessy James'] },
  { category: 'Whisky', names: ['Glenmorangie Signet', 'Glenmorangie Original', 'Ardbeg Uigeadail', 'Ardbeg Corryvreckan', 'Glenmorangie Nectar d\'Or'] },
  { category: 'Wine', names: ['Cloudy Bay Pinot Noir 2023', 'Cloudy Bay Te Koko 2021', 'Newton Unfiltered Chardonnay', 'Terrazas Reserva Malbec', 'Cape Mentelle Cabernet'] },
  { category: 'Gift Set', names: ['Dom Pérignon Gift Box', 'Hennessy V.S.O.P Gift Set', 'Whisky Discovery Trio', 'Rosé Summer Collection', 'Cognac Connoisseur Set'] },
];

const PRICE_RANGES = {
  'Handbag': [1200, 6000], 'Small Leather Goods': [350, 1200], 'Travel': [800, 5000],
  'Accessory': [300, 1500], 'Jewelry': [400, 3000], 'Fragrance': [250, 500],
  'Champagne': [40, 600], 'Cognac': [35, 1200], 'Whisky': [45, 300],
  'Wine': [18, 80], 'Gift Set': [100, 400],
};

function slugify(str) {
  return str.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/-+$/,'').replace(/^-+/,'');
}

function randomPrice(category) {
  const [min, max] = PRICE_RANGES[category] || [50, 500];
  return Math.round(min + Math.random() * (max - min));
}

function generateExtras(count) {
  const extras = [];
  const usedIds = new Set();
  const allTemplates = [
    ...EXTRA_LV_TEMPLATES.map(t => ({ ...t, maison: 'La Maison', prefix: 'lv' })),
    ...EXTRA_MH_TEMPLATES.map(t => ({ ...t, maison: 'Maison des Esprits', prefix: 'mh' })),
  ];

  for (let i = 0; i < count; i++) {
    const tmpl = allTemplates[i % allTemplates.length];
    const name = tmpl.names[i % tmpl.names.length];
    const id = `${tmpl.prefix}-${slugify(name)}`;
    if (usedIds.has(id)) continue;
    usedIds.add(id);

    const brand = tmpl.prefix === 'lv' ? 'MAISON' : name.split(' ')[0].toUpperCase();
    extras.push({
      id,
      name,
      brand,
      subBrand: brand,
      category: tmpl.category,
      price: randomPrice(tmpl.category),
      desc: `${name} — premium ${tmpl.category.toLowerCase()} from ${tmpl.maison}.`,
      isTravel: tmpl.category === 'Travel' || tmpl.category === 'Gift Set',
      maison: tmpl.maison,
    });
  }
  return extras;
}

// ─── Build Salesforce JSON ──────────────────────────────────────────
function toRecord(product, maison, index) {
  return {
    attributes: { type: 'Product2', referenceId: `Product_${index}` },
    Name: product.name,
    IsActive: true,
    Brand__c: product.brand,
    Sub_Brand__c: product.subBrand,
    Category__c: product.category,
    Maison__c: maison,
    Price__c: product.price,
    Description__c: product.desc,
    Image_URL__c: `/assets/products/${product.id}.png`,
    In_Stock__c: true,
    Is_Travel__c: product.isTravel || false,
    Rating__c: parseFloat((4 + Math.random()).toFixed(1)),
  };
}

const allProducts = [
  ...LV_PRODUCTS.map((p, i) => toRecord(p, 'La Maison', i)),
  ...MH_PRODUCTS.map((p, i) => toRecord(p, 'Maison des Esprits', LV_PRODUCTS.length + i)),
];

if (extraCount > 0) {
  const extras = generateExtras(extraCount);
  extras.forEach((p, i) => {
    allProducts.push(toRecord(p, p.maison || (p.id.startsWith('lv') ? 'La Maison' : 'Maison des Esprits'), LV_PRODUCTS.length + MH_PRODUCTS.length + i));
  });
}

const output = { records: allProducts };
console.log(JSON.stringify(output, null, 2));

// Stats to stderr
const cats = [...new Set(allProducts.map(r => r.Category__c))].sort();
const brands = [...new Set(allProducts.map(r => r.Brand__c))].sort();
console.error(`\nGenerated ${allProducts.length} products (${LV_PRODUCTS.length} LV core + ${MH_PRODUCTS.length} MH core${extraCount > 0 ? ` + ${allProducts.length - LV_PRODUCTS.length - MH_PRODUCTS.length} extras` : ''})`);
console.error(`Categories: ${cats.join(', ')}`);
console.error(`Brands: ${brands.join(', ')}`);
console.error(`\nDeploy: sf data import tree --file data/Product2.json --target-org my-org`);
