import crypto from 'crypto';
import type { Player } from './Player';
import type { Card } from './Card';
import type { Effect } from './Effect';
import { Phase } from './Card';
import type { FrontendGameState, OpponentPublicData, EffectResult } from './FrontendGameState';

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
  playerMomentum: {
    [playerId: string]: {
      [key in Phase]: number;
    }
  };
  realityWarpDuration?: number;
  lastEffectResults?: EffectResult[];
  originalPhaseOrder?: Phase[];
  // Track energy generation and usage
  energyStats?: {
    [playerId: string]: {
      generated: number;
      spent: number;
    }
  };
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

export function createGame(players: Player[]): Game {
  return {
    id: crypto.randomUUID(),
    players,
    state: {
      currentPhase: Phase.Normal,
      phaseChangeCounter: 0,
      phaseJustChanged: false,
      phaseLocked: false,
      turnCount: 1,
      currentPlayerId: players[0].id,
      playerMomentum: players.reduce((acc, player) => ({
        ...acc,
        [player.id]: {
          [Phase.Normal]: 0,
          [Phase.BloodMoon]: 0,
          [Phase.Void]: 0
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
    phaseOrder: [Phase.Normal, Phase.BloodMoon, Phase.Void],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}
