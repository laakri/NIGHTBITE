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

// Helper type for card effects with blood moon transformation
export interface BloodMoonEffect extends Effect {
  normalState: Partial<Effect>;
  bloodMoonState: Partial<Effect>;
} 