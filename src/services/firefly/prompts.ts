import type { SceneSetting } from '@/types/scene';

export const SCENE_PROMPTS: Partial<Record<SceneSetting, string>> = {
  neutral:
    'Elegant minimalist empty surface with soft bokeh lights in the background, sophisticated neutral tones, studio lighting, clean uncluttered space',

  bathroom:
    'Luxurious modern bathroom counter with white marble surface, soft natural morning light streaming through a frosted window, potted eucalyptus plant, high-end spa aesthetic, empty counter with no products or bottles',

  travel:
    'Stylish hotel room with a leather carry-on suitcase on a bed, warm golden hour light, passport and boarding pass visible, wanderlust travel aesthetic, no toiletries or products visible',

  outdoor:
    'Fresh outdoor wooden table with lush green foliage, morning dew on leaves, dappled sunlight, healthy active lifestyle setting, empty table surface with no objects',

  lifestyle:
    'Sophisticated vanity dresser with round mirror, soft pink and cream tones, natural daylight from a large window, clean empty surface with no products or cosmetics',

  bedroom:
    'Cozy bedroom nightstand with warm amber lamp light, soft linen textures, dark moody evening atmosphere, a small empty tray on the nightstand, no products or bottles',

  vanity:
    'Glamorous makeup vanity station with Hollywood mirror lights, velvet blush-pink seat, clean marble countertop, warm flattering light, empty surface with no cosmetics',

  gym:
    'Modern gym locker room shelf, clean concrete and brushed metal surfaces, bright even overhead lighting, a folded white towel nearby, empty shelf with no bottles or products',

  office:
    'Minimalist modern office desk near a large window, natural daylight, clean white surface with a small plant, calm productive atmosphere, empty desk with no objects',
};

export function buildScenePrompt(setting: SceneSetting): string {
  const base = SCENE_PROMPTS[setting] || SCENE_PROMPTS.neutral;
  return `${base}. Empty background scene only, no products, no bottles, no cosmetics, no text or labels. Professional interior photography, elegant and luxurious atmosphere, soft diffused shadows, ultra high quality, photorealistic.`;
}

/**
 * Prompts for generating a product image on a pure white background.
 * The white background is then removed via CSS mix-blend-mode: multiply,
 * allowing the product to composite onto the scene background.
 */
export const STAGING_PROMPTS: Partial<Record<SceneSetting, string>> = {
  neutral:
    'A single elegant luxury product bottle, soft studio lighting from above and side, subtle shadow beneath the product',

  bathroom:
    'A single elegant luxury product bottle with a slight dewy moisture effect on the surface, soft diffused lighting',

  travel:
    'A single compact travel-size luxury product bottle, clean studio lighting, slight reflection on surface',

  outdoor:
    'A single elegant luxury product bottle with a fresh natural feel, bright even studio lighting, crisp and clean',

  lifestyle:
    'A single luxurious luxury product bottle, warm soft studio lighting, gentle highlight on the cap, slight reflection',

  bedroom:
    'A single elegant luxury product bottle with warm amber tones, soft intimate lighting, gentle glow on the surface',

  vanity:
    'A single luxury product with glamorous lighting, Hollywood mirror-style illumination, flattering warm glow',

  gym:
    'A single compact product bottle, bright clean lighting, modern minimal aesthetic, crisp shadows',

  office:
    'A single minimalist luxury product, clean natural daylight, subtle shadow, professional product shot',
};

export function buildStagingPrompt(setting: SceneSetting): string {
  const base = STAGING_PROMPTS[setting] || STAGING_PROMPTS.neutral;
  return `${base}. Product centered on a perfectly pure white background. No other objects, no surface, no scene, no environment — ONLY the product on solid white. Professional e-commerce product photography, ultra high quality, photorealistic. No text, no labels, no logos.`;
}
