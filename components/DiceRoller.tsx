
import React, { useState } from 'react';
import { DiceIcon } from '../constants';

interface Props {
  onRoll: (result: { pos: number[], neg: number[], mod: number }) => void;
}

const DiceRoller: React.FC<Props> = ({ onRoll }) => {
  const [numPos, setNumPos] = useState(1);
  const [numNeg, setNumNeg] = useState(1);
  const [mod, setMod] = useState(0);

  const roll = () => {
    const pos = Array.from({ length: numPos }, () => Math.floor(Math.random() * 6) + 1);
    const neg = Array.from({ length: numNeg }, () => Math.floor(Math.random() * 6) + 1);
    onRoll({ pos, neg, mod });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 bg-neutral-900/90 p-3 rounded-lg border border-neutral-800 shadow-xl">
      <div className="flex flex-col items-center">
        <label className="text-[10px] uppercase text-neutral-500 mb-1">Dados +</label>
        <div className="flex items-center gap-2">
          <button onClick={() => setNumPos(Math.max(1, numPos - 1))} className="w-5 h-5 bg-neutral-800 rounded flex items-center justify-center text-xs hover:bg-neutral-700">-</button>
          <span className="text-green-600 font-bold w-4 text-center">{numPos}</span>
          <button onClick={() => setNumPos(numPos + 1)} className="w-5 h-5 bg-neutral-800 rounded flex items-center justify-center text-xs hover:bg-neutral-700">+</button>
        </div>
      </div>

      <div className="h-8 w-px bg-neutral-800 self-center"></div>

      <div className="flex flex-col items-center">
        <label className="text-[10px] uppercase text-neutral-500 mb-1">Dados -</label>
        <div className="flex items-center gap-2">
          <button onClick={() => setNumNeg(Math.max(1, numNeg - 1))} className="w-5 h-5 bg-neutral-800 rounded flex items-center justify-center text-xs hover:bg-neutral-700">-</button>
          <span className="text-red-700 font-bold w-4 text-center">{numNeg}</span>
          <button onClick={() => setNumNeg(numNeg + 1)} className="w-5 h-5 bg-neutral-800 rounded flex items-center justify-center text-xs hover:bg-neutral-700">+</button>
        </div>
      </div>

      <div className="h-8 w-px bg-neutral-800 self-center"></div>

      <div className="flex flex-col items-center">
        <label className="text-[10px] uppercase text-neutral-500 mb-1">Mod.</label>
        <input 
          type="number"
          value={mod}
          onChange={(e) => setMod(parseInt(e.target.value) || 0)}
          className="w-10 bg-neutral-800 border border-neutral-700 rounded text-center text-xs p-1 focus:outline-none focus:border-red-900"
        />
      </div>

      <button 
        onClick={roll}
        className="ml-auto bg-red-900 hover:bg-red-800 text-white p-3 rounded-full transition-transform active:scale-95 shadow-lg flex items-center justify-center"
        title="Rolar Dados"
      >
        <DiceIcon />
      </button>
    </div>
  );
};

export default DiceRoller;
