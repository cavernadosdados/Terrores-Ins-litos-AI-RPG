
import React, { useState, useEffect, useRef } from 'react';
import { Character, GameState, Message, HealthStatus, Adventure, NPC } from './types';
import StoryKeywordsSelection from './components/StoryKeywordsSelection';
import AdventureSelection from './components/AdventureSelection';
import CharacterCreation from './components/CharacterCreation';
import CharacterSheet from './components/CharacterSheet';
import DiceRoller from './components/DiceRoller';
import TutorialOverlay from './components/TutorialOverlay';
import { getGMResponse, generateImage, generateFirstScene } from './services/geminiService';

const STORAGE_KEY = 'terrores_insolitos_game_state_v3';
const TUTORIAL_KEY = 'terrores_insolitos_tutorial_seen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    storyKeywords: null,
    adventure: null,
    character: null,
    history: [],
    tension: 0,
    maxTension: 2,
    npcs: [],
    notes: ''
  });

  const [showHome, setShowHome] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [isLoding, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('O Mestre está tecendo o destino...');
  const [isGeneratingImageIdx, setIsGeneratingImageIdx] = useState<number | null>(null);
  const [showSheet, setShowSheet] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [gameState.history, isLoding]);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem(TUTORIAL_KEY);
    if (!tutorialSeen) {
      setShowTutorial(true);
      localStorage.setItem(TUTORIAL_KEY, 'true');
    }
  }, []);

  const handleNewGame = () => {
    if (localStorage.getItem(STORAGE_KEY)) {
      if (!window.confirm("Isso apagará sua aventura salva atual. Deseja continuar?")) {
        return;
      }
    }
    localStorage.removeItem(STORAGE_KEY);
    setGameState({
      storyKeywords: null,
      adventure: null,
      character: null,
      history: [],
      tension: 0,
      maxTension: 2,
      npcs: [],
      notes: ''
    });
    setShowHome(false);
  };

  const handleContinueGame = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(parsed);
        setShowHome(false);
      } catch (e) {
        console.error("Erro ao carregar jogo:", e);
        alert("Erro ao carregar o arquivo de salvamento.");
      }
    }
  };

  const handleSaveGame = () => {
    setSaveStatus('saving');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleKeywordsSelected = (keywords: string[]) => {
    setGameState(prev => ({ ...prev, storyKeywords: keywords }));
  };

  const handleAdventureSelected = (adv: Adventure) => {
    setGameState(prev => ({ ...prev, adventure: adv }));
  };

  const handleBackToKeywords = () => {
    setGameState(prev => ({ ...prev, storyKeywords: null, adventure: null }));
  };

  const handleCharacterCreated = async (char: Character) => {
    if (!gameState.adventure || !gameState.storyKeywords) return;

    setIsLoading(true);
    setLoadingText('Tecendo o Prólogo...');
    
    // We need to set the state first so generateFirstScene has some context, 
    // but we can also pass it directly.
    try {
      const firstSceneContent = await generateFirstScene(
        gameState.adventure, 
        char, 
        gameState.storyKeywords
      );

      const welcomeMsg: Message = {
        role: 'assistant',
        content: firstSceneContent,
        timestamp: Date.now()
      };

      setGameState(prev => ({
        ...prev,
        character: char,
        history: [welcomeMsg],
        tension: 0,
        maxTension: 2,
        npcs: [],
        notes: ''
      }));
    } catch (error) {
      console.error("Erro ao iniciar aventura:", error);
      // Fallback in case of API failure
      const fallbackMsg: Message = {
        role: 'assistant',
        content: `**${gameState.adventure.title}** começa agora. Você é ${char.name}. Algo sombrio aguarda... O que você faz?`,
        timestamp: Date.now()
      };
      setGameState(prev => ({ ...prev, character: char, history: [fallbackMsg] }));
    } finally {
      setIsLoading(false);
      setLoadingText('O Mestre está tecendo o destino...');
    }
  };

  const handleUpdateNotes = (notes: string) => {
    setGameState(prev => ({ ...prev, notes }));
  };

  const handleGenerateImageForMessage = async (index: number) => {
    const msg = gameState.history[index];
    if (!msg || msg.imageUrl || isGeneratingImageIdx !== null) return;

    setIsGeneratingImageIdx(index);
    try {
      const imageUrl = await generateImage(msg.content);
      if (imageUrl) {
        setGameState(prev => {
          const newHistory = [...prev.history];
          newHistory[index] = { ...newHistory[index], imageUrl };
          return { ...prev, history: newHistory };
        });
      }
    } catch (error) {
      console.error("Erro ao gerar imagem sob demanda:", error);
    } finally {
      setIsGeneratingImageIdx(null);
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const text = customMessage || userInput;
    if (!text.trim() || !gameState.character || !gameState.adventure || isLoding) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setGameState(prev => ({ ...prev, history: [...prev.history, userMsg] }));
    if (!customMessage) setUserInput('');
    setIsLoading(true);

    try {
      const response = await getGMResponse(
        [...gameState.history, userMsg],
        gameState.character,
        gameState.adventure,
        gameState.tension,
        gameState.npcs
      );

      const gmMsg: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setGameState(prev => ({ ...prev, history: [...prev.history, gmMsg] }));
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        role: 'assistant',
        content: "*Uma interferência sombria impede a narração. Tente novamente.*",
        timestamp: Date.now()
      };
      setGameState(prev => ({ ...prev, history: [...prev.history, errorMsg] }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoll = ({ pos, neg, mod }: { pos: number[], neg: number[], mod: number }) => {
    const sumPos = pos.reduce((a, b) => a + b, 0);
    const sumNeg = neg.reduce((a, b) => a + b, 0);
    const total = sumPos - sumNeg + mod;
    
    const rollMsg = `🎲 **ROLAGEM DE DADOS**:
    Positivos: [${pos.join(', ')}] (Soma: ${sumPos})
    Negativos: [${neg.join(', ')}] (Soma: ${sumNeg})
    Modificador Aplicado: **${mod >= 0 ? '+' : ''}${mod}**
    RESULTADO FINAL: **${total}**`;

    handleSendMessage(rollMsg);
  };

  const updateCharacter = (newChar: Character) => {
    setGameState(prev => ({ ...prev, character: newChar }));
  };

  const updateTension = (delta: number) => {
    setGameState(prev => ({ 
      ...prev, 
      tension: Math.min(prev.maxTension, Math.max(0, prev.tension + delta)) 
    }));
  };

  const handleFinishAdventure = () => {
    const confirmed = window.confirm("Deseja realmente encerrar esta aventura? Todo o progresso NÃO SALVO será perdido.");
    if (confirmed) {
      setShowHome(true);
      setGameState({
        storyKeywords: null,
        adventure: null,
        character: null,
        history: [],
        tension: 0,
        maxTension: 2,
        npcs: [],
        notes: ''
      });
    }
  };

  if (showHome) {
    const savedExists = !!localStorage.getItem(STORAGE_KEY);
    return (
      <div className="min-h-screen bg-blood flex items-center justify-center p-4 overflow-y-auto text-neutral-200">
        <div className="max-w-xl w-full bg-neutral-900/90 p-10 rounded-xl border border-red-900/20 shadow-2xl text-center space-y-8">
          <h1 className="rpg-font text-5xl md:text-6xl text-red-700 tracking-[0.1em] drop-shadow-lg">TERRORES INSÓLITOS</h1>
          <p className="text-neutral-400 font-serif italic text-lg">Onde a narrativa encontra o horror e a sorte é sua única aliada.</p>
          
          <div className="flex flex-col gap-4 pt-6">
            <button onClick={handleNewGame} className="w-full py-5 bg-red-950 hover:bg-red-900 text-white rpg-font text-2xl tracking-[0.2em] rounded transition-all shadow-xl hover:scale-[1.02]">
              NOVA AVENTURA
            </button>
            {savedExists && (
              <button onClick={handleContinueGame} className="w-full py-5 border border-red-900/40 text-red-600 hover:text-white hover:bg-red-900/20 rpg-font text-2xl tracking-[0.2em] rounded transition-all">
                CONTINUAR JORNADA
              </button>
            )}
            <button onClick={() => setShowTutorial(true)} className="w-full py-3 text-[10px] uppercase tracking-[0.4em] text-neutral-600 hover:text-neutral-400 transition-colors">
              Ver Guia de Sobrevivência
            </button>
          </div>
        </div>
        {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
      </div>
    );
  }

  if (!gameState.storyKeywords) return <div className="min-h-screen bg-blood flex items-center justify-center p-4"><StoryKeywordsSelection onConfirm={handleKeywordsSelected} /></div>;
  if (!gameState.adventure) return <div className="min-h-screen bg-blood flex items-center justify-center p-4"><AdventureSelection keywords={gameState.storyKeywords} onConfirm={handleAdventureSelected} onBack={handleBackToKeywords} /></div>;
  
  // Custom loading screen when transitioning to the game (generating first scene)
  if (isLoding && gameState.history.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-8 animate-pulse">
        <div className="w-16 h-16 border-4 border-red-900 border-t-transparent rounded-full animate-spin"></div>
        <div className="space-y-2">
          <h2 className="rpg-font text-3xl text-red-800 tracking-[0.2em] uppercase">{loadingText}</h2>
          <p className="text-neutral-600 font-serif italic">Invocando as sombras da aventura...</p>
        </div>
      </div>
    );
  }

  if (!gameState.character) return <div className="min-h-screen bg-blood flex items-center justify-center p-4"><CharacterCreation adventure={gameState.adventure} onComplete={handleCharacterCreated} /></div>;

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row h-screen overflow-hidden text-neutral-200">
      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-neutral-900 shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 flex flex-col ${showSheet ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex justify-between items-center border-b border-neutral-800">
          <button onClick={() => setShowTutorial(true)} className="p-2 bg-neutral-800 rounded hover:bg-neutral-700 text-neutral-400 text-[10px] uppercase tracking-widest">
            📖 Ajuda
          </button>
          <button onClick={() => setShowSheet(false)} className="md:hidden p-2 text-neutral-500 hover:text-red-700 text-xl">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
          <CharacterSheet character={gameState.character} onUpdate={updateCharacter} />
          
          <div className="border-t border-neutral-800 pt-4 flex flex-col h-64">
            <h3 className="text-[10px] uppercase tracking-widest text-red-900 font-bold mb-3 flex items-center gap-2">
              <span className="text-sm">📓</span> Diário de Investigação
            </h3>
            <textarea 
              className="flex-1 bg-neutral-950 border border-neutral-800 p-3 text-[12px] text-neutral-400 focus:outline-none focus:border-red-900/40 rounded resize-none font-serif leading-relaxed placeholder:text-neutral-800 scrollbar-thin"
              placeholder="Anote pistas, nomes de PNJs e detalhes macabros..."
              value={gameState.notes}
              onChange={(e) => handleUpdateNotes(e.target.value)}
            />
            <p className="text-[8px] uppercase tracking-tighter text-neutral-700 mt-2 text-right">
              Salvo no registro de alma
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-800 bg-neutral-900 space-y-3">
          <div className="p-3 bg-neutral-800/50 rounded border border-red-900/20">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Tensão</span>
              <span className="text-xs rpg-font text-red-600">{gameState.tension} / {gameState.maxTension}</span>
            </div>
            <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden border border-neutral-900">
              <div className="h-full bg-red-800 transition-all duration-700" style={{ width: `${(gameState.tension / gameState.maxTension) * 100}%` }}></div>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <button onClick={() => updateTension(-1)} className="px-4 py-1 bg-neutral-700 text-[12px] rounded hover:bg-neutral-600 text-white">-</button>
              <button onClick={() => updateTension(1)} className="px-4 py-1 bg-neutral-700 text-[12px] rounded hover:bg-neutral-600 text-white">+</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleSaveGame} disabled={saveStatus !== 'idle'} className={`py-2 rounded text-[9px] uppercase tracking-widest transition-all font-bold border ${saveStatus === 'saved' ? 'bg-green-900/20 border-green-900 text-green-500' : saveStatus === 'saving' ? 'bg-neutral-800 border-neutral-700 text-neutral-500 animate-pulse' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'}`}>
              {saveStatus === 'saved' ? 'Salvo!' : saveStatus === 'saving' ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={handleFinishAdventure} className="py-2 bg-red-950/20 hover:bg-red-900 text-red-700 hover:text-white border border-red-900/40 rounded text-[9px] uppercase tracking-widest transition-all font-bold">
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        <div className="md:hidden bg-neutral-900 p-3 flex justify-between items-center border-b border-neutral-800 z-10">
           <button onClick={() => setShowSheet(!showSheet)} className="text-neutral-400 text-[10px] uppercase tracking-widest border border-neutral-700 px-3 py-1.5 rounded">Ver Ficha</button>
           <h1 className="rpg-font text-red-800 text-xs tracking-[0.1em]">TERRORES INSÓLITOS</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
          {gameState.history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[88%] md:max-w-[75%] p-4 rounded-lg shadow-xl leading-relaxed text-lg relative ${msg.role === 'user' ? 'bg-neutral-800 text-neutral-200 rounded-tr-none' : 'bg-neutral-900 text-neutral-300 border-l-4 border-red-900 rounded-tl-none grunge-border'}`}>
                {msg.imageUrl ? (
                  <div className="mb-4 rounded overflow-hidden shadow-2xl border border-neutral-800 bg-black">
                    <img src={msg.imageUrl} alt="Cena visual" className="w-full h-auto object-cover opacity-80 hover:opacity-100 transition-opacity duration-1000" loading="lazy" />
                  </div>
                ) : msg.role === 'assistant' && !msg.content.includes("interferência sombria") && !msg.content.includes("ROLAGEM DE DADOS") && (
                  <button disabled={isGeneratingImageIdx !== null} onClick={() => handleGenerateImageForMessage(idx)} className="mb-4 flex items-center justify-center gap-2 w-full py-3 bg-neutral-950 border border-neutral-800 text-[10px] uppercase tracking-widest text-neutral-500 hover:text-red-700 hover:border-red-900 transition-all rounded">
                    {isGeneratingImageIdx === idx ? 'Tecendo Visão...' : '🖼️ Visualizar Cena'}
                  </button>
                )}
                <div className="prose prose-invert prose-red max-w-none" dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
              </div>
            </div>
          ))}
          {isLoding && <div className="flex justify-start animate-pulse"><div className="bg-neutral-900 p-4 rounded-lg text-neutral-500 italic flex items-center gap-3 border border-neutral-800/30">{loadingText}</div></div>}
          <div ref={chatEndRef} className="h-4" />
        </div>

        <div className="p-4 bg-neutral-950 border-t border-neutral-900/50 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
              <div className="flex-1">
                <textarea rows={3} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-neutral-200 focus:outline-none focus:border-red-900/60 resize-none transition-all placeholder:text-neutral-700" placeholder="Descreva sua ação com cuidado..." value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} />
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <DiceRoller onRoll={handleRoll} />
                <button onClick={() => handleSendMessage()} disabled={isLoding || !userInput.trim()} className="bg-red-900 hover:bg-red-800 disabled:opacity-30 text-white font-bold py-3 px-8 rounded-lg transition-all rpg-font text-xl tracking-[0.2em] shadow-lg w-full active:scale-95">AGIR</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatContent(content: string) {
  return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br />');
}

export default App;
