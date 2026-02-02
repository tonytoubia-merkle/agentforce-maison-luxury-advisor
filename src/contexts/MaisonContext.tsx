import React, { createContext, useContext, useState, useCallback } from 'react';
import type { MaisonId, MaisonConfig } from '@/types/maison';
import { MAISON_CONFIGS } from '@/types/maison';

interface MaisonContextValue {
  maisonId: MaisonId;
  maison: MaisonConfig;
  switchMaison: (id: MaisonId) => void;
}

const MaisonContext = createContext<MaisonContextValue | null>(null);

export const MaisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [maisonId, setMaisonId] = useState<MaisonId>('lv');

  const switchMaison = useCallback((id: MaisonId) => {
    setMaisonId(id);
  }, []);

  return (
    <MaisonContext.Provider value={{ maisonId, maison: MAISON_CONFIGS[maisonId], switchMaison }}>
      {children}
    </MaisonContext.Provider>
  );
};

export const useMaison = (): MaisonContextValue => {
  const context = useContext(MaisonContext);
  if (!context) {
    throw new Error('useMaison must be used within MaisonProvider');
  }
  return context;
};
