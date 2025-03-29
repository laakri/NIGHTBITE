export enum CardType {
  SUN = 'sun',
  NIGHT = 'night',
  ECLIPSE = 'eclipse'
}

export enum Phase {
  DAY = 'day',
  NIGHT = 'night'
}

export enum EffectType {
  SWITCH_PHASE = 'switchPhase',
  SELF_DAMAGE = 'selfDamage',
  DISCARD = 'discard',
  DRAW = 'draw',
  DELAY = 'delay',
  REVERSE = 'reverse'
}

export interface CardEffect {
  type: EffectType;
  value?: number;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  description: string;
  damage: number;
  healing: number;
  effects: CardEffect[];
}

export interface Player {
  id: string;
  username: string;
  hp: number;
  hand: Card[];
  deckSize: number;
  discardPileSize: number;
}

export interface Opponent {
  id: string;
  username: string;
  hp: number;
  handSize: number;
  deckSize: number;
  discardPileSize: number;
}

export interface GameState {
  gameId: string;
  currentPhase: Phase;
  turnCount: number;
  isYourTurn: boolean;
  player: Player;
  opponent: Opponent;
  isGameOver: boolean;
  winner: {
    id: string;
    username: string;
  } | null;
} 

