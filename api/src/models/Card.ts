import type { Effect, BloodMoonEffect, EffectType } from './Effect';

export enum CardType {
  // Basic Types
  WARRIOR = 'WARRIOR',
  MAGE = 'MAGE',
  ASSASSIN = 'ASSASSIN',
  BEAST = 'BEAST',
  
  // Additional Types
  DEMON = 'DEMON',
  ANGEL = 'ANGEL',
  ELEMENTAL = 'ELEMENTAL',
  NECROMANCER = 'NECROMANCER',
  DRAGON = 'DRAGON',
  MECHANICAL = 'MECHANICAL',
  SPIRIT = 'SPIRIT',
  UNDEAD = 'UNDEAD',
  CELESTIAL = 'CELESTIAL',
  ABYSSAL = 'ABYSSAL',

  // Dark Fantasy Types
  VOID = 'VOID',
  BLOOD = 'BLOOD',
  NETHER = 'NETHER'
}

export enum CardRarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  MYTHIC = 'MYTHIC'
}

export enum Phase {
  PHASE_ONE = 'PHASE_ONE',
  PHASE_TWO = 'PHASE_TWO',
  PHASE_THREE = 'PHASE_THREE'
}

export interface CardStats {
  attack: number;
  health: number;
  cost: number;
  phasePower?: {
    [key in Phase]?: {
      attackBonus?: number;
      healthBonus?: number;
      costReduction?: number;
      specialEffect?: string;
    }
  };
  bloodMoonCost?: number;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  stats: CardStats;
  effects: Effect[];
  bloodMoonEffects?: BloodMoonEffect[];
  description: string;
  flavorText?: string;
  
  // Current state properties
  currentAttack: number;
  currentHealth: number;
  isTransformed: boolean;
  
  // Card Type Specific Properties
  typeProperties?: {
    [key in CardType]?: {
      specialAbility?: string;
      passiveEffect?: string;
      synergyWith?: CardType[];
      weaknessAgainst?: CardType[];
    }
  };
  
  // Metadata
  artworkUrl?: string;
  animationUrl?: string;
  soundEffects?: {
    onPlay?: string;
    onAttack?: string;
    onDeath?: string;
    onTransform?: string;
  };
}

export interface PlayedCard {
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
