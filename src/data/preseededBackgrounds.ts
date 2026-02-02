import type { SceneSetting } from '@/types/scene';

export interface PreseededAsset {
  setting: SceneSetting;
  variant: string;
  path: string;
  tags: string[];
}

/**
 * Pre-seeded background images shipped in the repo for instant load.
 * Each setting has a 'default' variant; some have mood variants for edit-mode demos.
 *
 * Place images in public/assets/backgrounds/ — they're served as static files by Vite.
 */
export const PRESEEDED_BACKGROUNDS: PreseededAsset[] = [
  { setting: 'neutral', variant: 'default', path: '/backgrounds/default.png', tags: ['scene-neutral'] },
  { setting: 'bathroom', variant: 'default', path: '/assets/backgrounds/bathroom-default.jpg', tags: ['scene-bathroom'] },
  { setting: 'bathroom', variant: 'evening', path: '/assets/backgrounds/bathroom-evening.jpg', tags: ['scene-bathroom-evening'] },
  { setting: 'travel', variant: 'default', path: '/assets/backgrounds/travel-default.jpg', tags: ['scene-travel'] },
  { setting: 'outdoor', variant: 'default', path: '/assets/backgrounds/outdoor-default.jpg', tags: ['scene-outdoor'] },
  { setting: 'lifestyle', variant: 'default', path: '/assets/backgrounds/lifestyle-default.jpg', tags: ['scene-lifestyle'] },
  { setting: 'bedroom', variant: 'default', path: '/assets/backgrounds/bedroom-default.jpg', tags: ['scene-bedroom'] },
  { setting: 'vanity', variant: 'default', path: '/assets/backgrounds/vanity-default.jpg', tags: ['scene-vanity'] },
  { setting: 'gym', variant: 'default', path: '/assets/backgrounds/gym-default.jpg', tags: ['scene-gym'] },
  { setting: 'office', variant: 'default', path: '/assets/backgrounds/office-default.jpg', tags: ['scene-office'] },
];

/**
 * Find a pre-seeded background for a setting.
 * If variant is specified, looks for that exact variant; otherwise returns 'default'.
 */
export function findPreseeded(setting: SceneSetting, variant?: string): PreseededAsset | null {
  const targetVariant = variant || 'default';
  return PRESEEDED_BACKGROUNDS.find(
    (a) => a.setting === setting && a.variant === targetVariant
  ) || null;
}

/** Check if a pre-seeded image file actually exists (async HEAD request). */
export async function preseededExists(asset: PreseededAsset): Promise<boolean> {
  try {
    const resp = await fetch(asset.path, { method: 'HEAD' });
    if (!resp.ok) return false;
    // Vite dev server returns 200 with text/html for missing files — verify content-type
    const ct = resp.headers.get('content-type') || '';
    return ct.startsWith('image/');
  } catch {
    return false;
  }
}
