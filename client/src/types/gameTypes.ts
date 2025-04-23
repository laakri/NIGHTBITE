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
  Normal = 'normal',
  BloodMoon = 'bloodMoon',
  Void = 'void'
}

export enum EffectType {
  // Basic Effects
  DIRECT_DAMAGE = 'DIRECT_DAMAGE',
  AREA_DAMAGE = 'AREA_DAMAGE',
  HEALING = 'HEALING',
  DRAW = 'DRAW',
  
  // Void Phase Effects
  VOID_DAMAGE = 'VOID_DAMAGE',
  VOID_SHIELD = 'VOID_SHIELD',
  VOID_LEECH = 'VOID_LEECH',
  VOID_BLAST = 'VOID_BLAST',
  VOID_NOVA = 'VOID_NOVA',
  VOID_TELEPORT = 'VOID_TELEPORT',
  VOID_MIRROR = 'VOID_MIRROR',
  VOID_VOID = 'VOID_VOID',
  VOID_ERUPTION = 'VOID_ERUPTION',
  VOID_ABYSS = 'VOID_ABYSS',
  VOID_CORRUPTION = 'VOID_CORRUPTION',
  VOID_ANNIHILATION = 'VOID_ANNIHILATION',
  VOID_ASCENSION = 'VOID_ASCENSION',
  VOID_OMEGA = 'VOID_OMEGA',
  
  // Blood Moon Effects
  BLOOD_DRAIN = 'BLOOD_DRAIN',
  SOUL_HARVEST = 'SOUL_HARVEST',
  
  // Utility Effects
  SHADOW_STEP = 'SHADOW_STEP',
  NETHER_EMPOWER = 'NETHER_EMPOWER',
  CONSUME = 'CONSUME',
  PIERCE = 'PIERCE',
  CLONE = 'CLONE',
  MIND_CONTROL = 'MIND_CONTROL',
  REALITY_SHIFT = 'REALITY_SHIFT',
  PHASE_LOCK = 'PHASE_LOCK',
  CLONE_SELF = 'CLONE_SELF',
  AURA_WEAKEN = 'AURA_WEAKEN',
  MASS_TRANSFORM = 'MASS_TRANSFORM',
  MASS_DESTROY = 'MASS_DESTROY',
  COST_REDUCTION = 'COST_REDUCTION',
  VOID_SCALING = 'VOID_SCALING',
  APOCALYPSE = 'APOCALYPSE',
  HASTE = 'HASTE',
  EMPOWER = 'EMPOWER',
  TRANSFORM = 'TRANSFORM'
}

export enum EffectTrigger {
  ON_PLAY = 'ON_PLAY',
  ON_DEATH = 'ON_DEATH',
  ON_DAMAGE = 'ON_DAMAGE',
  ON_HEAL = 'ON_HEAL',
  ON_TURN_START = 'ON_TURN_START',
  ON_TURN_END = 'ON_TURN_END',
  ON_ATTACK = 'ON_ATTACK',
  ON_DEFEND = 'ON_DEFEND',
  ON_BLOOD_MOON = 'ON_BLOOD_MOON',
  ON_VOID_PHASE = 'ON_VOID_PHASE',
  AURA = 'AURA'
}

// Effect Types
export interface Effect {
  id: string;
  type: EffectType;
  trigger: EffectTrigger;
  value: number;
  duration: number;
  isActive: boolean;
  phase: Phase;
  source: string;  // Card ID that created the effect
  target: string;  // Card ID or player ID that is affected
}

export interface BloodMoonEffect extends Effect {
  bloodCost?: number;
}

// Card Types
export interface CardStats {
  attack: number;
  health: number;
  cost: number;
  maxHealth: number;
  canAttack: boolean;
  currentAttack: number;
  currentHealth: number;
  energyCost: number;
  phaseEffects?: {
    [key in Phase]?: {
      attackBonus: number;
      healthBonus: number;
    }
  };
  bloodMoonCost?: number;
}

export interface Card {
  id: string;
  name: string;
  id_name: string;
  type: CardType;
  rarity: CardRarity;
  stats: CardStats;
  effects: Effect[];
  bloodMoonEffects?: BloodMoonEffect[];
  description: string;
  flavorText?: string;
  
  // Current state properties
  isTransformed: boolean;
  bloodMoonCharge?: number;
  
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
  bloodEnergy: number;
  maxBloodEnergy: number;
  shields?: number;
  crystals?: number;
  bloodMoonMeter?: number;
  bloodMoonCharge?: number;
  inOverdrive?: boolean;
  availableEnergy: number;
}

export interface PlayerState {
  isInBloodMoon: boolean;
  bloodMoonTurnsLeft: number;
  bloodMoonCharge: number;
  hasEvasion: boolean;
  evasionDuration: number;
  enemiesKilledThisTurn: number;
  activeEffects: Effect[];
  lastPlayedCards: {
    id: string;
    name: string;
    effects: Effect[];
  }[];
  lastPlayedCard?: {
    id: string;
    name: string;
    effects: Effect[];
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
  value: number;
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
  lastPlayedCards: {
    cardId: string;
    playerId: string;
    effects: Effect[];
    turnNumber: number;
  }[];
  lastPlayedCardsForTurn?: {
    cardId: string;
    playerId: string;
    effects: Effect[];
    turnNumber: number;
  }[];
  bloodMoonActive: boolean;
  activeEffects: Effect[];
  lastEffectResults: EffectResult[];
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

