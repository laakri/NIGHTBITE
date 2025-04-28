import { CardType, CardRarity, Phase } from '../models/Card';
import type { CardStats } from '../models/Card';
import { EffectType, EffectTrigger } from '../models/Effect';
import type { Effect } from '../models/Effect';

export interface VoidCardDefinition {
  id: string;
  name: string;
  description: string;
  type: CardType;
  rarity: CardRarity;
  stats: CardStats;
  effects: Effect[];
  flavorText?: string;
}

export const VOID_CARDS: Record<string, VoidCardDefinition> = {
  // COMMON CARDS
  'VOID_WISP': {
    id: 'VOID_WISP',
    name: 'Void Wisp',
    description: 'When in Void phase, becomes untargetable and deals 1 damage to random enemy.',
    type: CardType.VOID,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 1,
      health: 1,
      bloodMoonEnergy: 0,
      phaseEffects: {
        [Phase.Void]: {
          attackBonus: 1,
          energyBonus: 0,
          voidEffect: {
            magicEffect: 'Deal 1 damage to a random enemy',
            targetable: false
          }
        }
      }
    },
    effects: [
      {
        id: 'VOID_WISP_EFFECT',
        type: EffectType.SHADOW_STEP,
        value: 1,
        trigger: EffectTrigger.ON_VOID_PHASE,
        duration: 1,
        isActive: true,
        phase: Phase.Void,
        source: 'VOID_WISP',
        target: 'ALL_ENEMY_MINIONS'
      }
    ],
    flavorText: 'A barely visible shimmer in the darkness, until it strikes.'
  },

  'SHADOW_PROWLER': {
    id: 'SHADOW_PROWLER',
    name: 'Shadow Prowler',
    description: 'Gains +2 attack during Void phase. Can attack immediately when played.',
    type: CardType.VOID,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 2,
      health: 2,
      bloodMoonEnergy: 0,
      phaseEffects: {
        [Phase.Void]: {
          attackBonus: 2,
          energyBonus: 0,
          voidEffect: {
            magicEffect: 'Can attack immediately when played',
            targetable: true
          }
        }
      }
    },
    effects: [
      {
        id: 'SHADOW_PROWLER_EFFECT',
        type: EffectType.HASTE,
        value: 0,
        trigger: EffectTrigger.ON_PLAY,
        duration: 1,
        isActive: true,
        phase: Phase.Void,
        source: 'SHADOW_PROWLER',
        target: 'SELF'
      }
    ],
    flavorText: 'Its footsteps leave no sound, only cold dread in their wake.'
  },

  'VOID_SIPHON': {
    id: 'VOID_SIPHON',
    name: 'Void Siphon',
    description: 'Deals 1 damage to all enemies. During Void phase, deals 2 damage instead.',
    type: CardType.VOID,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 1,
      health: 3,
      bloodMoonEnergy: 0,
      phaseEffects: {
        [Phase.Void]: {
          energyBonus: 0,
          voidEffect: {
            magicEffect: 'Deals 2 damage instead of 1',
            targetable: false
          }
        }
      }
    },
    effects: [
      {
        id: 'VOID_SIPHON_EFFECT',
        type: EffectType.VOID_DAMAGE,
        value: 1,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0,
        isActive: true,
        phase: Phase.Void,
        source: 'VOID_SIPHON',
        target: 'ALL_ENEMY_MINIONS'
      }
    ],
    flavorText: 'It hungers for essence, not blood - the void consumes all energies.'
  },

  'NETHER_SCOUT': {
    id: 'NETHER_SCOUT',
    name: 'Nether Scout',
    description: 'Draw a card when played. During Void phase, draw an additional Void card.',
    type: CardType.VOID,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 1,
      health: 1,
      phaseEffects: {
        [Phase.Void]: {
          voidEffect: {
            magicEffect: 'Draw a Void card',
            targetable: false
          }
        }
      }
    },
    effects: [{
      id: 'NETHER_SCOUT_EFFECT',
      type: EffectType.DRAW,
      value: 1,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Void,
      source: 'NETHER_SCOUT',
      target: 'SELF'
    }],
    flavorText: 'Its eyes have gazed into the abyss, and now it serves as your guide.'
  },

  'SHADOW_SHIFTER': {
    id: 'SHADOW_SHIFTER',
    name: 'Shadow Shifter',
    description: 'Can move to any position on the battlefield. During Void phase, gains +1/+1.',
    type: CardType.VOID,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 2,
      health: 2,
      phaseEffects: {
        [Phase.Void]: {
          attackBonus: 1,
          healthBonus: 1,
          voidEffect: {
            magicEffect: 'Can reposition to any vacant space',
            targetable: false
          }
        }
      }
    },
    effects: [{
      id: 'SHADOW_SHIFTER_EFFECT',
      type: EffectType.SHADOW_STEP,
      value: 1,
      trigger: EffectTrigger.ON_TURN_START,
      duration: 0,
      isActive: true,
      phase: Phase.Void,
      source: 'SHADOW_SHIFTER',
      target: 'SELF'
    }],
    flavorText: 'Distance means nothing to those who walk between worlds.'
  },

  // RARE CARDS
  'VOID_DEVOURER': {
    id: 'VOID_DEVOURER',
    name: 'Void Devourer',
    description: 'Consume a friendly minion to gain its attack and health. During Void phase, also gain its abilities.',
    type: CardType.VOID,
    rarity: CardRarity.RARE,
    stats: {
      attack: 2,
      health: 2,
      bloodMoonEnergy: 0,
      phaseEffects: {
        [Phase.Void]: {
          energyBonus: 0,
          voidEffect: {
            magicEffect: 'Also gain consumed minion\'s abilities',
            targetable: true,
            powerTransfer: 1
          }
        }
      }
    },
    effects: [
      {
        id: 'VOID_DEVOURER_EFFECT',
        type: EffectType.CONSUME,
        value: 1,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0,
        isActive: true,
        phase: Phase.Void,
        source: 'VOID_DEVOURER',
        target: 'SELF'
      }
    ],
    flavorText: 'To truly know something, you must first become it.'
  },

  'RIFT_STALKER': {
    id: 'RIFT_STALKER',
    name: 'Rift Stalker',
    description: 'Can attack through defenses. During Void phase, becomes immune to spells.',
    type: CardType.VOID,
    rarity: CardRarity.RARE,
    stats: {
      attack: 3,
      health: 3,
      phaseEffects: {
        [Phase.Void]: {
          voidEffect: {
            magicEffect: 'Immune to spell damage',
            targetable: false
          }
        }
      }
    },
    effects: [{
      id: 'RIFT_STALKER_EFFECT',
      type: EffectType.PIERCE,
      value: 0,
      trigger: EffectTrigger.ON_ATTACK,
      duration: 0,
      isActive: true,
      phase: Phase.Void,
      source: 'RIFT_STALKER',
      target: 'SELF'
    }],
    flavorText: 'It slips through the cracks in reality, untouchable as a nightmare.'
  },

  'VOID_WEAVER': {
    id: 'VOID_WEAVER',
    name: 'Void Weaver',
    description: 'Create a copy of target friendly minion. During Void phase, the copy has +1/+1.',
    type: CardType.VOID,
    rarity: CardRarity.RARE,
    stats: {
      attack: 2,
      health: 3,
      phaseEffects: {
        [Phase.Void]: {
          voidEffect: {
            magicEffect: 'Copied minion gains +1/+1',
            targetable: true
          }
        }
      }
    },
    effects: [{
      id: 'VOID_WEAVER_EFFECT',
      type: EffectType.CLONE,
      value: 1,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Void,
      source: 'VOID_WEAVER',
      target: 'SELF'
    }],
    flavorText: 'The void does not create - it echoes, distorts, and multiplies.'
  },

  'SHADOW_ASSASSIN': {
    id: 'SHADOW_ASSASSIN',
    name: 'Shadow Assassin',
    description: 'Gains stealth for 1 turn. During Void phase, instantly kills damaged minions.',
    type: CardType.VOID,
    rarity: CardRarity.RARE,
    stats: {
      attack: 4,
      health: 2,
      phaseEffects: {
        [Phase.Void]: {
          voidEffect: {
            magicEffect: 'Instantly kills damaged enemy minions',
            targetable: true
          }
        }
      }
    },
    effects: [{
      id: 'SHADOW_ASSASSIN_EFFECT',
      type: EffectType.SHADOW_STEP,
      value: 1,
      trigger: EffectTrigger.ON_PLAY,
      duration: 1,
      isActive: true,
      phase: Phase.Void,
      source: 'SHADOW_ASSASSIN',
      target: 'SELF'
    }],
    flavorText: 'Death comes not as a lion\'s roar, but as the whisper of a shadow.'
  },

  'NETHER_MANIPULATOR': {
    id: 'NETHER_MANIPULATOR',
    name: 'Nether Manipulator',
    description: 'Takes control of an enemy minion for 1 turn. During Void phase, control lasts 2 turns and steals 1 blood energy.',
    type: CardType.VOID,
    rarity: CardRarity.RARE,
    stats: {
      attack: 2,
      health: 4,
      bloodMoonEnergy: -1,
      phaseEffects: {
        [Phase.Void]: {
          energyBonus: -1,
          voidEffect: {
            magicEffect: 'Mind control lasts 2 turns instead',
            targetable: true
          }
        }
      }
    },
    effects: [
      {
        id: 'NETHER_MANIPULATOR_EFFECT',
        type: EffectType.MIND_CONTROL,
        value: 1,
        trigger: EffectTrigger.ON_PLAY,
        duration: 1,
        isActive: true,
        phase: Phase.Void,
        source: 'NETHER_MANIPULATOR',
        target: 'SELF'
      },
      {
        id: 'NETHER_MANIPULATOR_ENERGY',
        type: EffectType.STEAL_ENERGY,
        value: 1,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0,
        isActive: true,
        phase: Phase.Void,
        source: 'NETHER_MANIPULATOR',
        target: 'OPPONENT'
      }
    ],
    flavorText: 'The mind is but another realm to conquer.'
  },

  // EPIC CARDS
  'VOID_TRICKSTER': {
    id: 'VOID_TRICKSTER',
    name: 'Void Trickster',
    description: 'Swap the attack and health of all minions. During Void phase, only affects enemy minions.',
    type: CardType.VOID,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 3,
      health: 5,
      phaseEffects: {
        [Phase.Void]: {
          voidEffect: {
            magicEffect: 'Only affects enemy minions',
            targetable: false
          }
        }
      }
    },
    effects: [{
      id: 'VOID_TRICKSTER_EFFECT',
      type: EffectType.REALITY_SHIFT,
      value: 0,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Void,
      source: 'VOID_TRICKSTER',
      target: 'SELF'
    }],
    flavorText: 'In the void, strength becomes weakness, and weakness... an opportunity.'
  },

  'SHADOW_SOVEREIGN': {
    id: 'SHADOW_SOVEREIGN',
    name: 'Shadow Sovereign',
    description: 'All your other minions gain +1 attack. During Void phase, they also gain untargetable.',
    type: CardType.VOID,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 4,
      health: 4,
      phaseEffects: {
        [Phase.Void]: {
          attackBonus: 1,
          voidEffect: {
            magicEffect: 'All friendly minions become untargetable',
            targetable: false
          }
        }
      }
    },
    effects: [{
      id: 'SHADOW_SOVEREIGN_EFFECT',
      type: EffectType.EMPOWER,
      value: 1,
      trigger: EffectTrigger.AURA,
      duration: 0,
      isActive: true,
      phase: Phase.Void,
      source: 'SHADOW_SOVEREIGN',
      target: 'SELF'
    }],
    flavorText: 'Where it walks, darkness follows - not as a shadow, but as a loyal subject.'
  },

  'VOID_HARBINGER': {
    id: 'VOID_HARBINGER',
    name: 'Void Harbinger',
    description: 'Force the game into Void phase for 2 turns. Draw a card for each Void card you control.',
    type: CardType.VOID,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 3,
      health: 6,
      bloodMoonEnergy: 1,
      phaseEffects: {
        [Phase.Void]: {
          energyBonus: 0,
          voidEffect: {
            magicEffect: 'Draw a card for each Void card you control',
            targetable: false
          }
        }
      }
    },
    effects: [
      {
        id: 'VOID_HARBINGER_EFFECT',
        type: EffectType.PHASE_LOCK,
        value: 2,
        trigger: EffectTrigger.ON_PLAY,
        duration: 2,
        isActive: true,
        phase: Phase.Void,
        source: 'VOID_HARBINGER',
        target: 'SELF'
      },
      {
        id: 'VOID_HARBINGER_ENERGY',
        type: EffectType.GAIN_ENERGY,
        value: 1,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0,
        isActive: true,
        phase: Phase.Void,
        source: 'VOID_HARBINGER',
        target: 'SELF'
      }
    ],
    flavorText: 'It does not bring the void - it reveals the void that was always there.'
  },

  'ECHO_OF_NOTHING': {
    id: 'ECHO_OF_NOTHING',
    name: 'Echo of Nothing',
    description: 'Summon a copy of this minion each turn. During Void phase, copies gain +2/+2.',
    type: CardType.VOID,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 2,
      health: 2,
      phaseEffects: {
        [Phase.Void]: {
          voidEffect: {
            magicEffect: 'Copies gain +2/+2',
            targetable: false
          }
        }
      }
    },
    effects: [{
      id: 'ECHO_OF_NOTHING_EFFECT',
      type: EffectType.CLONE_SELF,
      value: 1,
      trigger: EffectTrigger.ON_TURN_END,
      duration: 0,
      isActive: true,
      phase: Phase.Void,
      source: 'ECHO_OF_NOTHING',
      target: 'SELF'
    }],
    flavorText: 'The void does not echo sound, but absence itself.'
  },

  'NIGHTMARE_INCARNATE': {
    id: 'NIGHTMARE_INCARNATE',
    name: 'Nightmare Incarnate',
    description: 'Enemy minions get -1/-1. During Void phase, they also take 1 damage at turn end.',
    type: CardType.VOID,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 5,
      health: 5,
      bloodMoonEnergy: 0,
      phaseEffects: {
        [Phase.Void]: {
          energyBonus: 0,
          voidEffect: {
            magicEffect: 'Enemy minions take 1 damage at turn end',
            targetable: false
          }
        }
      }
    },
    effects: [
      {
        id: 'NIGHTMARE_INCARNATE_EFFECT',
        type: EffectType.AURA_WEAKEN,
        value: 1,
        trigger: EffectTrigger.AURA,
        duration: 0,
        isActive: true,
        phase: Phase.Void,
        source: 'NIGHTMARE_INCARNATE',
        target: 'SELF'
      }
    ],
    flavorText: 'Your worst fears made flesh, feeding on your dread with each passing moment.'
  },

  // LEGENDARY CARDS
  'VOID_ARCHITECT': {
    id: 'VOID_ARCHITECT',
    name: 'The Void Architect',
    description: 'Transform all minions into random Void minions. During Void phase, you choose the transformations.',
    type: CardType.VOID,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 7,
      health: 7,
      phaseEffects: {
        [Phase.Void]: {
          voidEffect: {
            magicEffect: 'You choose the transformations',
            targetable: false
          }
        }
      }
    },
    effects: [{
      id: 'VOID_ARCHITECT_EFFECT',
      type: EffectType.MASS_TRANSFORM,
      value: 0,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Void,
      source: 'VOID_ARCHITECT',
      target: 'SELF'
    }],
    flavorText: 'Where reality is clay, the Architect is the sculptor.'
  },

  'ABYSSAL_HORROR': {
    id: 'ABYSSAL_HORROR',
    name: 'Abyssal Horror',
    description: 'When played, destroy all minions with 2 or less attack. During Void phase, also steal their abilities.',
    type: CardType.VOID,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 8,
      health: 8,
      phaseEffects: {
        [Phase.Void]: {
          voidEffect: {
            magicEffect: 'Gain the abilities of destroyed minions',
            targetable: false
          }
        }
      }
    },
    effects: [{
      id: 'ABYSSAL_HORROR_EFFECT',
      type: EffectType.MASS_DESTROY,
      value: 2,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Void,
      source: 'ABYSSAL_HORROR',
      target: 'SELF'
    }],
    flavorText: 'What lies beyond comprehension should remain there. This one did not.'
  },

  'NEXUS_OF_VOID': {
    id: 'NEXUS_OF_VOID',
    name: 'Nexus of Void',
    description: 'All your cards cost 1 less energy. During Void phase, your Void cards cost 0.',
    type: CardType.VOID,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 4,
      health: 8,
      bloodMoonEnergy: 0,
      phaseEffects: {
        [Phase.Void]: {
          energyBonus: 0,
          voidEffect: {
            magicEffect: 'Your Void cards cost 0 energy to play',
            targetable: false
          }
        }
      }
    },
    effects: [
      {
        id: 'NEXUS_OF_VOID_EFFECT',
        type: EffectType.COST_REDUCTION,
        value: 1,
        trigger: EffectTrigger.AURA,
        duration: 0,
        isActive: true,
        phase: Phase.Void,
        source: 'NEXUS_OF_VOID',
        target: 'SELF'
      }
    ],
    flavorText: 'A wound in reality, leaking power that both creates and unmakes.'
  },

  'VOID_SINGULARITY': {
    id: 'VOID_SINGULARITY',
    name: 'Void Singularity',
    description: 'Has attack and health equal to all Void cards played this game. During Void phase, it\'s untargetable.',
    type: CardType.VOID,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 1,
      health: 1,
      phaseEffects: {
        [Phase.Void]: {
          voidEffect: {
            magicEffect: 'Cannot be targeted by enemy spells or abilities',
            targetable: false
          }
        }
      }
    },
    effects: [{
      id: 'VOID_SINGULARITY_EFFECT',
      type: EffectType.VOID_SCALING,
      value: 1,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Void,
      source: 'VOID_SINGULARITY',
      target: 'SELF'
    }],
    flavorText: 'As above, so below - as without, so within. All things converge at the point of nothing.'
  },

  'OBLIVION': {
    id: 'OBLIVION',
    name: 'Oblivion',
    description: 'Silence and destroy all other minions. During Void phase, summon a 1/1 Void Remnant for each.',
    type: CardType.VOID,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 8,
      health: 9,
      bloodMoonEnergy: 2,
      phaseEffects: {
        [Phase.Void]: {
          energyBonus: 0,
          voidEffect: {
            magicEffect: 'Summon a 1/1 Void Remnant for each minion destroyed',
            targetable: false
          }
        }
      }
    },
    effects: [
      {
        id: 'OBLIVION_EFFECT',
        type: EffectType.APOCALYPSE,
        value: 0,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0,
        isActive: true,
        phase: Phase.Void,
        source: 'OBLIVION',
        target: 'SELF'
      },
      {
        id: 'OBLIVION_ENERGY',
        type: EffectType.GAIN_ENERGY,
        value: 2,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0,
        isActive: true,
        phase: Phase.Void,
        source: 'OBLIVION',
        target: 'SELF'
      }
    ],
    flavorText: 'The final breath of existence, when all returns to the emptiness from which it came.'
  }
};

// Add new effect types used by Void cards
export enum ExtendedEffectType {
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
  DRAW = 'DRAW',
  HASTE = 'HASTE',
  EMPOWER = 'EMPOWER',
  GAIN_ENERGY = 'GAIN_ENERGY',
  STEAL_ENERGY = 'STEAL_ENERGY'
} 