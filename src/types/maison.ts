export type MaisonId = 'lv' | 'mh';

export interface MaisonConfig {
  id: MaisonId;
  name: string;
  tagline: string;
  description: string;
  accentColor: string;
  accentGradient: string;
  defaultSetting: string;
  chatPlaceholder: string;
  welcomeHeadline: string;
  welcomeSubtext: string;
  defaultSuggestedActions: string[];
  loadingMessages: string[];
}

export const MAISON_CONFIGS: Record<MaisonId, MaisonConfig> = {
  lv: {
    id: 'lv',
    name: 'La Maison',
    tagline: 'Agentforce Maison Luxury Advisor',
    description: 'Luxury leather goods, fashion, travel & fine jewelry',
    accentColor: '#8B6914',
    accentGradient: 'linear-gradient(135deg, #8B6914 0%, #C4A35A 50%, #D4AF37 100%)',
    defaultSetting: 'boutique',
    chatPlaceholder: 'Ask your luxury advisor anything...',
    welcomeHeadline: "I'm your Maison Luxury Advisor",
    welcomeSubtext: 'How may I assist you today?',
    defaultSuggestedActions: ['Show me leather goods', 'I need a travel piece', 'What do you recommend?'],
    loadingMessages: [
      'Reviewing your style profile\u2026',
      'Studying your recent selections\u2026',
      'Curating personalized recommendations\u2026',
      'Preparing your private experience\u2026',
      'Setting the scene\u2026',
    ],
  },
  mh: {
    id: 'mh',
    name: 'Maison des Esprits',
    tagline: 'Agentforce Maison Luxury Advisor',
    description: 'Champagne, cognac & fine spirits',
    accentColor: '#722F37',
    accentGradient: 'linear-gradient(135deg, #722F37 0%, #8B4513 50%, #C4A35A 100%)',
    defaultSetting: 'cellar',
    chatPlaceholder: 'Ask your spirits advisor anything...',
    welcomeHeadline: "I'm your Spirits Advisor",
    welcomeSubtext: 'How may I assist you today?',
    defaultSuggestedActions: ['Show me champagnes', 'I need a gift', 'What do you recommend?'],
    loadingMessages: [
      'Reviewing your tasting profile\u2026',
      'Studying your cellar preferences\u2026',
      'Curating personalized selections\u2026',
      'Preparing your private tasting\u2026',
      'Setting the scene\u2026',
    ],
  },
};
