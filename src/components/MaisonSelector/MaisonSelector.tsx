import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useMaison } from '@/contexts/MaisonContext';
import { MAISON_CONFIGS } from '@/types/maison';
import type { MaisonId } from '@/types/maison';

const MAISONS: { id: MaisonId; icon: string; label: string; description: string }[] = [
  { id: 'lv', icon: 'LV', label: 'La Maison', description: 'Leather goods, fashion & jewelry' },
  { id: 'mh', icon: 'MH', label: 'Maison des Esprits', description: 'Champagne, cognac & fine spirits' },
];

export const MaisonSelector: React.FC = () => {
  const { maisonId, switchMaison } = useMaison();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-2 text-xs text-white/70 hover:text-white/90 hover:bg-black/70 transition-all"
      >
        <span className="text-[10px] font-bold tracking-wider" style={{ color: MAISON_CONFIGS[maisonId].accentColor }}>
          {MAISONS.find((m) => m.id === maisonId)?.icon}
        </span>
        <span className="font-medium">{MAISON_CONFIGS[maisonId].name}</span>
        <span className="text-white/40">{isOpen ? '\u25B2' : '\u25BC'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 bottom-full mb-2 w-72 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3">
                <div className="text-[10px] text-white/40 font-semibold tracking-wider uppercase mb-2">
                  Agentforce Maison Luxury Advisor
                </div>
                <div className="space-y-1.5">
                  {MAISONS.map((m) => {
                    const isActive = m.id === maisonId;
                    const config = MAISON_CONFIGS[m.id];
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          switchMaison(m.id);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left rounded-lg p-3 transition-all ${
                          isActive
                            ? 'bg-white/15 border border-white/20'
                            : 'bg-white/5 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                            style={{ background: config.accentGradient }}
                          >
                            {m.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-white text-sm font-medium">{m.label}</span>
                              {isActive && (
                                <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-white/50">{m.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="px-3 py-2 border-t border-white/10">
                <p className="text-white/30 text-[9px] leading-relaxed">
                  Switch between maison experiences. Each maison has its own personas, products, and advisor personality.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
