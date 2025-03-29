import { v4 as uuidv4 } from 'uuid';
import type { Player } from './Player';
import { Phase, type PlayedCard,  } from './Card';

export interface Game {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  currentPhase: Phase;
  phaseChangeCounter: number;
  turnCount: number;
  isGameOver: boolean;
  winner: Player | null;
  phaseLocked: boolean;
  phaseLockDuration: number;
  lastPlayedCards: PlayedCard[];
  phaseJustChanged: boolean;
  playerMomentum: { [playerId: string]: { sun: number, moon: number, eclipse: number } };
  activeEffects: { playerId: string, effectType: string, duration: number, value: number }[];
  secretCards: { playerId: string, cardId: string, trigger: string }[];
}

export function createGame(players: Player[]): Game {
  // Make sure each player has initial energy
  for (const player of players) {
    if (player.energy === undefined) {
      player.energy = 1; // Default starting energy
    }
  }
  
  return {
    id: uuidv4(),
    players,
    currentPlayerIndex: 0,
    currentPhase: Math.random() < 0.5 ? Phase.DAY : Phase.NIGHT,
    phaseChangeCounter: 0,
    turnCount: 1,
    isGameOver: false,
    winner: null,
    phaseLocked: false,
    phaseLockDuration: 0,
    lastPlayedCards: [],
    phaseJustChanged: false,
    playerMomentum: players.reduce((acc, player) => {
      acc[player.id] = { sun: 0, moon: 0, eclipse: 0 };
      return acc;
    }, {} as { [playerId: string]: { sun: number, moon: number, eclipse: number } }),
    activeEffects: [],
    secretCards: []
  };
}
