
import { GoogleGenAI, Type } from "@google/genai";
import { Message, Character, Adventure, NPC } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `Você é o Mestre do jogo "Terrores Insólitos". Sua tarefa é narrar uma aventura de horror e sobrevivência.

CONTEXTO DA AVENTURA:
Título: {{adventure_title}}
Premissa: {{adventure_desc}}

REGRAS CRÍTICAS E OBRIGATÓRIAS:
1. SISTEMA: O sistema usa dados de 6 lados. Um dado Positivo (D+) e um dado Negativo (D-).
2. RESULTADO: (Soma D+) - (Soma D-) + Atributo do personagem + Modificador opcional.
3. PROVAÇÕES: Defina níveis de dificuldade de 0 a 3. 
   - QUANDO PEDIR UM TESTE: Você deve ser explícito. Ex: "Faça um teste de Coragem (Dificuldade 1)".
4. RESULTADOS DE TESTE:
   - Sucesso: Resultado > Dificuldade.
   - Problema: Resultado == Dificuldade.
   - Falha: Resultado < Dificuldade.
5. PNJs: O jogador pode manifestar PNJs. Use-os na narrativa se o jogador interagir com eles.
6. ESTILO: Use Markdown. Seja visceral, poético e sombrio. Varie o ritmo.

PERSONAGEM ATUAL:
Nome: {{name}}
Apresentação: {{presentation}}
Atributos: Coragem {{coragem}}, Sabedoria {{conhecimento}}, Coração {{coracao}}
Saúde: {{health}}
PNJs CONHECIDOS: {{npcs}}`;

export const generateAdventureHook = async (keywords: string[]): Promise<Adventure> => {
  const prompt = `Gere um título impactante e uma sinopse curta (uma frase) para um RPG de horror. Elementos: ${keywords.join(', ')}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["title", "description"],
      },
    },
  });
  return JSON.parse(response.text || "{}");
};

export const generateFirstScene = async (adventure: Adventure, character: Character, keywords: string[]): Promise<string> => {
  const prompt = `Você é um Mestre de RPG de Horror. Escreva a PRIMEIRA CENA da aventura "${adventure.title}".
  Premissa: ${adventure.description}
  Personagem: ${character.name}, ${character.presentation}.
  Elementos de tom: ${keywords.join(', ')}.

  DIRETRIZES:
  1. Não use clichês óbvios de abertura se não for necessário.
  2. Comece descrevendo o cenário e o que o personagem está fazendo no momento.
  3. Pode ser um momento mundano (vida cotidiana) onde o horror começa a se infiltrar, ou um momento de tensão já estabelecido.
  4. Use descrições sensoriais (sons, cheiros, iluminação).
  5. Termine com uma pergunta ou uma situação que exija uma reação imediata.
  6. Máximo de 2 parágrafos imersivos. Use Markdown.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
  });
  return response.text || "A escuridão é a única coisa que resta...";
};

export const generateNPC = async (adventure: Adventure, history: Message[]): Promise<NPC> => {
  const lastHistory = history.slice(-5).map(m => m.content).join('\n');
  const prompt = `Com base na aventura "${adventure.title}" e no histórico recente: "${lastHistory}", crie um Personagem Não Jogador (PNJ) enigmático. 
  Nome, descrição sensorial e motivação secreta. Mantenha o tom de horror.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          motivation: { type: Type.STRING },
        },
        required: ["name", "description", "motivation"],
      },
    },
  });
  return JSON.parse(response.text || "{}");
};

export const generateImage = async (narrative: string): Promise<string | undefined> => {
  try {
    const prompt = `Horror cinematográfico, sombrio, 16:9. Cena: ${narrative.substring(0, 500)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (error) { console.error(error); }
  return undefined;
};

export const getGMResponse = async (history: Message[], character: Character, adventure: Adventure, tension: number, npcs: NPC[]) => {
  const npcsStr = npcs.map(n => `${n.name} (${n.description})`).join('; ') || 'Nenhum conhecido ainda.';
  
  const model = ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: history.map(m => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }]
    })),
    config: {
      systemInstruction: SYSTEM_PROMPT
        .replace('{{adventure_title}}', adventure.title)
        .replace('{{adventure_desc}}', adventure.description)
        .replace('{{name}}', character.name)
        .replace('{{presentation}}', character.presentation)
        .replace('{{coragem}}', character.attributes.coragem.toString())
        .replace('{{conhecimento}}', character.attributes.conhecimento.toString())
        .replace('{{coracao}}', character.attributes.coracao.toString())
        .replace('{{health}}', character.health)
        .replace('{{npcs}}', npcsStr),
      temperature: 0.9,
    }
  });

  const response = await model;
  return response.text || "O silêncio consome o ambiente...";
};
