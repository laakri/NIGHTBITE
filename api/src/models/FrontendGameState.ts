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
    shields: number;
  };
  state: {
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
  };
  handSize: number;
  deckSize: number;
  discardPileSize: number;
  battlefield: Card[];
}

// Interface for the game state data sent to the frontend
export interface FrontendGameState {
  // Core game state
  gameId: string;
  currentPhase: Phase;
  phaseChangeCounter: number;
  phaseJustChanged: boolean;
  phaseLocked: boolean;
  phaseLockDuration?: number;
  turnCount: number;
  isYourTurn: boolean;
  isGameOver: boolean;
  winner: {
    id: string;
    username: string;
  } | null;
  
  // Player data
  player: Player;
  opponent: OpponentPublicData;
  
  // Game mechanics
  playerMomentum: {
    [playerId: string]: {
      [key in Phase]: number;
    }
  };
  
  // Card play tracking
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
  
  // Active effects and results
  activeEffects: {
    id: string;
    type: string;
    value: number;
    duration: number;
  }[];
  lastEffectResults: EffectResult[];
  
  // Phase management
  phaseOrder: Phase[];
  phaseEndsIn: number;
  
  // Resource tracking
  availableEnergy: number;
  bloodMoonActive: boolean;
  bloodMoonCharge: number;
  
  // Game actions
  canPlayCard: boolean;
} 