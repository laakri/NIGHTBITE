import { CardType, CardRarity, Phase } from '../models/Card';
import type { CardStats } from '../models/Card';
import { EffectType, EffectTrigger } from '../models/Effect';
import type { Effect } from '../models/Effect';

export interface NormalCardDefinition {
  id: string;
  name: string;
  description: string;
  type: CardType;
  rarity: CardRarity;
  stats: CardStats;
  effects: Effect[];
  flavorText?: string;
}

export const NORMAL_CARDS: Record<string, NormalCardDefinition> = {
  // COMMON CARDS - WARRIOR
  'IRONCLAD_DEFENDER': {
    id: 'IRONCLAD_DEFENDER',
    name: 'Ironclad Defender',
    description: 'Grants +2 shields to all friendly units. During Normal phase, also grants +1 health. Generates 1 blood energy.',
    type: CardType.WARRIOR,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 1,
      health: 5,
      bloodMoonEnergy: 1,
      phaseEffects: {
        [Phase.Normal]: {
          healthBonus: 1,
          specialEffect: 'Shielding aura extends to adjacent allies'
        }
      }
    },
    effects: [{
      id: 'IRONCLAD_DEFENDER_EFFECT',
      type: EffectType.HEALING,
      value: 2,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'IRONCLAD_DEFENDER',
      target: 'SELF'
    },
    {
      id: 'IRONCLAD_DEFENDER_ENERGY',
      type: EffectType.GAIN_ENERGY,
      value: 1,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'IRONCLAD_DEFENDER',
      target: 'SELF'
    }],
    flavorText: 'His shield has weathered a thousand blows. Not one has reached those he protects.'
  },

  'BATTLE_TACTICIAN': {
    id: 'BATTLE_TACTICIAN',
    name: 'Battle Tactician',
    description: 'All allied Warriors gain +1 attack. During Normal phase, all allies gain +1 attack instead. Generates 1 blood energy for each warrior you control.',
    type: CardType.WARRIOR,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 2,
      health: 3,
      bloodMoonEnergy: 1,
      phaseEffects: {
        [Phase.Normal]: {
          attackBonus: 1,
          specialEffect: 'Tactical bonus applies to all allies'
        }
      }
    },
    effects: [{
      id: 'BATTLE_TACTICIAN_EFFECT',
      type: EffectType.EMPOWER,
      value: 1,
      trigger: EffectTrigger.AURA,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'BATTLE_TACTICIAN',
      target: 'ALL_ALLIES'
    },
    {
      id: 'BATTLE_TACTICIAN_ENERGY',
      type: EffectType.GAIN_ENERGY,
      value: 1,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'BATTLE_TACTICIAN',
      target: 'SELF'
    }],
    flavorText: 'Victory favors not the strongest arm, but the clearest mind.'
  },

  // COMMON CARDS - MAGE
  'ARCANE_SCHOLAR': {
    id: 'ARCANE_SCHOLAR',
    name: 'Arcane Scholar',
    description: 'Draw a card when played. During Normal phase, draw an additional card. Also generates 1 blood energy.',
    type: CardType.MAGE,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 1,
      health: 2,
      bloodMoonEnergy: 1,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Draw an additional card'
        }
      }
    },
    effects: [{
      id: 'ARCANE_SCHOLAR_EFFECT',
      type: EffectType.DRAW,
      value: 1,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'ARCANE_SCHOLAR',
      target: 'SELF'
    },
    {
      id: 'ARCANE_SCHOLAR_ENERGY',
      type: EffectType.GAIN_ENERGY,
      value: 1,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'ARCANE_SCHOLAR',
      target: 'SELF'
    }],
    flavorText: 'Knowledge is a weapon sharper than any blade.'
  },

  'FROST_CHANNELER': {
    id: 'FROST_CHANNELER',
    name: 'Frost Channeler',
    description: 'Deals 2 damage to a target and slows its attack speed. During Normal phase, damage increased to 3. Can generate 1 blood energy.',
    type: CardType.MAGE,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 2,
      health: 2,
      bloodMoonEnergy: 0,
      phaseEffects: {
        [Phase.Normal]: {
          attackBonus: 1,
          specialEffect: 'Frost damage increased by 1',
          energyBonus: 1
        }
      }
    },
    effects: [{
      id: 'FROST_CHANNELER_EFFECT',
      type: EffectType.DIRECT_DAMAGE,
      value: 2,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'FROST_CHANNELER',
      target: 'TARGET_ENEMY'
    },
    {
      id: 'FROST_CHANNELER_ENERGY',
      type: EffectType.GAIN_ENERGY,
      value: 1,
      trigger: EffectTrigger.ON_ATTACK,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'FROST_CHANNELER',
      target: 'SELF'
    }],
    flavorText: 'The cold doesn\'t kill you. It just makes you wish it would.'
  },

  // COMMON CARDS - ASSASSIN
  'SHADOW_INFILTRATOR': {
    id: 'SHADOW_INFILTRATOR',
    name: 'Shadow Infiltrator',
    description: 'Can attack immediately when played. During Normal phase, also gains +1 attack. Generates 1 blood energy on successful attacks.',
    type: CardType.ASSASSIN,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 3,
      health: 1,
      bloodMoonEnergy: 0,
      phaseEffects: {
        [Phase.Normal]: {
          attackBonus: 1,
          specialEffect: 'Bonus attack on play',
          energyBonus: 1
        }
      }
    },
    effects: [{
      id: 'SHADOW_INFILTRATOR_EFFECT',
      type: EffectType.HASTE,
      value: 0,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'SHADOW_INFILTRATOR',
      target: 'SELF'
    },
    {
      id: 'SHADOW_INFILTRATOR_ENERGY',
      type: EffectType.GAIN_ENERGY,
      value: 1,
      trigger: EffectTrigger.ON_ATTACK,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'SHADOW_INFILTRATOR',
      target: 'SELF'
    }],
    flavorText: 'You\'ll never see her coming. That\'s the point.'
  },

  'POISON_ADEPT': {
    id: 'POISON_ADEPT',
    name: 'Poison Adept',
    description: 'Poisons target enemy, dealing 1 damage per turn. During Normal phase, poison spreads to adjacent enemies.',
    type: CardType.ASSASSIN,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 2,
      health: 2,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Poison spreads to adjacent enemies'
        }
      }
    },
    effects: [{
      id: 'POISON_ADEPT_EFFECT',
      type: EffectType.AREA_DAMAGE,
      value: 1,
      trigger: EffectTrigger.ON_TURN_END,
      duration: 3,
      isActive: true,
      phase: Phase.Normal,
      source: 'POISON_ADEPT',
      target: 'TARGET_ENEMY'
    }],
    flavorText: 'A drop to blind, two to sleep, three to die.'
  },

  // COMMON CARDS - BEAST
  'HIGHLAND_LYNX': {
    id: 'HIGHLAND_LYNX',
    name: 'Highland Lynx',
    description: 'Pounces on enemies, dealing bonus damage on first attack. During Normal phase, can attack twice.',
    type: CardType.BEAST,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 2,
      health: 2,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Can attack twice per turn'
        }
      }
    },
    effects: [{
      id: 'HIGHLAND_LYNX_EFFECT',
      type: EffectType.DIRECT_DAMAGE,
      value: 1,
      trigger: EffectTrigger.ON_ATTACK,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'HIGHLAND_LYNX',
      target: 'TARGET_ENEMY'
    }],
    flavorText: 'Silent paws on fresh snow, the last sound its prey ever hears.'
  },

  'FOREST_GUARDIAN': {
    id: 'FOREST_GUARDIAN',
    name: 'Forest Guardian',
    description: 'Gains +1/+1 for each other Beast you control. During Normal phase, also heals 1 health per turn.',
    type: CardType.BEAST,
    rarity: CardRarity.COMMON,
    stats: {
      attack: 2,
      health: 3,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Regenerates 1 health each turn'
        }
      }
    },
    effects: [{
      id: 'FOREST_GUARDIAN_EFFECT',
      type: EffectType.EMPOWER,
      value: 1,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'FOREST_GUARDIAN',
      target: 'SELF'
    }],
    flavorText: 'Ancient spirits dwell within its wooden form, guardians of life itself.'
  },

  // RARE CARDS - WARRIOR
  'LEGION_COMMANDER': {
    id: 'LEGION_COMMANDER',
    name: 'Legion Commander',
    description: 'All Warrior cards gain +1/+1. During Normal phase, also grants them Shielding. Generates 2 blood energy when played.',
    type: CardType.WARRIOR,
    rarity: CardRarity.RARE,
    stats: {
      attack: 3,
      health: 4,
      bloodMoonEnergy: 2,
      phaseEffects: {
        [Phase.Normal]: {
          attackBonus: 1,
          healthBonus: 1,
          specialEffect: 'All Warriors gain shield protection'
        }
      }
    },
    effects: [{
      id: 'LEGION_COMMANDER_EFFECT',
      type: EffectType.EMPOWER,
      value: 1,
      trigger: EffectTrigger.AURA,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'LEGION_COMMANDER',
      target: 'ALL_WARRIORS'
    },
    {
      id: 'LEGION_COMMANDER_ENERGY',
      type: EffectType.GAIN_ENERGY,
      value: 2,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'LEGION_COMMANDER',
      target: 'SELF'
    }],
    flavorText: 'Her battle standard has never fallen, nor has her resolve ever wavered.'
  },

  'BERSERKER_CHAMPION': {
    id: 'BERSERKER_CHAMPION',
    name: 'Berserker Champion',
    description: 'Deals double damage when below half health. During Normal phase, cannot be reduced below 1 health on first lethal damage.',
    type: CardType.WARRIOR,
    rarity: CardRarity.RARE,
    stats: {
      attack: 5,
      health: 3,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Survives first lethal damage with 1 health'
        }
      }
    },
    effects: [{
      id: 'BERSERKER_CHAMPION_EFFECT',
      type: EffectType.DIRECT_DAMAGE,
      value: 3,
      trigger: EffectTrigger.ON_ATTACK,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'BERSERKER_CHAMPION',
      target: 'TARGET_ENEMY'
    }],
    flavorText: 'His rage burns hotter than the forge that tempered his axe.'
  },

  // RARE CARDS - MAGE
  'ARCHMAGE_LUMINAR': {
    id: 'ARCHMAGE_LUMINAR',
    name: 'Archmage Luminar',
    description: 'All spells cost 1 less energy. During Normal phase, also increase their damage by 1.',
    type: CardType.MAGE,
    rarity: CardRarity.RARE,
    stats: {
      attack: 2,
      health: 5,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'All spell damage increased by 1'
        }
      }
    },
    effects: [{
      id: 'ARCHMAGE_LUMINAR_EFFECT',
      type: EffectType.COST_REDUCTION,
      value: 1,
      trigger: EffectTrigger.AURA,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'ARCHMAGE_LUMINAR',
      target: 'ALL_SPELLS'
    }],
    flavorText: 'To master magic is to understand that there are no limits, only consequences.'
  },

  'CRYSTAL_ARTIFICER': {
    id: 'CRYSTAL_ARTIFICER',
    name: 'Crystal Artificer',
    description: 'Creates a mirror image with the same stats. During Normal phase, the mirror also copies effects.',
    type: CardType.MAGE,
    rarity: CardRarity.RARE,
    stats: {
      attack: 3,
      health: 3,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Mirror copy gains all card effects'
        }
      }
    },
    effects: [{
      id: 'CRYSTAL_ARTIFICER_EFFECT',
      type: EffectType.CLONE_SELF,
      value: 1,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'CRYSTAL_ARTIFICER',
      target: 'SELF'
    }],
    flavorText: 'Reality is merely a pattern waiting to be replicated.'
  },

  // RARE CARDS - ASSASSIN
  'ROYAL_EXECUTIONER': {
    id: 'ROYAL_EXECUTIONER',
    name: 'Royal Executioner',
    description: 'Instantly kills damaged enemies. During Normal phase, also deals 2 damage to all enemy minions.',
    type: CardType.ASSASSIN,
    rarity: CardRarity.RARE,
    stats: {
      attack: 4,
      health: 3,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Deals 2 damage to all enemy minions'
        }
      }
    },
    effects: [{
      id: 'ROYAL_EXECUTIONER_EFFECT',
      type: EffectType.MASS_DESTROY,
      value: 1,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'ROYAL_EXECUTIONER',
      target: 'ALL_DAMAGED_ENEMIES'
    }],
    flavorText: 'The king\'s justice is swift, silent, and final.'
  },

  'PHANTOM_BLADE': {
    id: 'PHANTOM_BLADE',
    name: 'Phantom Blade',
    description: 'Gains stealth for 1 turn after attacking. During Normal phase, also gains +2 attack when stealthed.',
    type: CardType.ASSASSIN,
    rarity: CardRarity.RARE,
    stats: {
      attack: 3,
      health: 2,
      phaseEffects: {
        [Phase.Normal]: {
          attackBonus: 2,
          specialEffect: 'Gains +2 attack when stealthed'
        }
      }
    },
    effects: [{
      id: 'PHANTOM_BLADE_EFFECT',
      type: EffectType.SHADOW_STEP,
      value: 1,
      trigger: EffectTrigger.ON_ATTACK,
      duration: 1,
      isActive: true,
      phase: Phase.Normal,
      source: 'PHANTOM_BLADE',
      target: 'SELF'
    }],
    flavorText: 'The blade that kills you belongs to no one, least of all the shadows.'
  },

  // RARE CARDS - BEAST
  'ALPHA_DIREWOLF': {
    id: 'ALPHA_DIREWOLF',
    name: 'Alpha Direwolf',
    description: 'Adjacent Beasts gain +1 attack. During Normal phase, all Beasts gain +1 attack.',
    type: CardType.BEAST,
    rarity: CardRarity.RARE,
    stats: {
      attack: 4,
      health: 4,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Attack bonus applies to all friendly Beasts'
        }
      }
    },
    effects: [{
      id: 'ALPHA_DIREWOLF_EFFECT',
      type: EffectType.EMPOWER,
      value: 1,
      trigger: EffectTrigger.AURA,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'ALPHA_DIREWOLF',
      target: 'ALL_BEASTS'
    }],
    flavorText: 'The pack follows where the alpha leads, as one in mind and purpose.'
  },

  'ANCIENT_TREANT': {
    id: 'ANCIENT_TREANT',
    name: 'Ancient Treant',
    description: 'Restores 3 health to all allies at the end of your turn. During Normal phase, also grants +0/+1.',
    type: CardType.BEAST,
    rarity: CardRarity.RARE,
    stats: {
      attack: 2,
      health: 8,
      phaseEffects: {
        [Phase.Normal]: {
          healthBonus: 1,
          specialEffect: 'All allies gain +0/+1 at end of turn'
        }
      }
    },
    effects: [{
      id: 'ANCIENT_TREANT_EFFECT',
      type: EffectType.HEALING,
      value: 3,
      trigger: EffectTrigger.ON_TURN_END,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'ANCIENT_TREANT',
      target: 'ALL_ALLIES'
    }],
    flavorText: 'Life flows through its ancient roots, connecting all living beings of the forest.'
  },

  // EPIC CARDS - WARRIOR
  'WARLORD_KRAXIS': {
    id: 'WARLORD_KRAXIS',
    name: 'Warlord Kraxis',
    description: 'Deals damage equal to this minion\'s attack to all enemies. During Normal phase, also gains +1 attack after each attack.',
    type: CardType.WARRIOR,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 4,
      health: 6,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Gains +1 attack after each attack'
        }
      }
    },
    effects: [{
      id: 'WARLORD_KRAXIS_EFFECT',
      type: EffectType.AREA_DAMAGE,
      value: 4,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'WARLORD_KRAXIS',
      target: 'ALL_ENEMIES'
    }],
    flavorText: 'His campaigns are studied by friend and foe alike, though none can replicate his ferocity.'
  },

  'SHIELDMAIDEN_VALKYRIE': {
    id: 'SHIELDMAIDEN_VALKYRIE',
    name: 'Shieldmaiden Valkyrie',
    description: 'Redirects all damage from adjacent allies to itself. During Normal phase, reduces all damage taken by 1.',
    type: CardType.WARRIOR,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 3,
      health: 7,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Reduces all damage taken by 1'
        }
      }
    },
    effects: [{
      id: 'SHIELDMAIDEN_VALKYRIE_EFFECT',
      type: EffectType.TRANSFORM,
      value: 0,
      trigger: EffectTrigger.ON_DAMAGE,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'SHIELDMAIDEN_VALKYRIE',
      target: 'SELF'
    }],
    flavorText: 'Born of battle, she chooses the worthy to ascend beyond death itself.'
  },

  // EPIC CARDS - MAGE
  'ARCANE_SINGULARITY': {
    id: 'ARCANE_SINGULARITY',
    name: 'Arcane Singularity',
    description: 'Doubles the effect of all spells. During Normal phase, also reduces their cost by 1. Generates 2 blood energy on spell cast.',
    type: CardType.MAGE,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 3,
      health: 5,
      bloodMoonEnergy: 2,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Reduces cost of all spells by 1'
        }
      }
    },
    effects: [{
      id: 'ARCANE_SINGULARITY_EFFECT',
      type: EffectType.EMPOWER,
      value: 2,
      trigger: EffectTrigger.AURA,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'ARCANE_SINGULARITY',
      target: 'ALL_SPELLS'
    },
    {
      id: 'ARCANE_SINGULARITY_ENERGY',
      type: EffectType.GAIN_ENERGY,
      value: 2,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'ARCANE_SINGULARITY',
      target: 'SELF'
    }],
    flavorText: 'Where all magical theory collapses into perfect, terrifying understanding.'
  },

  'CHRONOMANCER': {
    id: 'CHRONOMANCER',
    name: 'Chronomancer',
    description: 'Reset all your cooldowns when played. During Normal phase, all allies can attack again this turn.',
    type: CardType.MAGE,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 2,
      health: 4,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'All allies can attack again this turn'
        }
      }
    },
    effects: [{
      id: 'CHRONOMANCER_EFFECT',
      type: EffectType.HASTE,
      value: 0,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'CHRONOMANCER',
      target: 'ALL_ALLIES'
    }],
    flavorText: 'Time is not a river, but a sea. And she is its most skilled navigator.'
  },

  // EPIC CARDS - ASSASSIN
  'NIGHTBLADE_MASTER': {
    id: 'NIGHTBLADE_MASTER',
    name: 'Nightblade Master',
    description: 'Destroy a minion and gain its attack and health. During Normal phase, also copies its effect.',
    type: CardType.ASSASSIN,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 4,
      health: 3,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Copies the effect of destroyed minion'
        }
      }
    },
    effects: [{
      id: 'NIGHTBLADE_MASTER_EFFECT',
      type: EffectType.CONSUME,
      value: 1,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'NIGHTBLADE_MASTER',
      target: 'TARGET_MINION'
    }],
    flavorText: 'The ultimate mastery of assassination is not taking life, but subsuming it.'
  },

  'VENOM_GRANDMASTER': {
    id: 'VENOM_GRANDMASTER',
    name: 'Venom Grandmaster',
    description: 'Poisons all enemy minions, dealing 1 damage per turn. During Normal phase, poison damage increased to 2.',
    type: CardType.ASSASSIN,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 3,
      health: 4,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Poison damage increased to 2 per turn'
        }
      }
    },
    effects: [{
      id: 'VENOM_GRANDMASTER_EFFECT',
      type: EffectType.AREA_DAMAGE,
      value: 1,
      trigger: EffectTrigger.ON_TURN_END,
      duration: 3,
      isActive: true,
      phase: Phase.Normal,
      source: 'VENOM_GRANDMASTER',
      target: 'ALL_ENEMY_MINIONS'
    }],
    flavorText: 'His poisons are renowned across the realm—both for their efficacy and their excruciating pain.'
  },

  // EPIC CARDS - BEAST
  'ELDER_BEHEMOTH': {
    id: 'ELDER_BEHEMOTH',
    name: 'Elder Behemoth',
    description: 'Cannot be targeted by spells. During Normal phase, regenerates 3 health each turn.',
    type: CardType.BEAST,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 6,
      health: 8,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Regenerates 3 health each turn'
        }
      }
    },
    effects: [{
      id: 'ELDER_BEHEMOTH_EFFECT',
      type: EffectType.HEALING,
      value: 3,
      trigger: EffectTrigger.ON_TURN_START,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'ELDER_BEHEMOTH',
      target: 'SELF'
    }],
    flavorText: 'Ancient beyond reckoning, it has witnessed the rise and fall of civilizations with indifference.'
  },

  'VERDANT_OVERLORD': {
    id: 'VERDANT_OVERLORD',
    name: 'Verdant Overlord',
    description: 'Summon three 2/2 Plant minions with Taunt. During Normal phase, they gain +1/+1.',
    type: CardType.BEAST,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 3,
      health: 5,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Summoned Plants gain +1/+1'
        }
      }
    },
    effects: [{
      id: 'VERDANT_OVERLORD_EFFECT',
      type: EffectType.CLONE,
      value: 3,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'VERDANT_OVERLORD',
      target: 'SELF'
    }],
    flavorText: 'Where his roots touch the soil, forests rise to heed his call.'
  },

  // LEGENDARY CARDS - WARRIOR
  'GENERAL_MAGNUS': {
    id: 'GENERAL_MAGNUS',
    name: 'General Magnus, the Undefeated',
    description: 'Your Warriors are immune to damage for 1 turn. During Normal phase, also gain +2/+2. Generates 3 blood energy when played.',
    type: CardType.WARRIOR,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 7,
      health: 7,
      bloodMoonEnergy: 3,
      phaseEffects: {
        [Phase.Normal]: {
          attackBonus: 2,
          healthBonus: 2,
          specialEffect: 'All Warriors immune to damage for 1 turn'
        }
      }
    },
    effects: [{
      id: 'GENERAL_MAGNUS_EFFECT',
      type: EffectType.TRANSFORM,
      value: 0,
      trigger: EffectTrigger.ON_PLAY,
      duration: 1,
      isActive: true,
      phase: Phase.Normal,
      source: 'GENERAL_MAGNUS',
      target: 'ALL_WARRIORS'
    }],
    flavorText: 'One hundred battles. One hundred victories. His legend grows with every foe that falls.'
  },

  // LEGENDARY CARDS - MAGE
  'ARCHMAGUS_ETHEREUS': {
    id: 'ARCHMAGUS_ETHEREUS',
    name: 'Archmagus Ethereus',
    description: 'Cast a copy of each spell you\'ve cast this game. During Normal phase, these copies cost 0.',
    type: CardType.MAGE,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 5,
      health: 7,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Copied spells cost 0 energy'
        }
      }
    },
    effects: [{
      id: 'ARCHMAGUS_ETHEREUS_EFFECT',
      type: EffectType.CLONE,
      value: 0,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'ARCHMAGUS_ETHEREUS',
      target: 'ALL_SPELLS'
    }],
    flavorText: 'Reality is his canvas, arcane energy his paint, and time itself merely a suggestion.'
  },

  // LEGENDARY CARDS - ASSASSIN
  'MISTRESS_SHADOW': {
    id: 'MISTRESS_SHADOW',
    name: 'Mistress of Shadow',
    description: 'Destroy all enemy minions with 3 or less attack. During Normal phase, gain control of one instead.',
    type: CardType.ASSASSIN,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 6,
      health: 6,
      phaseEffects: {
        [Phase.Normal]: {
          specialEffect: 'Gain control of one enemy minion instead of destroying it'
        }
      }
    },
    effects: [{
      id: 'MISTRESS_SHADOW_EFFECT',
      type: EffectType.MASS_DESTROY,
      value: 3,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'MISTRESS_SHADOW',
      target: 'ALL_ENEMY_MINIONS'
    }],
    flavorText: 'Death is but one tool in her arsenal. Fear is infinitely more useful.'
  },

  // LEGENDARY CARDS - BEAST
  'GAIA_INCARNATE': {
    id: 'GAIA_INCARNATE',
    name: 'Gaia Incarnate',
    description: 'Transform all minions into random Beasts. During Normal phase, yours gain +2/+2.',
    type: CardType.BEAST,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 8,
      health: 8,
      phaseEffects: {
        [Phase.Normal]: {
          attackBonus: 2,
          healthBonus: 2,
          specialEffect: 'All friendly transformed Beasts gain +2/+2'
        }
      }
    },
    effects: [{
      id: 'GAIA_INCARNATE_EFFECT',
      type: EffectType.MASS_TRANSFORM,
      value: 0,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.Normal,
      source: 'GAIA_INCARNATE',
      target: 'ALL_MINIONS'
    }],
    flavorText: 'When the mountains walk and forests roar, know that She has awakened.'
  },

  // MYTHIC CARD - MULTI-TYPE
  'CELESTIAL_ARBITER': {
    id: 'CELESTIAL_ARBITER',
    name: 'Celestial Arbiter',
    description: 'Gain the combined power of all card types. During Normal phase, all your cards cost 1 less and deal 1 more damage. Generates 5 blood energy when played.',
    type: CardType.CELESTIAL,
    rarity: CardRarity.MYTHIC,
    stats: {
      attack: 8,
      health: 10,
      bloodMoonEnergy: 5,
      phaseEffects: {
        [Phase.Normal]: {
          attackBonus: 3,
          healthBonus: 3,
          specialEffect: 'All cards cost 1 less and deal 1 more damage'
        }
      }
    },
    effects: [
      {
        id: 'CELESTIAL_ARBITER_EFFECT_1',
        type: EffectType.COST_REDUCTION,
        value: 1,
        trigger: EffectTrigger.AURA,
        duration: 0,
        isActive: true,
        phase: Phase.Normal,
        source: 'CELESTIAL_ARBITER',
        target: 'ALL_CARDS'
      },
      {
        id: 'CELESTIAL_ARBITER_EFFECT_2',
        type: EffectType.EMPOWER,
        value: 1,
        trigger: EffectTrigger.AURA,
        duration: 0,
        isActive: true,
        phase: Phase.Normal,
        source: 'CELESTIAL_ARBITER',
        target: 'ALL_CARDS'
      },
      {
        id: 'CELESTIAL_ARBITER_EFFECT_3',
        type: EffectType.HEALING,
        value: 5,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0,
        isActive: true,
        phase: Phase.Normal,
        source: 'CELESTIAL_ARBITER',
        target: 'SELF'
      }
    ],
    flavorText: 'When the cosmic scales must be balanced, the Arbiter\'s judgment is absolute and final.'
  }
}; 