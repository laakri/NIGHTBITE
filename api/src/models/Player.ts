import type { Card } from './Card';

export enum Phase {
  Normal = 'normal',
  BloodMoon = 'bloodMoon',
  Void = 'void'
}

export interface Effect {
  id: string;
  type: string;
  value: number;
  duration: number;
  source?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt?: Date;
  progress?: number;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  bloodEnergy: number;  // Only used during blood moon phases
  maxBloodEnergy: number;
  bloodMoonMeter: number;
  shields: number;
  momentum: number;
  phasePower: {
    [key in Phase]?: number;
  };
}

export interface PlayerState {
  isInBloodMoon: boolean;
  isInVoid: boolean;  // Track if player is in void state
  isEvading: boolean;
  activeEffects: Effect[];
  lastPhaseChange: Phase;
  phaseStreak: number;
  bloodMoonStreak: number;
  voidStreak: number;  // Track consecutive void phases
  lastPlayedCards?: {
    id: string;
    name: string;
    effects: any[];
  }[];
  bloodMoonTurnsLeft?: number;
}

export interface Player {
  id: string;
  username: string;
  stats: PlayerStats;
  state: PlayerState;
  
  // Card Collections
  hand: Card[];
  deck: Card[];
  discardPile: Card[];
  battlefield: Card[];  // Cards currently in play
  bloodMoonPile?: Card[];  // Special cards only available in blood moon
  
  // Game State
  isReady: boolean;
  hasPlayedCard: boolean;
  
  // Metadata
  avatar?: string;
  rank?: string;
  title?: string;
  achievements?: Achievement[];
}

export function createPlayer(id: string, username: string): Player {
  return {
    id,
    username,
    stats: {
      health: 20,
      maxHealth: 20,
      bloodEnergy: 0,
      maxBloodEnergy: 0,
      bloodMoonMeter: 0,
      shields: 0,
      momentum: 0,
      phasePower: {}
    },
    state: {
      isInBloodMoon: false,
      isInVoid: false,
      isEvading: false,
      activeEffects: [],
      lastPhaseChange: Phase.Normal,
      phaseStreak: 0,
      bloodMoonStreak: 0,
      voidStreak: 0,
      lastPlayedCards: []
    },
    hand: [],
    deck: [],
    discardPile: [],
    battlefield: [],
    bloodMoonPile: undefined,
    isReady: false,
    hasPlayedCard: false,
    avatar: undefined,
    rank: undefined,
    title: undefined,
    achievements: []
  };
}
