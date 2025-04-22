import type { Card, CardStats } from '../models/Card';
import { CardType, CardRarity } from '../models/Card';
import { EffectType, EffectTrigger } from '../models/Effect';
import type { Effect } from '../models/Effect';
import crypto from 'crypto';

interface CardTypeDefinition {
  id: string;
  name: string;
  description: string;
  type: CardType;
  rarity: CardRarity;
  stats: CardStats;
  effects: Effect[];
}

interface CardInstance extends CardTypeDefinition {
  id: string;
  id_name: string;
  currentHealth: number;
  currentAttack: number;
  bloodMoonCharge: number;
  isTransformed: boolean;
}

export class CardService {
  private static instance: CardService;
  private cardTypes: Map<string, CardTypeDefinition>;
  private decks: Map<string, CardInstance[]>;

  private constructor() {
    this.cardTypes = new Map();
    this.decks = new Map();
    this.initializeCardTypes();
    this.initializeDecks();
  }

  public static getInstance(): CardService {
    if (!CardService.instance) {
      CardService.instance = new CardService();
    }
    return CardService.instance;
  }

  private initializeCardTypes(): void {
    // VOID Cards
    this.cardTypes.set('VOID_1', {
      id: 'VOID_1',
      name: 'Void Prince',
      description: 'Deals 3 void damage and gains 1 blood moon charge',
      type: CardType.VOID,
      rarity: CardRarity.COMMON,
      stats: {
        attack: 2,
        health: 3,
        cost: 1
      },
      effects: [{
        id: 'VOID_1_EFFECT_1',
        type: EffectType.VOID_DAMAGE,
        value: 3,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      }]
    });

    this.cardTypes.set('VOID_2', {
      id: 'VOID_2',
      name: 'Shadow Knight',
      description: 'Gains 2 attack and shadow steps when blood moon is active',
      type: CardType.VOID,
      rarity: CardRarity.COMMON,
      stats: {
        attack: 2,
        health: 4,
        cost: 2
      },
      effects: [{
        id: 'VOID_2_EFFECT_1',
        type: EffectType.SHADOW_STEP,
        value: 2,
        trigger: EffectTrigger.ON_BLOOD_MOON,
        duration: 1
      }]
    });

    this.cardTypes.set('VOID_3', {
      id: 'VOID_3',
      name: 'Netherblade Assassin',
      description: 'Deals 4 void damage and drains 2 health from target',
      type: CardType.VOID,
      rarity: CardRarity.RARE,
      stats: {
        attack: 3,
        health: 2,
        cost: 3
      },
      effects: [{
        id: 'VOID_3_EFFECT_1',
        type: EffectType.VOID_DAMAGE,
        value: 4,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      },
      {
        id: 'VOID_3_EFFECT_2',
        type: EffectType.BLOOD_DRAIN,
        value: 2,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      }]
    });

    // BLOOD Cards
    this.cardTypes.set('BLOOD_1', {
      id: 'BLOOD_1',
      name: 'Blood Moon Cultist',
      description: 'Gains 1 blood moon charge and deals 2 damage to all enemies',
      type: CardType.BLOOD,
      rarity: CardRarity.COMMON,
      stats: {
        attack: 1,
        health: 3,
        cost: 1
      },
      effects: [{
        id: 'BLOOD_1_EFFECT_1',
        type: EffectType.BLOOD_DRAIN,
        value: 2,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      }]
    });

    this.cardTypes.set('BLOOD_2', {
      id: 'BLOOD_2',
      name: 'Crimson Reaper',
      description: 'Deals 3 damage and heals for 2 when blood moon is active',
      type: CardType.BLOOD,
      rarity: CardRarity.COMMON,
      stats: {
        attack: 3,
        health: 3,
        cost: 2
      },
      effects: [{
        id: 'BLOOD_2_EFFECT_1',
        type: EffectType.BLOOD_DRAIN,
            value: 3,
        trigger: EffectTrigger.ON_BLOOD_MOON,
        duration: 0
      }]
    });

    this.cardTypes.set('BLOOD_3', {
      id: 'BLOOD_3',
      name: 'Blood Moon Harbinger',
      description: 'Transforms all void cards into their blood moon form',
      type: CardType.BLOOD,
      rarity: CardRarity.RARE,
      stats: {
        attack: 4,
        health: 5,
        cost: 4
      },
      effects: [{
        id: 'BLOOD_3_EFFECT_1',
        type: EffectType.NETHER_EMPOWER,
        value: 0,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      }]
    });

    // NETHER Cards
    this.cardTypes.set('NETHER_1', {
      id: 'NETHER_1',
      name: 'Netherblade Warrior',
      description: 'Gains 2 attack and 2 health when blood moon is active',
      type: CardType.NETHER,
      rarity: CardRarity.COMMON,
      stats: {
        attack: 2,
        health: 3,
        cost: 2
      },
      effects: [{
        id: 'NETHER_1_EFFECT_1',
        type: EffectType.NETHER_EMPOWER,
        value: 2,
        trigger: EffectTrigger.ON_BLOOD_MOON,
        duration: 1
      }]
    });

    this.cardTypes.set('NETHER_2', {
      id: 'NETHER_2',
      name: 'Soul Harvester',
      description: 'Deals 2 damage and gains 1 blood moon charge for each enemy killed',
      type: CardType.NETHER,
      rarity: CardRarity.COMMON,
      stats: {
        attack: 3,
        health: 4,
        cost: 3
      },
      effects: [{
        id: 'NETHER_2_EFFECT_1',
        type: EffectType.SOUL_HARVEST,
        value: 1,
        trigger: EffectTrigger.ON_DEATH,
        duration: 0
      }]
    });

    this.cardTypes.set('NETHER_3', {
      id: 'NETHER_3',
      name: 'Netherblade: War of the Damned',
      description: 'Legendary card that transforms the battlefield and empowers all void cards',
      type: CardType.NETHER,
      rarity: CardRarity.LEGENDARY,
      stats: {
        attack: 5,
        health: 6,
        cost: 5
      },
      effects: [{
        id: 'NETHER_3_EFFECT_1',
        type: EffectType.NETHER_EMPOWER,
        value: 3,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      },
      {
        id: 'NETHER_3_EFFECT_2',
        type: EffectType.VOID_DAMAGE,
        value: 4,
        trigger: EffectTrigger.ON_BLOOD_MOON,
        duration: 0
      }]
    });

    // Additional VOID Cards
    this.cardTypes.set('VOID_4', {
      id: 'VOID_4',
      name: 'Void Walker',
      description: 'Can move to any position on the battlefield',
      type: CardType.VOID,
      rarity: CardRarity.RARE,
      stats: {
        attack: 2,
        health: 2,
        cost: 2
      },
      effects: [{
        id: 'VOID_4_EFFECT_1',
        type: EffectType.SHADOW_STEP,
        value: 1,
        trigger: EffectTrigger.ON_TURN_START,
        duration: 1
      }]
    });

    this.cardTypes.set('VOID_5', {
      id: 'VOID_5',
      name: 'Void Archon',
      description: 'Empowers all void creatures with +1/+1',
      type: CardType.VOID,
      rarity: CardRarity.RARE,
      stats: {
        attack: 3,
        health: 4,
        cost: 4
      },
      effects: [{
        id: 'VOID_5_EFFECT_1',
        type: EffectType.NETHER_EMPOWER,
        value: 1,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      }]
    });

    // Additional BLOOD Cards
    this.cardTypes.set('BLOOD_4', {
      id: 'BLOOD_4',
      name: 'Blood Seeker',
      description: 'Deals 2 damage to target and heals for the same amount',
      type: CardType.BLOOD,
      rarity: CardRarity.COMMON,
      stats: {
        attack: 2,
        health: 3,
        cost: 2
      },
      effects: [{
        id: 'BLOOD_4_EFFECT_1',
        type: EffectType.BLOOD_DRAIN,
        value: 2,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      }]
    });

    this.cardTypes.set('BLOOD_5', {
      id: 'BLOOD_5',
      name: 'Blood Moon Archon',
      description: 'Grants all blood creatures +1 attack during blood moon',
      type: CardType.BLOOD,
      rarity: CardRarity.RARE,
      stats: {
        attack: 4,
        health: 5,
        cost: 4
      },
      effects: [{
        id: 'BLOOD_5_EFFECT_1',
        type: EffectType.NETHER_EMPOWER,
        value: 1,
        trigger: EffectTrigger.ON_BLOOD_MOON,
        duration: 1
      }]
    });

    // Additional NETHER Cards
    this.cardTypes.set('NETHER_4', {
      id: 'NETHER_4',
      name: 'Nether Wraith',
      description: 'Can attack twice if blood moon is active',
      type: CardType.NETHER,
      rarity: CardRarity.RARE,
      stats: {
        attack: 3,
        health: 3,
        cost: 3
      },
      effects: [{
        id: 'NETHER_4_EFFECT_1',
        type: EffectType.SHADOW_STEP,
        value: 1,
        trigger: EffectTrigger.ON_BLOOD_MOON,
        duration: 1
      }]
    });

    this.cardTypes.set('NETHER_5', {
      id: 'NETHER_5',
      name: 'Nether Lord',
      description: 'Transforms all nether creatures into their empowered form',
      type: CardType.NETHER,
      rarity: CardRarity.LEGENDARY,
      stats: {
        attack: 5,
        health: 6,
        cost: 5
      },
      effects: [{
        id: 'NETHER_5_EFFECT_1',
        type: EffectType.NETHER_EMPOWER,
        value: 2,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      },
      {
        id: 'NETHER_5_EFFECT_2',
        type: EffectType.VOID_DAMAGE,
        value: 3,
        trigger: EffectTrigger.ON_BLOOD_MOON,
        duration: 0
      }]
    });

    // More VOID Cards
    this.cardTypes.set('VOID_6', {
      id: 'VOID_6',
      name: 'Void Assassin',
      description: 'Deals 3 damage to target and gains stealth for 1 turn',
      type: CardType.VOID,
      rarity: CardRarity.RARE,
      stats: {
        attack: 2,
        health: 2,
        cost: 2
      },
      effects: [{
        id: 'VOID_6_EFFECT_1',
        type: EffectType.VOID_DAMAGE,
        value: 3,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      },
      {
        id: 'VOID_6_EFFECT_2',
        type: EffectType.SHADOW_STEP,
        value: 1,
        trigger: EffectTrigger.ON_PLAY,
        duration: 1
      }]
    });

    this.cardTypes.set('VOID_7', {
      id: 'VOID_7',
      name: 'Void Titan',
      description: 'Massive creature that deals area damage when played',
      type: CardType.VOID,
      rarity: CardRarity.LEGENDARY,
      stats: {
        attack: 6,
        health: 8,
        cost: 7
      },
      effects: [{
        id: 'VOID_7_EFFECT_1',
        type: EffectType.VOID_DAMAGE,
        value: 4,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      },
      {
        id: 'VOID_7_EFFECT_2',
        type: EffectType.NETHER_EMPOWER,
        value: 1,
        trigger: EffectTrigger.ON_BLOOD_MOON,
        duration: 1
      }]
    });

    // More BLOOD Cards
    this.cardTypes.set('BLOOD_6', {
      id: 'BLOOD_6',
      name: 'Blood Ritualist',
      description: 'Sacrifices health to deal massive damage',
      type: CardType.BLOOD,
      rarity: CardRarity.RARE,
      stats: {
        attack: 3,
        health: 4,
        cost: 3
      },
      effects: [{
        id: 'BLOOD_6_EFFECT_1',
        type: EffectType.BLOOD_DRAIN,
        value: 5,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      }]
    });

    this.cardTypes.set('BLOOD_7', {
      id: 'BLOOD_7',
      name: 'Blood Moon Sovereign',
      description: 'Legendary ruler of the blood moon, transforming the battlefield',
      type: CardType.BLOOD,
      rarity: CardRarity.LEGENDARY,
      stats: {
        attack: 7,
        health: 7,
        cost: 8
      },
      effects: [{
        id: 'BLOOD_7_EFFECT_1',
        type: EffectType.NETHER_EMPOWER,
        value: 2,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      },
      {
        id: 'BLOOD_7_EFFECT_2',
        type: EffectType.BLOOD_DRAIN,
        value: 4,
        trigger: EffectTrigger.ON_BLOOD_MOON,
        duration: 0
      }]
    });

    // More NETHER Cards
    this.cardTypes.set('NETHER_6', {
      id: 'NETHER_6',
      name: 'Nether Phantom',
      description: 'Can attack from any position and gains power during blood moon',
      type: CardType.NETHER,
      rarity: CardRarity.RARE,
      stats: {
        attack: 3,
        health: 3,
        cost: 3
      },
      effects: [{
        id: 'NETHER_6_EFFECT_1',
        type: EffectType.SHADOW_STEP,
        value: 1,
        trigger: EffectTrigger.ON_TURN_START,
        duration: 1
      },
      {
        id: 'NETHER_6_EFFECT_2',
        type: EffectType.NETHER_EMPOWER,
        value: 2,
        trigger: EffectTrigger.ON_BLOOD_MOON,
        duration: 1
      }]
    });

    this.cardTypes.set('NETHER_7', {
      id: 'NETHER_7',
      name: 'Nether Overlord',
      description: 'Ultimate nether creature that dominates the battlefield',
      type: CardType.NETHER,
      rarity: CardRarity.LEGENDARY,
      stats: {
        attack: 8,
        health: 8,
        cost: 9
      },
      effects: [{
        id: 'NETHER_7_EFFECT_1',
        type: EffectType.NETHER_EMPOWER,
        value: 3,
        trigger: EffectTrigger.ON_PLAY,
        duration: 0
      },
      {
        id: 'NETHER_7_EFFECT_2',
        type: EffectType.VOID_DAMAGE,
        value: 5,
        trigger: EffectTrigger.ON_BLOOD_MOON,
        duration: 0
      },
      {
        id: 'NETHER_7_EFFECT_3',
        type: EffectType.SHADOW_STEP,
        value: 1,
        trigger: EffectTrigger.ON_TURN_START,
        duration: 1
      }]
    });
  }

  private initializeDecks(): void {
    // Create an optimized deck with strategic card combinations
    const optimizedDeck: CardInstance[] = [];
    
    // Early game control (1-2 cost cards)
    // 2x Void Walker for early board control and positioning
    optimizedDeck.push(this.createCard('VOID_4'));
    optimizedDeck.push(this.createCard('VOID_4'));
    
    // 2x Blood Seeker for early life gain and damage
    optimizedDeck.push(this.createCard('BLOOD_4'));
    optimizedDeck.push(this.createCard('BLOOD_4'));
    
    // Mid game threats (3-4 cost cards)
    // 2x Nether Wraith for blood moon synergy
    optimizedDeck.push(this.createCard('NETHER_4'));
    optimizedDeck.push(this.createCard('NETHER_4'));
    
    // 2x Void Archon for team buffs
    optimizedDeck.push(this.createCard('VOID_5'));
    optimizedDeck.push(this.createCard('VOID_5'));
    
    // 2x Blood Moon Archon for blood moon power spike
    optimizedDeck.push(this.createCard('BLOOD_5'));
    optimizedDeck.push(this.createCard('BLOOD_5'));
    
    // Late game power (5+ cost cards)
    // Legendary cards - one copy each
    optimizedDeck.push(this.createCard('VOID_7')); // Void Titan
    optimizedDeck.push(this.createCard('BLOOD_7')); // Blood Moon Sovereign
    optimizedDeck.push(this.createCard('NETHER_7')); // Nether Overlord
    
    // Support cards
    // 2x Nether Phantom for flexible positioning
    optimizedDeck.push(this.createCard('NETHER_6'));
    optimizedDeck.push(this.createCard('NETHER_6'));
    
    // 2x Blood Ritualist for burst damage
    optimizedDeck.push(this.createCard('BLOOD_6'));
    optimizedDeck.push(this.createCard('BLOOD_6'));
    
    // 2x Void Assassin for removal
    optimizedDeck.push(this.createCard('VOID_6'));
    optimizedDeck.push(this.createCard('VOID_6'));

    this.decks.set('optimized', optimizedDeck);
  }

  public createCard(typeId: string): CardInstance {
    const cardType = this.cardTypes.get(typeId);
    if (!cardType) {
      throw new Error(`Card type ${typeId} not found`);
    }

    return {
      ...cardType,
      id: crypto.randomUUID(),
      id_name : cardType.id,
      name: cardType.name,
      currentHealth: cardType.stats.health,
      currentAttack: cardType.stats.attack,
      bloodMoonCharge: 0,
      isTransformed: false,
      effects: cardType.effects.map(effect => ({
        ...effect,
        id: crypto.randomUUID()
      }))
    };
  }

  public getDeck(deckId: string): CardInstance[] {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error(`Deck ${deckId} not found`);
    }
    return [...deck];
  }

  public getCardType(typeId: string): CardTypeDefinition {
    const cardType = this.cardTypes.get(typeId);
    if (!cardType) {
      throw new Error(`Card type ${typeId} not found`);
    }
    return cardType;
  }

  public getAllCardTypes(): CardTypeDefinition[] {
    return Array.from(this.cardTypes.values());
  }

  public createDeck(): CardInstance[] {
    // Create a basic deck with 2 copies of each common card and 1 copy of each rare card
    const deck: CardInstance[] = [];
    
    // Add common cards (2 copies each)
    for (let i = 1; i <= 2; i++) {
      deck.push(this.createCard('VOID_1'));
      deck.push(this.createCard('VOID_2'));
      deck.push(this.createCard('BLOOD_1'));
      deck.push(this.createCard('BLOOD_2'));
      deck.push(this.createCard('NETHER_1'));
      deck.push(this.createCard('NETHER_2'));
    }
    
    // Add rare cards (1 copy each)
    deck.push(this.createCard('VOID_3'));
    deck.push(this.createCard('BLOOD_3'));
    deck.push(this.createCard('NETHER_3'));

    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }
} 