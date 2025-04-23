import { CardType, CardRarity, Phase } from '../models/Card';
import type { CardStats } from '../models/Card';
import { EffectType, EffectTrigger } from '../models/Effect';
import type { Effect, BloodMoonEffect } from '../models/Effect';

export interface BloodMoonCardDefinition {
  id: string;
  name: string;
  description: string;
  type: CardType;
  rarity: CardRarity;
  stats: CardStats;
  effects: Effect[];
  bloodMoonEffects: BloodMoonEffect[];
  flavorText?: string;
  artPrompt?: string; // Description for AI art generation
}

export const BLOOD_MOON_CARDS: Record<string, BloodMoonCardDefinition> = {
  // RARE BLOOD CARDS
  'CRIMSON_HARVESTER': {
    id: 'CRIMSON_HARVESTER',
    name: 'Crimson Harvester',
    description: 'Drains 2 health from all enemies. During Blood Moon, creates Blood Energy equal to damage dealt.',
    type: CardType.BLOOD,
    rarity: CardRarity.RARE,
    stats: {
      attack: 3,
      health: 4,
      phaseEffects: {
        [Phase.BloodMoon]: {
          attackBonus: 2,
          specialEffect: 'Converts all damage to Blood Energy'
        }
      },
      bloodMoonCost: 1
    },
    effects: [{
      id: 'CRIMSON_HARVESTER_EFFECT',
      type: EffectType.BLOOD_DRAIN,
      value: 2,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'CRIMSON_HARVESTER',
      target: 'ALL_ENEMIES'
    }],
    bloodMoonEffects: [{
      id: 'CRIMSON_HARVESTER_BLOOD_EFFECT',
      type: EffectType.BLOOD_DRAIN,
      value: 3,
      duration: 0,
      bloodCost: 1,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'CRIMSON_HARVESTER',
      target: 'ALL_ENEMIES'
    }],
    flavorText: 'The earth remembers what it drinks, and thirsts for more.',
    artPrompt: 'A horrifying entity with scythe-like limbs harvesting crimson energy from wounded enemies, blood droplets crystallizing into ruby-like energy sources that orbit around it. Deep crimson color scheme with black accents, grotesque organic details.'
  },

  'VEINSTALKER': {
    id: 'VEINSTALKER',
    name: 'Veinstalker',
    description: 'Whenever this attacks, gain 1 health. During Blood Moon, gain 3 health instead and 1 Blood Energy.',
    type: CardType.BLOOD,
    rarity: CardRarity.RARE,
    stats: {
      attack: 2,
      health: 5,
      phaseEffects: {
        [Phase.BloodMoon]: {
          attackBonus: 1,
          specialEffect: 'Healing increased to 3 and gain 1 Blood Energy'
        }
      },
      bloodMoonCost: 2
    },
    effects: [{
      id: 'VEINSTALKER_EFFECT',
      type: EffectType.HEALING,
      value: 1,
      trigger: EffectTrigger.ON_ATTACK,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'VEINSTALKER',
      target: 'SELF'
    }],
    bloodMoonEffects: [{
      id: 'VEINSTALKER_BLOOD_EFFECT',
      type: EffectType.BLOOD_DRAIN,
      value: 3,
      duration: 0,
      bloodCost: 2,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'VEINSTALKER',
      target: 'SELF'
    }],
    flavorText: 'It doesn\'t just follow the scent of blood—it follows the very rhythm of your heart.',
    artPrompt: 'A shadowy predator with needle-like appendages that pierce into victims\' veins, its body pulsing with stolen blood. Glowing red eyes tracking prey, mist-like lower half, obsidian claws dripping with fresh blood, partially camouflaged against a crimson landscape.'
  },

  // EPIC BLOOD CARDS
  'HEMOMANCER': {
    id: 'HEMOMANCER',
    name: 'Hemomancer',
    description: 'Sacrifice 2 health to deal 4 damage to a target. During Blood Moon, costs 0 health and generates 2 Blood Energy.',
    type: CardType.BLOOD,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 3,
      health: 4,
      phaseEffects: {
        [Phase.BloodMoon]: {
          attackBonus: 2,
          specialEffect: 'Blood magic costs no health and generates 2 Blood Energy'
        }
      },
      bloodMoonCost: 2
    },
    effects: [{
      id: 'HEMOMANCER_EFFECT',
      type: EffectType.DIRECT_DAMAGE,
      value: 4,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'HEMOMANCER',
      target: 'TARGET_ENEMY'
    }],
    bloodMoonEffects: [{
      id: 'HEMOMANCER_BLOOD_EFFECT',
      type: EffectType.DIRECT_DAMAGE,
      value: 6,
      duration: 0,
      bloodCost: 2,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'HEMOMANCER',
      target: 'TARGET_ENEMY'
    }],
    flavorText: 'Blood is merely a currency. She is the bank.',
    artPrompt: 'A pale sorceress with intricate vein-like tattoos conducting elaborate blood magic, manipulating floating orbs of crystallized blood with arcane gestures. Victorian-inspired clothing with red embroidery, blood ritual circle beneath her, sacrificial runes hovering around her fingers.'
  },

  'ARTERIAL_CONSTRUCT': {
    id: 'ARTERIAL_CONSTRUCT',
    name: 'Arterial Construct',
    description: 'Costs 3 health to play. Taunt. Gains +1/+1 for each point of damage your hero has taken. During Blood Moon, costs no health and doubles stat bonuses.',
    type: CardType.BLOOD,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 2,
      health: 2,
      phaseEffects: {
        [Phase.BloodMoon]: {
          specialEffect: 'Doubles all stat bonuses from player damage'
        }
      },
      bloodMoonCost: 3
    },
    effects: [{
      id: 'ARTERIAL_CONSTRUCT_EFFECT',
      type: EffectType.TRANSFORM,
      value: 0,
      trigger: EffectTrigger.ON_DAMAGE,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'ARTERIAL_CONSTRUCT',
      target: 'SELF'
    }],
    bloodMoonEffects: [{
      id: 'ARTERIAL_CONSTRUCT_BLOOD_EFFECT',
      type: EffectType.TRANSFORM,
      value: 0,
      duration: 0,
      bloodCost: 3,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'ARTERIAL_CONSTRUCT',
      target: 'SELF'
    }],
    flavorText: 'Your suffering gives it form. Your agony gives it purpose.',
    artPrompt: 'A massive guardian entity formed entirely of crystallized blood and connected arterial tubes, growing larger as its master takes damage. Anatomical heart-like core, pulsating with energy, shield and weapon crafted from hardened blood, imposing stance protecting its creator.'
  },

  'SANGUINE_PUPPETEER': {
    id: 'SANGUINE_PUPPETEER',
    name: 'Sanguine Puppeteer',
    description: 'Take control of an enemy minion with 3 or less health until end of turn. During Blood Moon, control is permanent and generates Blood Energy equal to the minion\'s cost.',
    type: CardType.BLOOD,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 2,
      health: 3,
      phaseEffects: {
        [Phase.BloodMoon]: {
          specialEffect: 'Mind control becomes permanent and generates Blood Energy'
        }
      },
      bloodMoonCost: 3
    },
    effects: [{
      id: 'SANGUINE_PUPPETEER_EFFECT',
      type: EffectType.MIND_CONTROL,
      value: 3,
      trigger: EffectTrigger.ON_PLAY,
      duration: 1,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'SANGUINE_PUPPETEER',
      target: 'TARGET_ENEMY'
    }],
    bloodMoonEffects: [{
      id: 'SANGUINE_PUPPETEER_BLOOD_EFFECT',
      type: EffectType.MIND_CONTROL,
      value: 3,
      duration: 0,
      bloodCost: 3,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'SANGUINE_PUPPETEER',
      target: 'TARGET_ENEMY'
    }],
    flavorText: 'Blood is thicker than water, but makes for even better strings.',
    artPrompt: 'A sinister puppetmaster controlling victims through blood strings attached to their veins, invisible threads of crimson energy extending from fingertips to helpless enemies. Theatrical costume with plague doctor elements, marionette-like movements, victims with vacant blood-red eyes.'
  },

  // LEGENDARY BLOOD CARDS
  'CRIMSON_MATRIARCH': {
    id: 'CRIMSON_MATRIARCH',
    name: 'Crimson Matriarch, Blood Empress',
    description: 'Your Blood Moon phase lasts 2 extra turns. Your Blood cards cost 1 less to play. During Blood Moon, all your Blood cards have Lifesteal and generate double Blood Energy.',
    type: CardType.BLOOD,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 6,
      health: 6,
      phaseEffects: {
        [Phase.BloodMoon]: {
          attackBonus: 3,
          healthBonus: 3,
          specialEffect: 'All Blood cards gain Lifesteal and generate double Blood Energy'
        }
      },
      bloodMoonCost: 4
    },
    effects: [{
      id: 'CRIMSON_MATRIARCH_EFFECT',
      type: EffectType.COST_REDUCTION,
      value: 1,
      trigger: EffectTrigger.AURA,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'CRIMSON_MATRIARCH',
      target: 'ALL_BLOOD_CARDS'
    }],
    bloodMoonEffects: [{
      id: 'CRIMSON_MATRIARCH_BLOOD_EFFECT',
      type: EffectType.COST_REDUCTION,
      value: 2,
      duration: 0,
      bloodCost: 4,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'CRIMSON_MATRIARCH',
      target: 'ALL_BLOOD_CARDS'
    }],
    flavorText: 'She doesn\'t rule the Blood Moon—she is the Blood Moon incarnate.',
    artPrompt: 'A majestic and terrifying empress seated on a throne of crystallized blood and bone, surrounded by blood mist and orbiting crimson moons. Elaborate royal attire with organic blood-vessel patterns, crown of ossified blood, commanding the very essence of the Blood Moon from her fingertips.'
  },

  'HEARTDRINKER_PRINCE': {
    id: 'HEARTDRINKER_PRINCE',
    name: 'Heartdrinker Prince',
    description: 'Sacrifice all other friendly minions. Gain their combined Attack and Health, plus 2 Blood Energy for each. During Blood Moon, also copy all their abilities.',
    type: CardType.BLOOD,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 4,
      health: 4,
      phaseEffects: {
        [Phase.BloodMoon]: {
          specialEffect: 'Also copies all abilities from sacrificed minions'
        }
      },
      bloodMoonCost: 5
    },
    effects: [{
      id: 'HEARTDRINKER_PRINCE_EFFECT',
      type: EffectType.CONSUME,
      value: 0,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'HEARTDRINKER_PRINCE',
      target: 'ALL_FRIENDLY_MINIONS'
    }],
    bloodMoonEffects: [{
      id: 'HEARTDRINKER_PRINCE_BLOOD_EFFECT',
      type: EffectType.CONSUME,
      value: 0,
      duration: 0,
      bloodCost: 5,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'HEARTDRINKER_PRINCE',
      target: 'ALL_FRIENDLY_MINIONS'
    }],
    flavorText: 'Why command the loyal when you can become them all?',
    artPrompt: 'A regal vampiric entity absorbing the essence of sacrificed followers, their forms dissolving into him as their powers visibly transfer into his transforming body. Aristocratic but monstrous features, ceremonial daggers dripping with blood, spectral images of absorbed souls visible within his semi-transparent form.'
  },

  'BLOOD_REALITY': {
    id: 'BLOOD_REALITY',
    name: 'Blood Reality',
    description: 'Transform all cards everywhere into Blood cards. During Blood Moon, permanently convert the game to Blood Moon phase as long as this minion lives.',
    type: CardType.BLOOD,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 7,
      health: 7,
      phaseEffects: {
        [Phase.BloodMoon]: {
          attackBonus: 3,
          healthBonus: 3,
          specialEffect: 'Locks game into Blood Moon phase while alive'
        }
      },
      bloodMoonCost: 7
    },
    effects: [{
      id: 'BLOOD_REALITY_EFFECT',
      type: EffectType.REALITY_SHIFT,
      value: 0,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'BLOOD_REALITY',
      target: 'ALL_CARDS'
    }],
    bloodMoonEffects: [{
      id: 'BLOOD_REALITY_BLOOD_EFFECT',
      type: EffectType.PHASE_LOCK,
      value: 0,
      duration: 0,
      bloodCost: 7,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'BLOOD_REALITY',
      target: 'GAME'
    }],
    flavorText: 'In the end, all realities bleed into one.',
    artPrompt: 'A cosmic horror entity transforming all of reality into a blood-soaked dimension, the world itself warping and changing as normal matter converts to living blood. Reality-bending visual distortion, blood waterfall horizons, multiple crimson moons in the sky, geometric impossibilities formed of flowing blood.'
  },

  // MYTHIC BLOOD CARD
  'HEMORRHAGE_ENTITY': {
    id: 'HEMORRHAGE_ENTITY',
    name: 'Hemorrhage, The First Blood',
    description: 'Costs all your Blood Energy. For each Blood Energy spent, deal 3 damage to all enemies, gain 3 health, and summon a 3/3 Blood Elemental. During Blood Moon, values are doubled.',
    type: CardType.BLOOD,
    rarity: CardRarity.MYTHIC,
    stats: {
      attack: 9,
      health: 9,
      phaseEffects: {
        [Phase.BloodMoon]: {
          attackBonus: 6,
          healthBonus: 6,
          specialEffect: 'All values from Blood Energy expenditure are doubled'
        }
      },
      bloodMoonCost: 10
    },
    effects: [{
      id: 'HEMORRHAGE_ENTITY_EFFECT',
      type: EffectType.AREA_DAMAGE,
      value: 3,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'HEMORRHAGE_ENTITY',
      target: 'ALL_ENEMIES'
    }],
    bloodMoonEffects: [{
      id: 'HEMORRHAGE_ENTITY_BLOOD_EFFECT_1',
      type: EffectType.AREA_DAMAGE,
      value: 6,
      duration: 0,
      bloodCost: 10,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'HEMORRHAGE_ENTITY',
      target: 'ALL_ENEMIES'
    }, {
      id: 'HEMORRHAGE_ENTITY_BLOOD_EFFECT_2',
      type: EffectType.HEALING,
      value: 6,
      duration: 0,
      bloodCost: 10,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'HEMORRHAGE_ENTITY',
      target: 'SELF'
    }, {
      id: 'HEMORRHAGE_ENTITY_BLOOD_EFFECT_3',
      type: EffectType.CLONE,
      value: 6,
      duration: 0,
      bloodCost: 10,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'HEMORRHAGE_ENTITY',
      target: 'SELF'
    }],
    flavorText: 'Before the void, before the light, the first spilled blood called itself by name.',
    artPrompt: 'An ancient primordial entity that is the origin of all blood magic, a terrifying amalgamation of flesh, blood and cosmic horror with multiple beating hearts exposed throughout its form. Impossible scale suggesting it extends beyond reality, fractal blood patterns spiraling outward, surrounding by orbiting elementals formed of pure blood essence, apocalyptic blood storm emanating from its core.'
  },
  
  // ADDITIONAL LEGENDARY BLOOD CARDS
  'VEIN_COLOSSUS': {
    id: 'VEIN_COLOSSUS',
    name: 'Vein Colossus',
    description: 'Taunt. When damaged, deal that much damage to all enemies. During Blood Moon, also gain that much Blood Energy.',
    type: CardType.BLOOD,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 5,
      health: 10,
      phaseEffects: {
        [Phase.BloodMoon]: {
          healthBonus: 5,
          specialEffect: 'Gains Blood Energy equal to damage taken'
        }
      },
      bloodMoonCost: 6
    },
    effects: [{
      id: 'VEIN_COLOSSUS_EFFECT',
      type: EffectType.AREA_DAMAGE,
      value: 0,
      trigger: EffectTrigger.ON_DAMAGE,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'VEIN_COLOSSUS',
      target: 'ALL_ENEMIES'
    }],
    bloodMoonEffects: [{
      id: 'VEIN_COLOSSUS_BLOOD_EFFECT',
      type: EffectType.AREA_DAMAGE,
      value: 0,
      duration: 0,
      bloodCost: 6,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'VEIN_COLOSSUS',
      target: 'ALL_ENEMIES'
    }],
    flavorText: 'Each wound is not a weakness, but a new mouth hungry for retribution.',
    artPrompt: 'A towering behemoth with a body composed of massive arteries and veins that spray pressurized blood at enemies when damaged, its system connected to the very earth beneath it. Muscular structure visible through transparent skin, crystallized blood armor plates, wounds that become weapons, dominating the battlefield with sheer size.'
  },

  'EXSANGUINATOR': {
    id: 'EXSANGUINATOR',
    name: 'Exsanguinator',
    description: 'Battlecry: Transform all enemy minions into 1/1 Blood Droplets (with no abilities). During Blood Moon, gain control of them instead.',
    type: CardType.BLOOD,
    rarity: CardRarity.LEGENDARY,
    stats: {
      attack: 6,
      health: 6,
      phaseEffects: {
        [Phase.BloodMoon]: {
          attackBonus: 1,
          healthBonus: 1,
          specialEffect: 'Gains control of transformed minions instead'
        }
      },
      bloodMoonCost: 8
    },
    effects: [{
      id: 'EXSANGUINATOR_EFFECT',
      type: EffectType.MASS_TRANSFORM,
      value: 0,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'EXSANGUINATOR',
      target: 'ALL_ENEMY_MINIONS'
    }],
    bloodMoonEffects: [{
      id: 'EXSANGUINATOR_BLOOD_EFFECT',
      type: EffectType.MIND_CONTROL,
      value: 0,
      duration: 0,
      bloodCost: 8,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'EXSANGUINATOR',
      target: 'ALL_ENEMY_MINIONS'
    }],
    flavorText: 'They said no man could drain the sea. They never specified which sea.',
    artPrompt: 'A terrifying entity that reduces victims to their basic blood essence, wielding a specialized apparatus that extracts all liquid from its enemies, leaving only crimson droplets. Industrial-horror aesthetic with surgical elements, victims visibly being reduced to their elemental blood state, floating crimson spheres orbiting where enemies once stood.'
  },

  'HEMOGOBLIN_SWARM': {
    id: 'HEMOGOBLIN_SWARM',
    name: 'Hemogoblin Swarm',
    description: 'Summon five 2/2 Hemogoblins with Lifesteal. During Blood Moon, they gain +2/+2 and generate 1 Blood Energy on attack.',
    type: CardType.BLOOD,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 2,
      health: 2,
      phaseEffects: {
        [Phase.BloodMoon]: {
          attackBonus: 2,
          healthBonus: 2,
          specialEffect: 'Summoned minions generate Blood Energy on attack'
        }
      },
      bloodMoonCost: 4
    },
    effects: [{
      id: 'HEMOGOBLIN_SWARM_EFFECT',
      type: EffectType.CLONE,
      value: 5,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'HEMOGOBLIN_SWARM',
      target: 'SELF'
    }],
    bloodMoonEffects: [{
      id: 'HEMOGOBLIN_SWARM_BLOOD_EFFECT',
      type: EffectType.CLONE,
      value: 5,
      duration: 0,
      bloodCost: 4,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'HEMOGOBLIN_SWARM',
      target: 'SELF'
    }],
    flavorText: 'One drop finds another, and another, until the flood consumes all.',
    artPrompt: 'A chaotic swarm of blood-red impish creatures formed from droplets of blood, multiplying rapidly as they steal life essence from enemies. Mischievous expressions, needle-like teeth for blood extraction, feral pack behavior, horrific transformation from individual drops to organized hunting pack.'
  },

  'BLOODSTORM_INVOKER': {
    id: 'BLOODSTORM_INVOKER',
    name: 'Bloodstorm Invoker',
    description: 'Your Blood cards cost 2 Blood Energy less. At the end of your turn, cast Blood Storm dealing 1 damage to all enemies for each Blood card you played this turn. During Blood Moon, damage is doubled.',
    type: CardType.BLOOD,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 3,
      health: 5,
      phaseEffects: {
        [Phase.BloodMoon]: {
          attackBonus: 1,
          specialEffect: 'Blood Storm damage is doubled'
        }
      },
      bloodMoonCost: 3
    },
    effects: [{
      id: 'BLOODSTORM_INVOKER_EFFECT',
      type: EffectType.COST_REDUCTION,
      value: 2,
      trigger: EffectTrigger.AURA,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'BLOODSTORM_INVOKER',
      target: 'ALL_BLOOD_CARDS'
    }, {
      id: 'BLOODSTORM_INVOKER_EFFECT_2',
      type: EffectType.AREA_DAMAGE,
      value: 1,
      trigger: EffectTrigger.ON_TURN_END,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'BLOODSTORM_INVOKER',
      target: 'ALL_ENEMIES'
    }],
    bloodMoonEffects: [{
      id: 'BLOODSTORM_INVOKER_BLOOD_EFFECT',
      type: EffectType.AREA_DAMAGE,
      value: 2,
      duration: 0,
      bloodCost: 3,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'BLOODSTORM_INVOKER',
      target: 'ALL_ENEMIES'
    }],
    flavorText: 'The storm doesn\'t come to wash away sins, but to harvest them.',
    artPrompt: 'A dark shaman conjuring a devastating storm of blood droplets that cut through enemies like razor blades, arms raised to command the crimson tempest. Weather magic aesthetic with blood elements, swirling vortex of crimson above, atmospheric pressure visibly changing around the invoker, enemies caught in the crimson downpour.'
  },

  'CLOT_TITAN': {
    id: 'CLOT_TITAN',
    name: 'Clot Titan',
    description: 'Gain Attack and Health equal to your Blood Energy. Can\'t be targeted by spells or abilities. During Blood Moon, also gain "Can\'t take more than 1 damage at a time".',
    type: CardType.BLOOD,
    rarity: CardRarity.EPIC,
    stats: {
      attack: 1,
      health: 1,
      phaseEffects: {
        [Phase.BloodMoon]: {
          specialEffect: 'Can\'t take more than 1 damage at a time'
        }
      },
      bloodMoonCost: 5
    },
    effects: [{
      id: 'CLOT_TITAN_EFFECT',
      type: EffectType.TRANSFORM,
      value: 0,
      trigger: EffectTrigger.ON_PLAY,
      duration: 0,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'CLOT_TITAN',
      target: 'SELF'
    }],
    bloodMoonEffects: [{
      id: 'CLOT_TITAN_BLOOD_EFFECT',
      type: EffectType.TRANSFORM,
      value: 0,
      duration: 0,
      bloodCost: 5,
      isActive: true,
      phase: Phase.BloodMoon,
      source: 'CLOT_TITAN',
      target: 'SELF'
    }],
    flavorText: 'It was born from a single drop of immortal blood, and has been growing ever since.',
    artPrompt: 'A massive humanoid figure composed entirely of thickened, clotted blood that hardens into impenetrable armor when attacked, its size proportionate to available blood energy. Monolithic presence, surface constantly shifting and reforming, damage visibly being absorbed and instantly repaired, ancient sentinel-like posture.'
  }
}; 