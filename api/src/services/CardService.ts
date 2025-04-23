import type { Card, CardStats } from '../models/Card';
import { CardType, CardRarity, Phase } from '../models/Card';
import { EffectType, EffectTrigger } from '../models/Effect';
import type { Effect } from '../models/Effect';
import { VOID_CARDS } from '../cards/VoidCards';
import { NORMAL_CARDS } from '../cards/NormalCards';
import { BLOOD_MOON_CARDS } from '../cards/BloodMoonCards';
import crypto from 'crypto';

interface CardTypeDefinition {
  id: string;
  name: string;
  description: string;
  type: CardType;
  rarity: CardRarity;
  stats: CardStats;
  effects: Effect[];
  flavorText?: string;
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
    // Load Void Cards
    Object.entries(VOID_CARDS).forEach(([key, card]) => {
      this.cardTypes.set(key, card);
    });

    // Load Normal Cards
    Object.entries(NORMAL_CARDS).forEach(([key, card]) => {
      this.cardTypes.set(key, card);
    });

    // Load Blood Moon Cards
    Object.entries(BLOOD_MOON_CARDS).forEach(([key, card]) => {
      this.cardTypes.set(key, card);
    });
  }

  private initializeDecks(): void {
    // Create a Void-focused deck
    const voidDeck: CardInstance[] = [];
    
    // Add common Void cards (2 copies each)
    voidDeck.push(this.createCard('VOID_WISP'));
    voidDeck.push(this.createCard('VOID_WISP'));
    voidDeck.push(this.createCard('SHADOW_PROWLER'));
    voidDeck.push(this.createCard('SHADOW_PROWLER'));
    voidDeck.push(this.createCard('VOID_SIPHON'));
    voidDeck.push(this.createCard('VOID_SIPHON'));
    voidDeck.push(this.createCard('NETHER_SCOUT'));
    voidDeck.push(this.createCard('NETHER_SCOUT'));
    voidDeck.push(this.createCard('SHADOW_SHIFTER'));
    voidDeck.push(this.createCard('SHADOW_SHIFTER'));
    
    // Add rare Void cards (1-2 copies each)
    voidDeck.push(this.createCard('VOID_DEVOURER'));
    voidDeck.push(this.createCard('RIFT_STALKER'));
    voidDeck.push(this.createCard('RIFT_STALKER'));
    voidDeck.push(this.createCard('VOID_WEAVER'));
    voidDeck.push(this.createCard('SHADOW_ASSASSIN'));
    voidDeck.push(this.createCard('NETHER_MANIPULATOR'));
    
    // Add epic Void cards (1 copy each)
    voidDeck.push(this.createCard('VOID_TRICKSTER'));
    voidDeck.push(this.createCard('SHADOW_SOVEREIGN'));
    voidDeck.push(this.createCard('VOID_HARBINGER'));
    voidDeck.push(this.createCard('ECHO_OF_NOTHING'));
    
    // Add legendary Void card (1 copy)
    voidDeck.push(this.createCard('VOID_SINGULARITY'));

    this.decks.set('void', voidDeck);

    // Create a Normal-focused deck
    const normalDeck: CardInstance[] = [];
    
    // Add common Normal cards (2 copies each)
    normalDeck.push(this.createCard('IRONCLAD_DEFENDER'));
    normalDeck.push(this.createCard('IRONCLAD_DEFENDER'));
    normalDeck.push(this.createCard('BATTLE_TACTICIAN'));
    normalDeck.push(this.createCard('BATTLE_TACTICIAN'));
    normalDeck.push(this.createCard('ARCANE_SCHOLAR'));
    normalDeck.push(this.createCard('ARCANE_SCHOLAR'));
    normalDeck.push(this.createCard('FROST_CHANNELER'));
    normalDeck.push(this.createCard('FROST_CHANNELER'));
    normalDeck.push(this.createCard('SHADOW_INFILTRATOR'));
    normalDeck.push(this.createCard('SHADOW_INFILTRATOR'));
    
    // Add rare Normal cards (1-2 copies each)
    normalDeck.push(this.createCard('LEGION_COMMANDER'));
    normalDeck.push(this.createCard('BERSERKER_CHAMPION'));
    normalDeck.push(this.createCard('BERSERKER_CHAMPION'));
    normalDeck.push(this.createCard('ARCHMAGE_LUMINAR'));
    normalDeck.push(this.createCard('CRYSTAL_ARTIFICER'));
    normalDeck.push(this.createCard('ROYAL_EXECUTIONER'));
    
    // Add epic Normal cards (1 copy each)
    normalDeck.push(this.createCard('WARLORD_KRAXIS'));
    normalDeck.push(this.createCard('SHIELDMAIDEN_VALKYRIE'));
    normalDeck.push(this.createCard('ARCANE_SINGULARITY'));
    normalDeck.push(this.createCard('CHRONOMANCER'));
    
    // Add legendary Normal card (1 copy)
    normalDeck.push(this.createCard('GENERAL_MAGNUS'));

    this.decks.set('normal', normalDeck);

    // Create a Blood Moon-focused deck
    const bloodMoonDeck: CardInstance[] = [];
    
    // Add rare Blood Moon cards (2 copies each)
    bloodMoonDeck.push(this.createCard('CRIMSON_HARVESTER'));
    bloodMoonDeck.push(this.createCard('CRIMSON_HARVESTER'));
    bloodMoonDeck.push(this.createCard('VEINSTALKER'));
    bloodMoonDeck.push(this.createCard('VEINSTALKER'));
    
    // Add epic Blood Moon cards (1-2 copies each)
    bloodMoonDeck.push(this.createCard('HEMOMANCER'));
    bloodMoonDeck.push(this.createCard('ARTERIAL_CONSTRUCT'));
    bloodMoonDeck.push(this.createCard('ARTERIAL_CONSTRUCT'));
    bloodMoonDeck.push(this.createCard('SANGUINE_PUPPETEER'));
    bloodMoonDeck.push(this.createCard('SANGUINE_PUPPETEER'));
    
    // Add legendary Blood Moon cards (1 copy each)
    bloodMoonDeck.push(this.createCard('CRIMSON_MATRIARCH'));
    bloodMoonDeck.push(this.createCard('HEARTDRINKER_PRINCE'));
    bloodMoonDeck.push(this.createCard('BLOOD_REALITY'));
    
    // Add mythic Blood Moon card (1 copy)
    bloodMoonDeck.push(this.createCard('HEMORRHAGE_ENTITY'));

    this.decks.set('bloodMoon', bloodMoonDeck);
  }

  public createCard(typeId: string): CardInstance {
    const cardType = this.cardTypes.get(typeId);
    if (!cardType) {
      throw new Error(`Card type ${typeId} not found`);
    }

    return {
      ...cardType,
      id: crypto.randomUUID(),
      id_name: cardType.id,
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
    // Create a balanced deck with cards from all types
    const deck: CardInstance[] = [];
    
    // Add some Void cards
    deck.push(this.createCard('VOID_WISP'));
    deck.push(this.createCard('SHADOW_PROWLER'));
    deck.push(this.createCard('VOID_SIPHON'));
    deck.push(this.createCard('VOID_DEVOURER'));
    deck.push(this.createCard('RIFT_STALKER'));
    deck.push(this.createCard('VOID_TRICKSTER'));
    
    // Add some Normal cards
    deck.push(this.createCard('IRONCLAD_DEFENDER'));
    deck.push(this.createCard('BATTLE_TACTICIAN'));
    deck.push(this.createCard('ARCANE_SCHOLAR'));
    deck.push(this.createCard('FROST_CHANNELER'));
    deck.push(this.createCard('LEGION_COMMANDER'));
    deck.push(this.createCard('WARLORD_KRAXIS'));
    
    // Add some Blood Moon cards
    deck.push(this.createCard('CRIMSON_HARVESTER'));
    deck.push(this.createCard('VEINSTALKER'));
    deck.push(this.createCard('HEMOMANCER'));
    deck.push(this.createCard('ARTERIAL_CONSTRUCT'));
    deck.push(this.createCard('CRIMSON_MATRIARCH'));
    
    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }
} 