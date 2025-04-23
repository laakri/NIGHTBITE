import type { Player } from '../models/Player';
import type { Card } from '../models/Card';
import type { Effect, EffectType } from '../models/Effect';
import { Phase } from '../models/Card';

export interface EffectResult {
  type: EffectType;
  value?: number;
  sourceCardId: string;
  sourceCardName: string;
  targetPlayerId: string;
  appliedAt: number; // timestamp
}

// Interface for opponent data that is safe to send to the frontend
export interface OpponentPublicData {
  id: string;
  username: string;
  stats: {
    health: number;
    maxHealth: number;
    bloodEnergy: number;
    maxBloodEnergy: number;
    bloodMoonMeter: number;
    shields: number;
    energy?: number;
    maxEnergy?: number;
    crystals?: number;
    powerBoost?: number;
    temporaryAttackBoost?: number;
    voidShieldDuration?: number;
    inOverdrive?: boolean;
  };
  state: {
    isInBloodMoon: boolean;
    isInVoid: boolean;
    hasEvasion: boolean;
    bloodMoonCharge?: number;
    evasionDuration?: number;
    enemiesKilledThisTurn?: number;
    activeEffects: {
      id: string;
      type: string;
      value: number;
      duration: number;
    }[];
    lastPlayedCards?: {
      id: string;
      name: string;
      effects: any[];
    }[];
  };
  handSize: number;
  deckSize: number;
  discardPileSize: number;
  battlefield: Card[];
}

// Interface for the game state data sent to the frontend
export interface FrontendGameState {
  gameId: string;
  currentPhase: Phase;
  phaseChangeCounter: number;
  phaseJustChanged: boolean;
  phaseLocked: boolean;
  phaseLockDuration?: number;
  turnCount: number;
  isYourTurn: boolean;
  player: Player;
  opponent: OpponentPublicData;
  isGameOver: boolean;
  winner: {
    id: string;
    username: string;
  } | null;
  playerMomentum: {
    [playerId: string]: {
      [key in Phase]: number;
    }
  };
  lastPlayedCard?: {
    cardId: string;
    playerId: string;
    effects: Effect[];
  };
  lastPlayedCards?: {
    cardId: string;
    playerId: string;
    effects: Effect[];
    turnNumber?: number;
  }[];
  lastPlayedCardsForTurn?: {
    cardId: string;
    playerId: string;
    effects: Effect[];
    turnNumber?: number;
  }[];
  realityWarpDuration?: number;
  
  // Extra frontend-specific data
  canPlayCard: boolean;
  availableEnergy: number;
  bloodMoonActive: boolean;
  bloodMoonCharge: number;
  phaseEndsIn: number;
  activeEffects: {
    id: string;
    type: string;
    value: number;
    duration: number;
    source: string;
  }[];
  lastEffectResults: EffectResult[];
  originalPhaseOrder?: Phase[];
  phaseOrder: Phase[];
} 