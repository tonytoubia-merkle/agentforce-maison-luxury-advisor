import type { MaisonId } from '@/types/maison';
import type { Product } from '@/types/product';
import type { PersonaMeta, PersonaStub } from '@/mocks/customerPersonas';
import { LV_PRODUCTS } from '@/mocks/lv/products';
import { LV_PERSONAS, LV_PERSONA_STUBS } from '@/mocks/lv/personas';
import { MH_PRODUCTS } from '@/mocks/mh/products';
import { MH_PERSONAS, MH_PERSONA_STUBS } from '@/mocks/mh/personas';

const PRODUCTS: Record<MaisonId, Product[]> = {
  lv: LV_PRODUCTS,
  mh: MH_PRODUCTS,
};

const PERSONAS: Record<MaisonId, PersonaMeta[]> = {
  lv: LV_PERSONAS,
  mh: MH_PERSONAS,
};

const PERSONA_STUBS: Record<MaisonId, PersonaStub[]> = {
  lv: LV_PERSONA_STUBS,
  mh: MH_PERSONA_STUBS,
};

export function getProducts(maisonId: MaisonId): Product[] {
  return PRODUCTS[maisonId];
}

export function getPersonas(maisonId: MaisonId): PersonaMeta[] {
  return PERSONAS[maisonId];
}

export function getPersonaStubs(maisonId: MaisonId): PersonaStub[] {
  return PERSONA_STUBS[maisonId];
}

export function getPersonaById(maisonId: MaisonId, personaId: string): PersonaMeta | undefined {
  return PERSONAS[maisonId].find((p) => p.id === personaId);
}

export function findProduct(maisonId: MaisonId, productId: string): Product | undefined {
  return PRODUCTS[maisonId].find((p) => p.id === productId);
}
