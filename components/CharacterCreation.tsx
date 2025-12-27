
import React, { useState } from 'react';
import { Character, HealthStatus, Adventure } from '../types';
import { MAX_POINTS_TO_DISTRIBUTE, INITIAL_PLOT_POINTS } from '../constants';

interface Props {
  adventure: Adventure;
  onComplete: (char: Character) => void;
}

const CharacterCreation: React.FC<Props> = ({ adventure, onComplete }) => {
  const [name, setName] = useState('');
  const [presentation, setPresentation] = useState('');
  const [coragem, setCoragem] = useState(0);
  const [conhecimento, setConhecimento] = useState(0);
  const [coracao, setCoracao] = useState(0);
  
  const [caracCoragem, setCaracCoragem] = useState('');
  const [caracConhecimento, setCaracConhecimento] = useState('');
  const [caracCoracao, setCaracCoracao] = useState('');

  const totalPoints = coragem + conhecimento + coracao;
  const isComplete = name && presentation && totalPoints === MAX_POINTS_TO_DISTRIBUTE && caracCoragem && caracConhecimento && caracCoracao;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;

    onComplete({
      name,
      presentation,
      attributes: { coragem, conhecimento, coracao },
      characteristics: {
        coragem: caracCoragem,
        conhecimento: caracConhecimento,
        coracao: caracCoracao,
        used: { coragem: false, conhecimento: false, coracao: false }
      },
      health: HealthStatus.BEM,
      plotPoints: INITIAL_PLOT_POINTS,
      equipment: []
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-neutral-900/90 border border-neutral-800 rounded-lg shadow-2xl my-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 text-[10px] uppercase text-red-900/30 font-bold tracking-widest text-right">
        Para: {adventure.title}
      </div>

      <h1 className="text-4xl text-red-700 rpg-font mb-6 text-center tracking-widest border-b border-red-900/30 pb-4">
        FORJAR PROTAGONISTA
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Identidade do Indivíduo</label>
            <input 
              className="w-full bg-neutral-950 border border-neutral-800 p-3 text-xl focus:outline-none focus:border-red-900 transition-colors rounded"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Elias Thorne"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Apresentação (Sua história em uma frase)</label>
            <textarea 
              className="w-full bg-neutral-950 border border-neutral-800 p-3 italic text-neutral-300 focus:outline-none focus:border-red-900 transition-colors rounded resize-none"
              rows={2}
              value={presentation}
              onChange={e => setPresentation(e.target.value)}
              placeholder="Ex: Um ex-policial que viu algo que não deveria..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <AttributeInput label="Coragem" value={coragem} onChange={setCoragem} />
            <AttributeInput label="Sabedoria" value={conhecimento} onChange={setConhecimento} />
            <AttributeInput label="Coração" value={coracao} onChange={setCoracao} />
          </div>
          
          <div className="text-center text-[10px] uppercase tracking-widest text-neutral-500">
            Pontos Ganhos: <span className={totalPoints !== MAX_POINTS_TO_DISTRIBUTE ? 'text-red-500' : 'text-green-500'}>{totalPoints} / {MAX_POINTS_TO_DISTRIBUTE}</span>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-800"></div>

        <div className="grid md:grid-cols-3 gap-6">
          <CharacteristicInput label="Talento de Coragem" value={caracCoragem} onChange={setCaracCoragem} hint="Ex: Praticar boxe" />
          <CharacteristicInput label="Talento de Sabedoria" value={caracConhecimento} onChange={setCaracConhecimento} hint="Ex: Falar Latim" />
          <CharacteristicInput label="Talento de Coração" value={caracCoracao} onChange={setCaracCoracao} hint="Ex: Ser bom ouvinte" />
        </div>

        <button 
          disabled={!isComplete}
          className={`w-full py-5 mt-4 rpg-font text-3xl tracking-[0.3em] transition-all duration-700 rounded shadow-xl ${
            isComplete 
              ? 'bg-red-950 hover:bg-red-800 text-white cursor-pointer hover:scale-[1.01]' 
              : 'bg-neutral-800 text-neutral-600 cursor-not-allowed opacity-50'
          }`}
        >
          ENFRENTAR O HORROR
        </button>
      </form>
    </div>
  );
};

const AttributeInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
  <div className="flex flex-col items-center p-3 bg-neutral-950 rounded border border-neutral-800/50">
    <span className="text-[9px] uppercase mb-2 text-neutral-500 tracking-tighter">{label}</span>
    <div className="flex items-center space-x-2">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-xs hover:bg-neutral-700">-</button>
      <span className="text-xl rpg-font text-red-700">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-xs hover:bg-neutral-700">+</button>
    </div>
  </div>
);

const CharacteristicInput = ({ label, value, onChange, hint }: { label: string, value: string, onChange: (v: string) => void, hint: string }) => (
  <div className="space-y-1">
    <label className="block text-[9px] uppercase tracking-widest text-neutral-500">{label}</label>
    <input 
      className="w-full bg-neutral-950 border border-neutral-800 p-2 text-xs text-neutral-300 focus:outline-none focus:border-red-900 rounded"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={hint}
    />
  </div>
);

export default CharacterCreation;
