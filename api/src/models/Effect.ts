import { Phase } from './Card';

export enum EffectType {
  // Basic Effects
  DIRECT_DAMAGE = 'DIRECT_DAMAGE',
  AREA_DAMAGE = 'AREA_DAMAGE',
  HEALING = 'HEALING',
  DRAW = 'DRAW',
  SHIELD="SHIELD",
  
  // Blood Moon Energy Effects
  GAIN_ENERGY = 'GAIN_ENERGY',
  STEAL_ENERGY = 'STEAL_ENERGY',
  ATTACK_TO_ENERGY = 'ATTACK_TO_ENERGY',
  HEALTH_TO_ENERGY = 'HEALTH_TO_ENERGY',
  
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

export interface BloodMoonEffect {
  id: string;
  type: EffectType;
  value: number;
  duration: number;
  bloodCost?: number;
  isActive: boolean;
  phase: Phase;
  source: string;
  target: string;
} 