export enum CardType {
  SUN = 'sun',
  MOON = 'moon',
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
  REVERSE = 'reverse',
  TRAP = 'trap'
}

export interface CardEffect {
  type: EffectType;
  value?: number;
  condition?: string;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  description: string;
  cost: number;
  damage: number;
  healing: number;
  effects: CardEffect[];
  isSecret?: boolean;
  isFaceDown?: boolean;
  rarity?: 'normal' | 'epic' | 'legendary';
}

export interface Player {
  id: string;
  username: string;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  hand: Card[];
  deckSize: number;
  discardPileSize: number;
  shields: number;
  burnDamage: number;
  heroPower: string;
  inOverdrive: boolean;
}

export interface Opponent {
  id: string;
  username: string;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  handSize: number;
  deckSize: number;
  discardPileSize: number;
  shields: number;
  burnDamage: number;
  heroPower: string;
  inOverdrive: boolean;
}

export interface SecretCard {
  id: string;
  playerId: string;
  turnPlayed: number;
}

export interface GameState {
  gameId: string;
  currentPhase: Phase;
  phaseJustChanged: boolean;
  phaseLocked: boolean;
  turnCount: number;
  isYourTurn: boolean;
  player: Player;
  opponent: Opponent;
  isGameOver: boolean;
  winner: {
    id: string;
    username: string;
  } | null;
  secretCards: SecretCard[];
  playerMomentum: {
    [playerId: string]: {
      sun: number;
      moon: number;
      eclipse: number;
    }
  };
  status: string;
  lastPlayedCards: {
    playerId: string;
    cardId: string;
  }[];
} 

