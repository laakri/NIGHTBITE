// Core Enums
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

export enum EffectType {
  // Basic Effects
  DAMAGE = 'DAMAGE',
  HEAL = 'HEAL',
  SHIELD = 'SHIELD',
  DRAW = 'DRAW',
  
  // Blood Moon Effects
  BLOOD_TRANSFORM = 'BLOOD_TRANSFORM',
  POWER_BOOST = 'POWER_BOOST',
  CRYSTAL_CHARGE = 'CRYSTAL_CHARGE',
  
  // Special Effects
  VOID_SHIELD = 'VOID_SHIELD',
  REALITY_WARP = 'REALITY_WARP',
  COPY_EFFECT = 'COPY_EFFECT',

  // Dark Fantasy Effects
  VOID_DAMAGE = 'VOID_DAMAGE',
  BLOOD_DRAIN = 'BLOOD_DRAIN',
  SHADOW_STEP = 'SHADOW_STEP',
  NETHER_EMPOWER = 'NETHER_EMPOWER',
  SOUL_HARVEST = 'SOUL_HARVEST'
}

export enum EffectTrigger {
  ON_PLAY = 'ON_PLAY',
  ON_DEATH = 'ON_DEATH',
  ON_BLOOD_MOON = 'ON_BLOOD_MOON',
  ON_TURN_START = 'ON_TURN_START',
  ON_TURN_END = 'ON_TURN_END'
}

// Effect Types
export interface Effect {
  id: string;
  type: EffectType;
  value: number;
  trigger: EffectTrigger;
  duration?: number;
  target?: 'SELF' | 'OPPONENT' | 'ALL';
  condition?: {
    type: 'BLOOD_MOON' | 'HP_THRESHOLD' | 'CRYSTAL_COUNT';
    value: number;
  };
}

export interface BloodMoonEffect extends Effect {
  normalState: Partial<Effect>;
  bloodMoonState: Partial<Effect>;
}

// Card Types
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
  id_name: string;
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
  bloodMoonCharge?: number;
  
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

// Player Types
export interface PlayerStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  shields?: number;
  crystals?: number;
  bloodMoonMeter?: number;
  bloodMoonCharge?: number;
  inOverdrive?: boolean;
}

export interface PlayerState {
  isInBloodMoon: boolean;
  bloodMoonTurnsLeft?: number;
  bloodMoonCharge: number;
  hasEvasion: boolean;
  evasionDuration: number;
  enemiesKilledThisTurn: number;
  activeEffects: {
    id: string;
    type: string;
    value: number;
    duration: number;
  }[];
  lastPlayedCard?: {
    id: string;
    name: string;
    effects: any[];
  };
}

export interface Player {
  id: string;
  username: string;
  stats: PlayerStats;
  state: PlayerState;
  
  // Card Collections
  hand: Card[];
  deck: Card[];
  discardPile: Card[];
  battlefield: Card[];  // Cards currently in play
  bloodMoonPile?: Card[];  // Special cards only available in blood moon
  
  // Game State
  isReady: boolean;
  hasPlayedCard: boolean;
  
  // Metadata
  avatar?: string;
  rank?: number;
  title?: string;
}

export interface OpponentInfo {
  id: string;
  username: string;
  stats: PlayerStats;
  state: PlayerState;
  handSize: number;
  deckSize: number;
  discardPileSize: number;
  battlefield: Card[];
}

// Game Types
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
  phaseChangeCounter: number;
  phaseJustChanged: boolean;
  phaseLocked: boolean;
  phaseLockDuration?: number;
  turnCount: number;
  isYourTurn: boolean;
  
  canPlayCard: boolean;
  player: Player;
  opponent: OpponentInfo;
  isGameOver: boolean;
  winner: {
    id: string;
    username: string;
  } | null;
  playerMomentum: {
    [playerId: string]: {
      [key in Phase]: number;
    }
  };
  lastPlayedCard?: {
    cardId: string;
    playerId: string;
    effects: Effect[];
  };
  lastPlayedCards?: {
    cardId: string;
    playerId: string;
    effects: Effect[];
    turnNumber?: number;
  }[];
  lastPlayedCardsForTurn?: {
    cardId: string;
    playerId: string;
    effects: Effect[];
    turnNumber?: number;
  }[];
  realityWarpDuration?: number;
  bloodMoonActive: boolean;
  activeEffects: {
    id: string;
    type: string;
    value: number;
    duration: number;
    source?: string;
  }[];
  lastEffectResults: EffectResult[];
  originalPhaseOrder?: Phase[];
  phaseOrder: Phase[];
  bloodMoonCharge: number;
  availableEnergy: number;
  phaseEndsIn: number;
}

export interface GameHistory {
  turns: {
    turnNumber: number;
    playerId: string;
    actions: {
      type: 'PLAY_CARD' | 'BLOOD_MOON_TRANSFORM' | 'EFFECT_TRIGGER';
      cardId?: string;
      effects?: Effect[];
      timestamp: number;
    }[];
  }[];
}

export interface Game {
  id: string;
  players: Player[];
  state: GameState;
  history: GameHistory;
  
  // Game Status
  isActive: boolean;
  isGameOver: boolean;
  winner?: Player;
  
  // Settings
  bloodMoonThreshold: number;  // Amount needed to trigger blood moon
  maxTurns: number;
  startingHandSize: number;
  
  // Phase Settings
  phaseDuration: number;  // Number of turns each phase lasts
  phaseOrder: Phase[];  // Order of phases in the game
  
  // Metadata
  createdAt: number;
  updatedAt: number;
} 

