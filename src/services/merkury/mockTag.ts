import type { IdentityTier, AppendedProfile } from '@/types/customer';
import { getPersonaById } from '@/mocks/customerPersonas';

export interface MerkuryResolution {
  merkuryId: string | null;
  identityTier: IdentityTier;
  confidence: number;
  appendedData?: AppendedProfile;
}

/**
 * Simulates Merkury Identity tag resolution.
 * In production, Merkury's JS snippet fires on page load and resolves identity
 * via cookie/device graph. Here we simulate that with a configurable delay.
 */
export async function resolveMerkuryIdentity(personaId?: string): Promise<MerkuryResolution> {
  // Simulate network latency
  const delay = 200 + Math.random() * 300;
  await new Promise((r) => setTimeout(r, delay));

  if (!personaId || personaId === 'anonymous') {
    return { merkuryId: null, identityTier: 'anonymous', confidence: 0 };
  }

  const persona = getPersonaById(personaId);
  if (!persona) {
    return { merkuryId: null, identityTier: 'anonymous', confidence: 0 };
  }

  const identity = persona.profile.merkuryIdentity;
  return {
    merkuryId: identity?.merkuryId || null,
    identityTier: identity?.identityTier || 'anonymous',
    confidence: identity?.confidence || 0,
    appendedData: persona.profile.appendedProfile,
  };
}
