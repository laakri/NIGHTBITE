export enum CardType {
  SUN = 'sun',
  NIGHT = 'night',
  ECLIPSE = 'eclipse'
}

export enum Phase {
  DAY = 'day',
  NIGHT = 'night'
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

export interface CardEffect {
  type: EffectType;
  value?: number;
}

export enum EffectType {
  SWITCH_PHASE = 'switchPhase',
  SELF_DAMAGE = 'selfDamage',
  DISCARD = 'discard',
  DRAW = 'draw',
  DELAY = 'delay',
  REVERSE = 'reverse'
}
