
import React from 'react';
import { Character, HealthStatus } from '../types';
import { HeartIcon } from '../constants';

interface Props {
  character: Character;
  onUpdate: (char: Character) => void;
}

const CharacterSheet: React.FC<Props> = ({ character, onUpdate }) => {
  const toggleCharacteristic = (attr: keyof Character['characteristics']['used']) => {
    onUpdate({
      ...character,
      characteristics: {
        ...character.characteristics,
        used: {
          ...character.characteristics.used,
          [attr]: !character.characteristics.used[attr]
        }
      }
    });
  };

  const updateHealth = (newHealth: HealthStatus) => {
    onUpdate({ ...character, health: newHealth });
  };

  const updatePlotPoints = (delta: number) => {
    onUpdate({ ...character, plotPoints: Math.max(0, character.plotPoints + delta) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center border-b border-red-900/30 pb-3 mb-1">
        <h2 className="text-2xl rpg-font text-red-700 tracking-tight">{character.name}</h2>
        <p className="text-[10px] italic text-neutral-500 leading-tight mt-1">"{character.presentation}"</p>
      </div>

      <div className="space-y-4">
        {/* Atributos */}
        <div className="bg-neutral-800/40 p-3 rounded border border-neutral-800/50">
          <h3 className="text-[9px] uppercase tracking-widest text-neutral-500 mb-3 border-b border-neutral-700 pb-1 font-bold">Atributos</h3>
          <div className="flex justify-around text-center">
            <div className="flex flex-col items-center">
              <div className="text-2xl rpg-font text-white">{character.attributes.coragem}</div>
              <div className="text-[8px] uppercase text-neutral-600 font-bold tracking-tighter">Coragem</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl rpg-font text-white">{character.attributes.conhecimento}</div>
              <div className="text-[8px] uppercase text-neutral-600 font-bold tracking-tighter">Sabedoria</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl rpg-font text-white">{character.attributes.coracao}</div>
              <div className="text-[8px] uppercase text-neutral-600 font-bold tracking-tighter">Coração</div>
            </div>
          </div>
        </div>

        {/* Saúde */}
        <div className="bg-neutral-800/40 p-3 rounded border border-neutral-800/50">
          <h3 className="text-[9px] uppercase tracking-widest text-neutral-500 mb-2 border-b border-neutral-700 pb-1 font-bold">Estado Vital</h3>
          <div className="flex gap-1.5">
            {[HealthStatus.BEM, HealthStatus.CUIDADO, HealthStatus.PERIGO].map(status => (
              <button
                key={status}
                onClick={() => updateHealth(status)}
                className={`flex-1 py-1.5 text-[9px] uppercase rounded transition-all font-bold ${character.health === status ? 'bg-red-900 text-white shadow-[0_0_10px_rgba(153,27,27,0.3)]' : 'bg-neutral-700/50 text-neutral-500 hover:text-neutral-300'}`}
              >
                {status}
              </button>
            ))}
          </div>
          <p className="text-[8px] mt-2 text-neutral-600 text-center uppercase tracking-widest">
            {character.health === HealthStatus.BEM && "Integridade Plena"}
            {character.health === HealthStatus.CUIDADO && "Penalidade (-1)"}
            {character.health === HealthStatus.PERIGO && "Penalidade Crítica (-2)"}
          </p>
        </div>

        {/* Pontos de Trama */}
        <div className="bg-neutral-800/40 p-3 rounded border border-neutral-800/50 flex items-center justify-between">
          <span className="text-[9px] uppercase text-neutral-500 font-bold tracking-widest">Sorte / Trama</span>
          <div className="flex items-center gap-2">
            <button onClick={() => updatePlotPoints(-1)} className="w-6 h-6 rounded bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center text-white text-xs">-</button>
            <span className="text-lg rpg-font text-amber-600 min-w-[20px] text-center">{character.plotPoints}</span>
            <button onClick={() => updatePlotPoints(1)} className="w-6 h-6 rounded bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center text-white text-xs">+</button>
          </div>
        </div>

        {/* Características */}
        <div className="bg-neutral-800/40 p-3 rounded border border-neutral-800/50">
          <h3 className="text-[9px] uppercase tracking-widest text-neutral-500 mb-2 border-b border-neutral-700 pb-1 font-bold">Talentos Inatos</h3>
          <div className="space-y-2">
            <CharacteristicItem 
              label="Coragem" 
              desc={character.characteristics.coragem} 
              used={character.characteristics.used.coragem} 
              onToggle={() => toggleCharacteristic('coragem')} 
            />
            <CharacteristicItem 
              label="Sabedoria" 
              desc={character.characteristics.conhecimento} 
              used={character.characteristics.used.conhecimento} 
              onToggle={() => toggleCharacteristic('conhecimento')} 
            />
            <CharacteristicItem 
              label="Coração" 
              desc={character.characteristics.coracao} 
              used={character.characteristics.used.coracao} 
              onToggle={() => toggleCharacteristic('coracao')} 
            />
          </div>
        </div>

        {/* Equipamentos */}
        <div className="bg-neutral-800/40 p-3 rounded border border-neutral-800/50">
           <h3 className="text-[9px] uppercase tracking-widest text-neutral-500 mb-2 border-b border-neutral-700 pb-1 font-bold">Inventário (Máx. 3)</h3>
           {character.equipment.length === 0 ? (
             <p className="text-[9px] italic text-neutral-700 p-2">Vazio...</p>
           ) : (
             <ul className="text-[10px] space-y-1.5 p-1">
               {character.equipment.map((item, idx) => (
                 <li key={idx} className="flex justify-between items-center group bg-neutral-950/30 p-1.5 rounded border border-neutral-800/30">
                    <span className="text-neutral-400 font-serif">† {item}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate({...character, equipment: character.equipment.filter((_, i) => i !== idx)});
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-900 hover:text-red-600 transition-opacity p-1"
                    >✕</button>
                 </li>
               ))}
             </ul>
           )}
           {character.equipment.length < 3 && (
             <input 
              className="w-full mt-3 bg-neutral-950/50 text-[10px] p-2 border border-neutral-800 rounded focus:outline-none focus:border-red-900/40 text-neutral-400 placeholder:text-neutral-700"
              placeholder="+ Adicionar Item..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  onUpdate({...character, equipment: [...character.equipment, e.currentTarget.value.trim()].slice(0, 3)});
                  e.currentTarget.value = '';
                }
              }}
             />
           )}
        </div>
      </div>
    </div>
  );
};

const CharacteristicItem = ({ label, desc, used, onToggle }: { label: string, desc: string, used: boolean, onToggle: () => void }) => (
  <div 
    onClick={onToggle} 
    className={`cursor-pointer group p-2 rounded border transition-all duration-300 ${used ? 'bg-neutral-950/50 border-neutral-800 opacity-50' : 'bg-neutral-900 border-red-900/10 hover:border-red-900/40 hover:bg-neutral-800'}`}
  >
    <div className="flex justify-between items-center mb-0.5">
      <span className={`text-[8px] uppercase font-bold tracking-tighter ${used ? 'text-neutral-600 line-through' : 'text-red-800'}`}>{label}</span>
      {used && <span className="text-[7px] text-neutral-700 uppercase font-black">Consumido</span>}
    </div>
    <div className={`text-[10px] italic leading-tight font-serif ${used ? 'text-neutral-700' : 'text-neutral-300'}`}>{desc}</div>
  </div>
);

export default CharacterSheet;
