import type { Card } from "./Card";

export interface PlayerStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  bloodMoonMeter: number;
  shields: number;
  crystals: number;
  powerBoost: number;
  temporaryAttackBoost: number;
  voidShieldDuration?: number;
  inOverdrive: boolean;
}

export interface PlayerState {
  isInBloodMoon: boolean;
  bloodMoonTurnsLeft?: number;
  bloodMoonCharge: number;
  hasEvasion: boolean;
  evasionDuration: number;
  enemiesKilledThisTurn: number;
  activeEffects: {
    id: string;
    type: string;
    value: number;
    duration: number;
  }[];
  lastPlayedCard?: {
    id: string;
    name: string;
    effects: any[];
  };
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
  rank?: number;
  title?: string;
}

export function createPlayer(id: string, username: string): Player {
  return {
    id,
    username,
    stats: {
      health: 20,
      maxHealth: 20,
      energy: 1,
      maxEnergy: 1,
      bloodMoonMeter: 0,
      shields: 0,
      crystals: 0,
      powerBoost: 0,
      temporaryAttackBoost: 0,
      inOverdrive: false
    },
    state: {
      isInBloodMoon: false,
      bloodMoonTurnsLeft: undefined,
      bloodMoonCharge: 0,
      hasEvasion: false,
      evasionDuration: 0,
      enemiesKilledThisTurn: 0,
      activeEffects: []
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
    title: undefined
  };
}
