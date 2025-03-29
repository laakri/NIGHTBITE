import { v4 as uuidv4 } from 'uuid';
import type { Player } from './Player';
import { Phase } from './Card';

export interface Game {
  id: string;
  players: Player[];
  currentPhase: Phase;
  currentPlayerIndex: number;
  turnCount: number;
  phaseChangeCounter: number;
  winner: Player | null;
  isGameOver: boolean;
}

export function createGame(players: Player[]): Game {
  // Randomly determine starting phase
  const randomPhase = Math.random() < 0.5 ? Phase.DAY : Phase.NIGHT;
  
  return {
    id: uuidv4(),
    players,
    currentPhase: randomPhase,
    currentPlayerIndex: 0,
    turnCount: 0,
    phaseChangeCounter: 0,
    winner: null,
    isGameOver: false
  };
}
