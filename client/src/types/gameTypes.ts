export enum CardType {
  SUN = 'SUN',
  MOON = 'MOON',
  ECLIPSE = 'ECLIPSE'
}

export enum Phase {
  DAY = 'DAY',
  NIGHT = 'NIGHT'
}

export enum EffectType {
  SWITCH_PHASE = 'SWITCH_PHASE',
  SELF_DAMAGE = 'SELF_DAMAGE',
  DISCARD = 'DISCARD',
  DRAW = 'DRAW',
  DELAY = 'DELAY',
  REVERSE = 'REVERSE',
  TRAP = 'TRAP',
  STEAL_CARD = 'STEAL_CARD',
  REDUCE_COST = 'REDUCE_COST',
  COPY_EFFECT = 'COPY_EFFECT',
  LOCK_PHASE = 'LOCK_PHASE',
  ADD_SHIELD = 'ADD_SHIELD',
  ADD_BURN = 'ADD_BURN'
}

export enum CardRarity {
  NORMAL = 'NORMAL',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export interface CardEffect {
  type: EffectType;
  value?: number;
  duration?: number;
  condition?: string;
  target?: 'SELF' | 'OPPONENT' | 'BOTH';
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  damage: number;
  healing: number;
  description: string;
  effects: CardEffect[];
  isSecret?: boolean;
  secretTrigger?: string;
  delayedTurns?: number;
}

export interface Player {
  id: string;
  username: string;
  hp: number;
  maxHp?: number;
  energy: number;
  maxEnergy?: number;
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
  maxHp?: number;
  energy: number;
  maxEnergy?: number;
  handSize: number;
  deckSize: number;
  discardPileSize: number;
  shields: number;
  burnDamage: number;
  heroPower: string;
  inOverdrive: boolean;
}

export interface SecretCard {
  playerId: string;
  cardId: string;
  trigger: string;
}

export interface ActiveEffect {
  playerId: string;
  effectType: string;
  duration: number;
  value: number;
}

export interface LastPlayedCard {
  playerId: string;
  cardId: string;
  cardName: string;
  cardDescription: string;
  cardType: CardType;
  cardCost: number;
  cardDamage: number;
  cardHealing: number;
  turnPlayed: number;
}

export interface EffectResult {
  type: EffectType;
  value?: number;
  sourceCardId: string;
  sourceCardName: string;
  targetPlayerId: string;
  appliedAt: number;
}

export interface GameState {
  gameId: string;
  currentPhase: Phase;
  phaseChangeCounter?: number;
  phaseJustChanged: boolean;
  phaseLocked: boolean;
  phaseLockDuration?: number;
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
  activeEffects?: ActiveEffect[];
  playerMomentum: {
    [playerId: string]: {
      sun: number;
      moon: number;
      eclipse: number;
    }
  };
  lastPlayedCards: LastPlayedCard[];
  lastAppliedEffect: EffectResult | null;
} 

