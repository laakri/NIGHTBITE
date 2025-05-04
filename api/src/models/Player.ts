import type { Card } from './Card';
import type { Effect } from './Effect';

export enum Phase {
  Normal = 'normal',
  BloodMoon = 'bloodMoon',
  Void = 'void'
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
  isInVoid: boolean;
  isEvading: boolean;
  activeEffects: {
    id: string;
    type: string;
    value: number;
    duration: number;
  }[];
  lastPlayedCards?: {
    id: string;
    name: string;
    effects: Effect[];
  }[];
  lastPhaseChange: Phase;
  phaseStreak: number;
  bloodMoonStreak: number;
  voidStreak: number;
}

export interface Player {
  id: string;
  username: string;
  stats: {
    health: number;
    maxHealth: number;
    bloodEnergy: number;
    maxBloodEnergy: number;
    shields: number;
  };
  state: PlayerState;
  hand: Card[];
  deck: Card[];
  discardPile: Card[];
  battlefield: Card[];
  
  // Game State
  isReady: boolean;
  hasPlayedCard: boolean;
  
  // Metadata
  avatar?: string;
  rank?: string;
  title?: string;
  achievements?: Achievement[];
}

export const createPlayer = (id: string, username: string): Player => {
  return {
    id,
    username,
    stats: {
      health: 20,
      maxHealth: 20,
      bloodEnergy: 1,
      maxBloodEnergy: 10,
      shields: 0,
    },
    state: {
      isInBloodMoon: false,
      isInVoid: false,
      isEvading: false,
      activeEffects: [],
      lastPhaseChange: Phase.Normal,
      phaseStreak: 0,
      bloodMoonStreak: 0,
      voidStreak: 0
    },
    hand: [],
    deck: [],
    discardPile: [],
    battlefield: [],
    isReady: false,
    hasPlayedCard: false,
    avatar: undefined,
    rank: undefined,
    title: undefined,
    achievements: []
  };
};
