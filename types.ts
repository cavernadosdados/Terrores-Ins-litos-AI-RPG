
export enum HealthStatus {
  BEM = 'Bem',
  CUIDADO = 'Cuidado',
  PERIGO = 'Perigo'
}

export interface Adventure {
  title: string;
  description: string;
}

export interface NPC {
  name: string;
  description: string;
  motivation: string;
}

export interface Character {
  name: string;
  presentation: string;
  attributes: {
    coragem: number;
    conhecimento: number;
    coracao: number;
  };
  characteristics: {
    coragem: string;
    conhecimento: string;
    coracao: string;
    used: {
      coragem: boolean;
      conhecimento: boolean;
      coracao: boolean;
    };
  };
  health: HealthStatus;
  plotPoints: number;
  equipment: string[];
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: number;
}

export interface GameState {
  storyKeywords: string[] | null;
  adventure: Adventure | null;
  character: Character | null;
  history: Message[];
  tension: number;
  maxTension: number;
  npcs: NPC[];
  notes: string;
}
