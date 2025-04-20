import crypto from 'crypto';
import type { Player } from './Player';
import type { Card } from './Card';
import type { Effect, EffectType } from './Effect';
import { Phase } from './Card';

export interface EffectResult {
  type: EffectType;
  value?: number;
  sourceCardId: string;
  sourceCardName: string;
  targetPlayerId: string;
  appliedAt: number; // timestamp
}

export interface GameState {
  currentPhase: Phase;
  phaseChangeCounter: number;
  phaseJustChanged: boolean;
  phaseLocked: boolean;
  phaseLockDuration?: number;
  turnCount: number;
  currentPlayerId: string;
  lastPlayedCard?: {
    cardId: string;
    playerId: string;
    effects: Effect[];
  };
  playerMomentum: {
    [playerId: string]: {
      [key in Phase]: number;
    }
  };
  realityWarpDuration?: number;
  lastEffectResults?: EffectResult[];
  originalPhaseOrder?: Phase[];
}

export interface GameHistory {
  turns: {
    turnNumber: number;
    playerId: string;
    actions: {
      type: 'PLAY_CARD' | 'BLOOD_MOON_TRANSFORM' | 'EFFECT_TRIGGER';
      cardId?: string;
      effects?: Effect[];
      timestamp: number;
    }[];
  }[];
}

export interface Game {
  id: string;
  players: Player[];
  state: GameState;
  history: GameHistory;
  
  // Game Status
  isActive: boolean;
  isGameOver: boolean;
  winner?: Player;
  
  // Settings
  bloodMoonThreshold: number;  // Amount needed to trigger blood moon
  maxTurns: number;
  startingHandSize: number;
  
  // Phase Settings
  phaseDuration: number;  // Number of turns each phase lasts
  phaseOrder: Phase[];  // Order of phases in the game
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

// Interface for opponent data that is safe to send to the frontend
export interface OpponentPublicData {
  id: string;
  username: string;
  stats: {
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
  };
  state: {
    isInBloodMoon: boolean;
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
  realityWarpDuration?: number;
  
  // Extra frontend-specific data
  canPlayCard: boolean;
  availableEnergy: number;
  bloodMoonActive: boolean;
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
  bloodMoonCharge: number;
}

export function createGame(players: Player[]): Game {
  return {
    id: crypto.randomUUID(),
    players,
    state: {
      currentPhase: Phase.PHASE_ONE,
      phaseChangeCounter: 0,
      phaseJustChanged: false,
      phaseLocked: false,
      turnCount: 1,
      currentPlayerId: players[0].id,
      playerMomentum: players.reduce((acc, player) => ({
        ...acc,
        [player.id]: {
          [Phase.PHASE_ONE]: 0,
          [Phase.PHASE_TWO]: 0,
          [Phase.PHASE_THREE]: 0
        }
      }), {})
    },
    history: {
      turns: []
    },
    isActive: true,
    isGameOver: false,
    bloodMoonThreshold: 5,
    maxTurns: 10,
    startingHandSize: 5,
    phaseDuration: 3,
    phaseOrder: [Phase.PHASE_ONE, Phase.PHASE_TWO, Phase.PHASE_THREE],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}
