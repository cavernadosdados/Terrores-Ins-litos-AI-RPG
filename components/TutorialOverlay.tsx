
import React, { useState } from 'react';

interface Step {
  title: string;
  content: string;
  target?: string;
}

const steps: Step[] = [
  {
    title: "BEM-VINDO AOS TERRORES INSÓLITOS",
    content: "Este é um RPG de horror de sobrevivência narrado por uma Inteligência Artificial. Aqui, suas escolhas e a sorte nos dados determinam se você verá o amanhecer."
  },
  {
    title: "A FICHA DE PERSONAGEM",
    content: "À esquerda, você tem seus Atributos (Coragem, Sabedoria e Coração). Eles são somados às suas rolagens. Seus 'Talentos' podem ser usados uma vez por aventura para garantir vantagens narrativas."
  },
  {
    title: "O SISTEMA DE DADOS",
    content: "Não é um simples teste. Você rola Dados Positivos (verdes) e Dados Negativos (vermelhos). O resultado final é: (Soma dos Verdes) - (Soma dos Vermelhos) + Seu Atributo. O Mestre define a dificuldade de 0 a 3."
  },
  {
    title: "MEDIDOR DE TENSÃO",
    content: "Abaixo da ficha, o Medidor de Tensão sobe conforme o perigo aumenta. Se ele atingir o máximo, algo terrível certamente acontecerá. O Mestre usa a Tensão para dificultar suas provações."
  },
  {
    title: "VISUALIZANDO O HORROR",
    content: "Sempre que o Mestre narrar uma cena importante, você verá um botão 'Visualizar Cena'. Use-o com sabedoria para materializar os horrores descritos em imagens cinematográficas."
  },
  {
    title: "INTERAÇÃO",
    content: "Descreva suas ações de forma clara no chat. O Mestre é rigoroso: foque em uma ação por vez. Se ele pedir um teste, você DEVE rolar os dados antes de prosseguir."
  }
];

interface Props {
  onClose: () => void;
}

const TutorialOverlay: React.FC<Props> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="max-w-lg w-full bg-neutral-900 border-2 border-red-900/40 p-8 rounded-lg shadow-[0_0_50px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-neutral-800">
          <div 
            className="h-full bg-red-800 transition-all duration-300" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        <h2 className="rpg-font text-2xl text-red-700 mb-4 tracking-wider uppercase">
          {steps[currentStep].title}
        </h2>
        
        <p className="text-neutral-300 text-lg leading-relaxed mb-8 font-serif italic">
          {steps[currentStep].content}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-[10px] text-neutral-600 uppercase tracking-widest">
            Página {currentStep + 1} de {steps.length}
          </span>
          <button 
            onClick={next}
            className="px-6 py-2 bg-red-950 hover:bg-red-800 text-white rpg-font text-sm tracking-widest transition-colors rounded"
          >
            {currentStep === steps.length - 1 ? "ENTENDIDO" : "PRÓXIMO"}
          </button>
        </div>

        {currentStep === 0 && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-600 hover:text-neutral-400 text-xs uppercase"
          >
            Pular
          </button>
        )}
      </div>
    </div>
  );
};

export default TutorialOverlay;
