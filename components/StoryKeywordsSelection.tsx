
import React, { useState } from 'react';

interface Props {
  onConfirm: (keywords: string[]) => void;
}

const STORY_ELEMENTS = [
  "Terror Cósmico", "Slasher", "Sobrenatural", "Psicológico", "Zumbis", 
  "Cultistas", "Mansão Mal-assombrada", "Ficção Científica", "Body Horror", 
  "Folclore Brasileiro", "Gótico", "Solidão", "Mistério Policial", 
  "Sobrevivência Extrema", "Espelhos", "Sonhos", "Infância", 
  "Hospitais Abandonados", "Florestas", "Subterrâneo", "Nevoeiro",
  "Rituais", "Tecnologia Amaldiçoada", "Insetos", "Religiosidade"
];

const StoryKeywordsSelection: React.FC<Props> = ({ onConfirm }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (kw: string) => {
    if (selected.includes(kw)) {
      setSelected(selected.filter(k => k !== kw));
    } else if (selected.length < 5) {
      setSelected([...selected, kw]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12 bg-neutral-900/95 grunge-border rounded-xl shadow-[0_0_60px_rgba(0,0,0,1)] border-red-900/10">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl rpg-font text-red-700 tracking-widest mb-4">MOLDAR O PESADELO</h1>
        <p className="text-neutral-500 font-serif italic text-lg">Selecione até 5 elementos que assombrarão sua jornada...</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {STORY_ELEMENTS.map(kw => (
          <button
            key={kw}
            onClick={() => toggle(kw)}
            className={`px-4 py-2 text-sm uppercase tracking-tighter transition-all duration-300 border ${
              selected.includes(kw)
                ? 'bg-red-900 border-red-600 text-white scale-110 shadow-[0_0_15px_rgba(153,27,27,0.5)]'
                : 'bg-neutral-950 border-neutral-800 text-neutral-600 hover:border-neutral-700 hover:text-neutral-400'
            }`}
          >
            {kw}
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          disabled={selected.length === 0}
          onClick={() => onConfirm(selected)}
          className={`py-5 px-12 rpg-font text-3xl tracking-[0.4em] rounded transition-all shadow-2xl ${
            selected.length > 0
              ? 'bg-red-950 hover:bg-red-800 text-white cursor-pointer hover:scale-[1.05]'
              : 'bg-neutral-800 text-neutral-600 cursor-not-allowed opacity-50'
          }`}
        >
          CONVOCAR O MESTRE
        </button>
        <p className="mt-4 text-[10px] text-neutral-600 uppercase tracking-widest">
          {selected.length} / 5 Elementos Selecionados
        </p>
      </div>
    </div>
  );
};

export default StoryKeywordsSelection;
