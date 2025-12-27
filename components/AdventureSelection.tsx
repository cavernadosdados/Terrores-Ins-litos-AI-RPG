
import React, { useState, useEffect, useCallback } from 'react';
import { Adventure } from '../types';
import { generateAdventureHook } from '../services/geminiService';

interface Props {
  keywords: string[];
  onConfirm: (adv: Adventure) => void;
  onBack: () => void;
}

const AdventureSelection: React.FC<Props> = ({ keywords, onConfirm, onBack }) => {
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [loading, setLoading] = useState(false);

  const rollAdventure = useCallback(async () => {
    setLoading(true);
    try {
      const adv = await generateAdventureHook(keywords);
      setAdventure(adv);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [keywords]);

  useEffect(() => {
    rollAdventure();
  }, [rollAdventure]);

  return (
    <div className="max-w-4xl mx-auto p-12 bg-neutral-900/95 grunge-border rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.9)] border-red-900/10">
      <div className="mb-12">
        <h1 className="text-[10px] uppercase tracking-[0.6em] text-neutral-600 mb-2 text-center font-bold">Iniciando Ritual de Narração</h1>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent"></div>
      </div>
      
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block w-10 h-10 border-2 border-red-900 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="rpg-font text-xl text-neutral-600 animate-pulse tracking-widest uppercase">Capturando visões de {keywords.slice(0, 2).join(' & ')}...</p>
        </div>
      ) : adventure ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center space-y-6">
            <h2 className="text-6xl md:text-8xl rpg-font text-white tracking-tighter leading-none opacity-90 drop-shadow-2xl italic uppercase">
              {adventure.title}
            </h2>
            <div className="w-32 h-[1px] bg-red-800 mx-auto opacity-40"></div>
            <div className="relative">
               <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-[0.5em] text-red-900 font-bold opacity-50">Prólogo</span>
               <p className="text-2xl md:text-3xl text-neutral-400 font-serif leading-relaxed italic max-w-2xl mx-auto drop-shadow-md">
                "{adventure.description}"
               </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-16 border-t border-neutral-800/50">
            <button 
              onClick={onBack}
              className="flex-1 py-4 border border-neutral-800 text-neutral-600 hover:text-neutral-400 hover:border-neutral-600 transition-all uppercase tracking-widest text-[9px] font-bold"
            >
              Recuar Elementos
            </button>
            <button 
              onClick={rollAdventure}
              className="flex-1 py-4 border border-neutral-800 text-neutral-500 hover:text-neutral-200 hover:border-neutral-600 transition-all uppercase tracking-widest text-[9px] font-bold"
            >
              Outra Perspectiva
            </button>
            <button 
              onClick={() => onConfirm(adventure)}
              className="flex-[2] py-4 bg-red-950 hover:bg-red-800 text-neutral-100 rpg-font text-3xl tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(127,29,29,0.2)] hover:shadow-[0_0_60px_rgba(153,27,27,0.3)] hover:scale-[1.02]"
            >
              ACEITAR O CHAMADO
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdventureSelection;
