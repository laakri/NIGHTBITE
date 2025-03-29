import type { Card } from "./Card";

export interface Player {
  id: string;
  username: string;
  hp: number;
  deck: Card[];
  hand: Card[];
  discardPile: Card[];
  energy: number;
  heroPower: string;
  inOverdrive: boolean;
  shields: number;
  burnDamage: number;
  revealedCards: Card[];
}

export function createPlayer(id: string, username: string): Player {
  return {
    id,
    username,
    hp: 20,
    deck: [],
    hand: [],
    discardPile: [],
    energy: 1,
    heroPower: '',
    inOverdrive: false,
    shields: 0,
    burnDamage: 0,
    revealedCards: []
  };
}
