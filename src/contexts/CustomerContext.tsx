import React, { createContext, useContext, useState, useCallback } from 'react';
import type { CustomerProfile } from '@/types/customer';
import { resolveMerkuryIdentity } from '@/services/merkury/mockTag';
import { getPersonaById } from '@/mocks/customerPersonas';
import { getDataCloudService } from '@/services/datacloud';

const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

interface CustomerContextValue {
  customer: CustomerProfile | null;
  isLoading: boolean;
  isResolving: boolean;
  error: Error | null;
  selectPersona: (personaId: string) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const selectPersona = useCallback(async (personaId: string) => {
    setIsResolving(true);
    setError(null);

    try {
      // Simulate Merkury tag resolution
      const resolution = await resolveMerkuryIdentity(personaId);
      console.log('[merkury] Identity resolved:', resolution.identityTier, 'confidence:', resolution.confidence);

      if (useMockData) {
        // MOCK MODE: Load from mock personas
        const persona = getPersonaById(personaId);
        if (persona) {
          setCustomer(persona.profile);
        } else {
          setCustomer(null);
        }
      } else {
        // REAL MODE: Fetch full profile from Data Cloud
        setIsLoading(true);
        try {
          const dataCloudService = getDataCloudService();
          if (!resolution.merkuryId) {
            throw new Error('Merkury identity resolution returned no ID');
          }
          const profile = await dataCloudService.getCustomerProfile(resolution.merkuryId);
          setCustomer(profile);
        } catch (dcError) {
          console.error('[datacloud] Profile fetch failed:', dcError);
          // Fallback to mock data if Data Cloud fails
          console.warn('[datacloud] Falling back to mock persona data');
          const persona = getPersonaById(personaId);
          if (persona) {
            setCustomer(persona.profile);
          } else {
            throw new Error('Failed to load customer profile from Data Cloud');
          }
        } finally {
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Identity resolution failed:', err);
      setError(err instanceof Error ? err : new Error('Identity resolution failed'));
      setCustomer(null);
    } finally {
      setIsResolving(false);
    }
  }, []);

  return (
    <CustomerContext.Provider value={{ customer, isLoading, isResolving, error, selectPersona }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = (): CustomerContextValue => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within CustomerProvider');
  }
  return context;
};
