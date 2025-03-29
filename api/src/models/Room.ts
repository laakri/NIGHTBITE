import { v4 as uuidv4 } from 'uuid';
import type { Player } from './Player';
import type { Game } from './Game';

export enum RoomStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished'
}

export interface Room {
  id: string;
  name: string;
  players: Player[];
  game: Game | null;
  status: RoomStatus;
  maxPlayers: number;
}

export function createRoom(name: string): Room {
  return {
    id: uuidv4(),
    name,
    players: [],
    game: null,
    status: RoomStatus.WAITING,
    maxPlayers: 2
  };
}
