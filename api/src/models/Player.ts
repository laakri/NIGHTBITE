import type { Card } from "./Card";

export interface Player {
  id: string;
  username: string;
  hp: number;
  deck: Card[];
  hand: Card[];
  discardPile: Card[];
}

export function createPlayer(id: string, username: string): Player {
  return {
    id,
    username,
    hp: 20,
    deck: [],
    hand: [],
    discardPile: []
  };
}
