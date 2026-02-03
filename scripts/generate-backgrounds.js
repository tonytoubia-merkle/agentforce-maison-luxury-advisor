/**
 * One-time script to generate static background images via Imagen 4.
 * Run: node scripts/generate-backgrounds.js
 *
 * Generates 3 variants per scene setting and saves to public/assets/backgrounds/.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public/assets/backgrounds');

// Load API key from .env.local
function loadApiKey() {
  const envPath = resolve(ROOT, '.env.local');
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_IMAGEN_API_KEY=')) {
      return trimmed.slice('VITE_IMAGEN_API_KEY='.length);
    }
  }
  throw new Error('VITE_IMAGEN_API_KEY not found in .env.local');
}

const API_KEY = loadApiKey();
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`;

// Luxury Maison settings (La Maison + Maison des Esprits)
const SETTINGS = {
  // General
  neutral: 'Elegant minimalist luxury interior with soft bokeh lights, sophisticated neutral tones, marble accents, clean uncluttered space',
  travel: 'First-class airport lounge at golden hour, leather luggage, world map, elegant travel accessories, luxurious atmosphere',
  outdoor: 'Prestigious outdoor terrace with lush greenery, wrought iron furniture, dappled sunlight, sophisticated garden setting',
  lifestyle: 'Sophisticated Parisian apartment interior with large windows, natural light, refined furniture, elegant empty surfaces',

  // La Maison (luxury goods)
  boutique: 'Grand Parisian luxury boutique interior, gilded mirrors, soft chandelier glow, marble floors, curated leather goods displays, warm ambient lighting',
  showroom: 'Elegant luxury fashion showroom, dark wood vitrines, velvet display cushions, spotlit pedestals, refined museum-like atmosphere',
  atelier: 'Artisan leather workshop atelier, warm golden light, crafting tools, premium materials, heritage craftsmanship ambiance',

  // Maison des Esprits (fine spirits)
  cellar: 'Underground champagne cellar with chalk walls, candlelight reflecting off golden bottles, oak barrels, atmospheric stone arches',
  lounge: 'Intimate cognac tasting lounge, leather armchairs, warm amber lighting, crystal decanters, dark wood paneling, cigar club atmosphere',
  'tasting-room': 'Modern wine tasting room, floor-to-ceiling bottle displays, sommelier station, elegant glassware, soft diffused natural light',
  vineyard: 'Provençal vineyard terrace at sunset, lavender fields in distance, rustic stone table, crystal glasses, romantic golden hour light',
  terrace: 'Mediterranean luxury terrace overlooking the sea, white linen curtains, elegant bar setup, champagne on ice, summer evening atmosphere',
};

const VARIANTS = [
  { suffix: '1', mod: 'Soft warm morning golden hour light, fresh and inviting atmosphere.' },
  { suffix: '2', mod: 'Cool neutral daylight, clean and modern feel, subtle blue tones.' },
  { suffix: '3', mod: 'Warm evening ambient lighting, candles or warm lamps, cozy intimate mood.' },
];

const NO_PRODUCTS = ' Empty background scene only, no products, no bottles, no people, no text or labels. Professional interior photography, elegant and luxurious atmosphere, soft diffused shadows, ultra high quality, photorealistic.';

function postJSON(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => {
      let chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        try { resolve(JSON.parse(text)); } catch { reject(new Error(text.slice(0, 500))); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function generateImage(prompt) {
  const body = {
    instances: [{ prompt }],
    parameters: { sampleCount: 1, aspectRatio: '16:9', personGeneration: 'dont_allow' },
  };
  const data = await postJSON(API_URL, body);
  const base64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) {
    const reason = data.predictions?.[0]?.raiFilteredReason || JSON.stringify(data).slice(0, 300);
    throw new Error(`No image: ${reason}`);
  }
  return Buffer.from(base64, 'base64');
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const entries = Object.entries(SETTINGS);
  let total = entries.length * VARIANTS.length;
  let done = 0;

  for (const [setting, basePrompt] of entries) {
    for (const variant of VARIANTS) {
      const filename = `${setting}-${variant.suffix}.jpg`;
      const filepath = resolve(OUT_DIR, filename);

      if (existsSync(filepath)) {
        console.log(`[skip] ${filename} already exists`);
        done++;
        continue;
      }

      const prompt = `${basePrompt}. ${variant.mod}${NO_PRODUCTS}`;
      console.log(`[${++done}/${total}] Generating ${filename}...`);

      try {
        const buf = await generateImage(prompt);
        writeFileSync(filepath, buf);
        console.log(`  ✓ Saved ${filename} (${(buf.length / 1024).toFixed(0)} KB)`);
      } catch (err) {
        console.error(`  ✗ Failed ${filename}: ${err.message}`);
      }

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\nDone! Images saved to public/assets/backgrounds/');
}

main().catch(console.error);
