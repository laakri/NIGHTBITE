export enum CardType {
  SUN = 'SUN',
  MOON = 'MOON',
  ECLIPSE = 'ECLIPSE'
}

export enum CardRarity {
  NORMAL = 'NORMAL',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
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
  PHASE_LOCK = 'PHASE_LOCK',
  STEAL_CARD = 'STEAL_CARD',
  COPY_EFFECT = 'COPY_EFFECT',
  MOMENTUM = 'MOMENTUM',
  TRAP = 'TRAP',
  BURN = 'BURN',
  SHIELD = 'SHIELD',
  REDUCE_COST = 'REDUCE_COST',
  REVEAL_HAND = 'REVEAL_HAND'
}

export interface Effect {
  type: EffectType;
  value?: number;
  duration?: number;
  condition?: string;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  damage: number;
  healing: number;
  effects: Effect[];
  description: string;
  isSecret?: boolean;
  secretTrigger?: string;
  delayedTurns?: number;
}
