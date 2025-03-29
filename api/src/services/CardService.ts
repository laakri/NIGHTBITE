import { CardType, Phase, EffectType } from '../models/Card';
import type { Card } from './../models/Card';
import { v4 as uuidv4 } from 'uuid';
import { CardRarity } from '../models/Card';


export class CardService {
  // Get all cards
  getAllCards(): Card[] {
    return [...this.getNormalCards(), ...this.getEpicCards(), ...this.getLegendaryCards(), ...this.getSecretCards()];
  }

  // Get cards by type
  getCardsByType(type: CardType): Card[] {
    const allCards = this.getAllCards();
    return allCards.filter(card => card.type === type);
  }

  // Create a deck of cards for a player
  createDeck(): Card[] {
    const deck: Card[] = [];
    
    // Add normal cards (12 copies total)
    this.getNormalCards().forEach(card => {
      // Add 3 copies of each normal card
      for (let i = 0; i < 3; i++) {
        deck.push({...card, id: uuidv4()});
      }
    });
    
    // Add epic cards (6 copies total)
    this.getEpicCards().forEach(card => {
      // Add 2 copies of each epic card
      for (let i = 0; i < 2; i++) {
        deck.push({...card, id: uuidv4()});
      }
    });
    
    // Add legendary cards (2 copies total)
    this.getLegendaryCards().forEach(card => {
      // Add 1 copy of each legendary card
      deck.push({...card, id: uuidv4()});
    });
    
    // Add secret cards
    this.getSecretCards().forEach(card => {
      deck.push({...card, id: uuidv4()});
    });
    
    // Shuffle the deck
    return this.shuffleDeck(deck);
  }
  
  // Shuffle a deck of cards
  shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Get all normal cards
  private getNormalCards(): Card[] {
    return [
      // Sun Cards
      {
        id: '',
        name: 'Sunbeam',
        type: CardType.SUN,
        rarity: CardRarity.NORMAL,
        cost: 1,
        damage: 3,
        healing: 0,
        effects: [],
        description: 'Deal 3 damage. During Day: Deal 4 damage instead.'
      },
      {
        id: '',
        name: 'Solar Shield',
        type: CardType.SUN,
        rarity: CardRarity.NORMAL,
        cost: 1,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.SHIELD, value: 2 }
        ],
        description: 'Reduce next damage taken by 2. During Day: Reduce by 3 instead.'
      },
      {
        id: '',
        name: 'Radiant Strike',
        type: CardType.SUN,
        rarity: CardRarity.NORMAL,
        cost: 2,
        damage: 4,
        healing: 0,
        effects: [
          { type: EffectType.REVEAL_HAND }
        ],
        description: 'Deal 4 damage. During Day: Also reveal opponent\'s hand.'
      },
      {
        id: '',
        name: 'Dawn Blessing',
        type: CardType.SUN,
        rarity: CardRarity.NORMAL,
        cost: 2,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.DRAW, value: 1 }
        ],
        description: 'Draw a card. During Day: Draw 2 cards instead.'
      },
      
      // Moon Cards
      {
        id: '',
        name: 'Moonlight',
        type: CardType.MOON,
        rarity: CardRarity.NORMAL,
        cost: 1,
        damage: 0,
        healing: 3,
        effects: [],
        description: 'Heal 3 HP. During Night: Heal 4 HP instead.'
      },
      {
        id: '',
        name: 'Shadow Veil',
        type: CardType.MOON,
        rarity: CardRarity.NORMAL,
        cost: 1,
        damage: 0,
        healing: 0,
        effects: [],
        description: 'Opponent\'s next card deals 2 less damage. During Night: 3 less damage.'
      },
      {
        id: '',
        name: 'Crescent Strike',
        type: CardType.MOON,
        rarity: CardRarity.NORMAL,
        cost: 2,
        damage: 3,
        healing: 0,
        effects: [
          { type: EffectType.DISCARD, value: 1 }
        ],
        description: 'Deal 3 damage. During Night: Also force opponent to discard a random card.'
      },
      {
        id: '',
        name: 'Dusk Meditation',
        type: CardType.MOON,
        rarity: CardRarity.NORMAL,
        cost: 2,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.DRAW, value: 1 }
        ],
        description: 'Look at top 3 cards of your deck and rearrange them. During Night: Draw one of them.'
      },
      
      // Eclipse Cards
      {
        id: '',
        name: 'Phase Shift',
        type: CardType.ECLIPSE,
        rarity: CardRarity.NORMAL,
        cost: 2,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.SWITCH_PHASE }
        ],
        description: 'Change to the opposite phase.'
      },
      {
        id: '',
        name: 'Twilight Balance',
        type: CardType.ECLIPSE,
        rarity: CardRarity.NORMAL,
        cost: 2,
        damage: 2,
        healing: 2,
        effects: [],
        description: 'Deal 2 damage and heal 2 HP.'
      },
      {
        id: '',
        name: 'Astral Sight',
        type: CardType.ECLIPSE,
        rarity: CardRarity.NORMAL,
        cost: 1,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.REVEAL_HAND }
        ],
        description: 'Reveal opponent\'s hand.'
      },
      {
        id: '',
        name: 'Cosmic Draw',
        type: CardType.ECLIPSE,
        rarity: CardRarity.NORMAL,
        cost: 2,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.DRAW, value: 1 }
        ],
        description: 'Draw a card. If you have both Sun and Moon cards in hand, draw another.'
      },
      
      // Zero-cost Sun card
      {
        id: '',
        name: 'Solar Spark',
        type: CardType.SUN,
        rarity: CardRarity.NORMAL,
        cost: 0,
        damage: 1,
        healing: 0,
        effects: [],
        description: 'Deal 1 damage. During Day: Deal 2 damage instead.'
      },
      
      // Zero-cost Moon card
      {
        id: '',
        name: 'Moonlight Whisper',
        type: CardType.MOON,
        rarity: CardRarity.NORMAL,
        cost: 0,
        damage: 0,
        healing: 1,
        effects: [],
        description: 'Heal 1 HP. During Night: Heal 2 HP instead.'
      },
      
      // Zero-cost Eclipse card
      {
        id: '',
        name: 'Cosmic Insight',
        type: CardType.ECLIPSE,
        rarity: CardRarity.NORMAL,
        cost: 0,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.DRAW, value: 1 }
        ],
        description: 'Look at the top card of your deck. You may draw it or put it back.'
      }
    ];
  }
  
  // Get all epic cards
  private getEpicCards(): Card[] {
    return [
      // Sun Epic Cards
      {
        id: '',
        name: 'Solar Flare',
        type: CardType.SUN,
        rarity: CardRarity.EPIC,
        cost: 3,
        damage: 5,
        healing: 0,
        effects: [],
        description: 'Deal 5 damage. If you played a Moon card last turn, deal 7 damage instead.'
      },
      {
        id: '',
        name: 'Phoenix Rebirth',
        type: CardType.SUN,
        rarity: CardRarity.EPIC,
        cost: 3,
        damage: 5,
        healing: 5,
        effects: [],
        description: 'If you have 5 or less HP, heal 5 HP and deal 5 damage.'
      },
      {
        id: '',
        name: 'Daybreak Combo',
        type: CardType.SUN,
        rarity: CardRarity.EPIC,
        cost: 3,
        damage: 3,
        healing: 0,
        effects: [],
        description: 'Deal 3 damage. If you played a Sun card last turn, deal 3 more damage.'
      },
      
      // Moon Epic Cards
      {
        id: '',
        name: 'Lunar Echo',
        type: CardType.MOON,
        rarity: CardRarity.EPIC,
        cost: 3,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.COPY_EFFECT }
        ],
        description: 'Copy the effect of the last card you played.'
      },
      {
        id: '',
        name: 'Nightmare Weaver',
        type: CardType.MOON,
        rarity: CardRarity.EPIC,
        cost: 3,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.DISCARD, value: 2 }
        ],
        description: 'Opponent discards 2 cards. If it\'s Night, they also take damage equal to their discarded cards\' cost.'
      },
      {
        id: '',
        name: 'Twilight Healing',
        type: CardType.MOON,
        rarity: CardRarity.EPIC,
        cost: 3,
        damage: 0,
        healing: 3,
        effects: [],
        description: 'Heal 3 HP. If you played a Sun card last turn, heal 3 more HP.'
      },
      
      // Eclipse Epic Cards
      {
        id: '',
        name: 'Dimensional Shift',
        type: CardType.ECLIPSE,
        rarity: CardRarity.EPIC,
        cost: 4,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.STEAL_CARD }
        ],
        description: 'Swap a random card in your hand with one in your opponent\'s hand.'
      },
      {
        id: '',
        name: 'Celestial Alignment',
        type: CardType.ECLIPSE,
        rarity: CardRarity.EPIC,
        cost: 4,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.PHASE_LOCK, duration: 2 }
        ],
        description: 'The phase won\'t change for 2 turns.'
      },
      {
        id: '',
        name: 'Fate\'s Hand',
        type: CardType.ECLIPSE,
        rarity: CardRarity.EPIC,
        cost: 3,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.DRAW, value: 1 }
        ],
        description: 'Discover 3 random cards from your deck. Add one to your hand.'
      }
    ];
  }
  
  // Get all legendary cards
  private getLegendaryCards(): Card[] {
    return [
      // Sun Legendary Cards
      {
        id: '',
        name: 'Solar Eclipse',
        type: CardType.SUN,
        rarity: CardRarity.LEGENDARY,
        cost: 5,
        damage: 0, // Special damage calculation
        healing: 0,
        effects: [
          { type: EffectType.SWITCH_PHASE }
        ],
        description: 'Deal damage equal to your hand size. All Sun and Moon cards in play activate their effects again.'
      },
      {
        id: '',
        name: 'Sun\'s Judgment',
        type: CardType.SUN,
        rarity: CardRarity.LEGENDARY,
        cost: 5,
        damage: 0, // Special damage calculation
        healing: 0,
        effects: [],
        description: 'Deal damage equal to your missing HP (max 10).'
      },
      
      // Moon Legendary Cards
      {
        id: '',
        name: 'Lunar Eclipse',
        type: CardType.MOON,
        rarity: CardRarity.LEGENDARY,
        cost: 5,
        damage: 0,
        healing: 0, // Special healing calculation
        effects: [
          { type: EffectType.SWITCH_PHASE },
          { type: EffectType.STEAL_CARD }
        ],
        description: 'Heal HP equal to your hand size. Steal a card from your opponent\'s hand.'
      },
      {
        id: '',
        name: 'Moon\'s Embrace',
        type: CardType.MOON,
        rarity: CardRarity.LEGENDARY,
        cost: 5,
        damage: 0,
        healing: 0, // Special healing calculation
        effects: [
          { type: EffectType.DRAW, value: 1 } // Special draw calculation
        ],
        description: 'Restore all HP lost this turn, then draw cards equal to HP restored.'
      },
      
      // Eclipse Legendary Cards
      {
        id: '',
        name: 'Eternal Twilight',
        type: CardType.ECLIPSE,
        rarity: CardRarity.LEGENDARY,
        cost: 6,
        damage: 0,
        healing: 0,
        effects: [
          { type: EffectType.PHASE_LOCK, duration: 3 },
          { type: EffectType.REDUCE_COST, value: 1, duration: 3 }
        ],
        description: 'For 3 turns, all cards cost 1 less and can be played during any phase without penalty. Opponent\'s HP is hidden.'
      },
      {
        id: '',
        name: 'Cosmic Balance',
        type: CardType.ECLIPSE,
        rarity: CardRarity.LEGENDARY,
        cost: 6,
        damage: 0,
        healing: 0,
        effects: [],
        description: 'Set both players\' HP to the average of their current HP. The loser of the next turn gets a free Legendary card.'
      }
    ];
  }
  
  // Get all secret cards
  private getSecretCards(): Card[] {
    return [
      {
        id: '',
        name: 'Solar Trap',
        type: CardType.SUN,
        rarity: CardRarity.EPIC,
        cost: 2,
        damage: 3,
        healing: 0,
        effects: [],
        description: 'Play face-down. When opponent plays a Moon card, cancel its effect and deal 3 damage.',
        isSecret: true,
        secretTrigger: 'OPPONENT_PLAYS_MOON'
      },
      {
        id: '',
        name: 'Lunar Counter',
        type: CardType.MOON,
        rarity: CardRarity.EPIC,
        cost: 2,
        damage: 0,
        healing: 0,
        effects: [],
        description: 'Play face-down. When opponent plays a Sun card, reduce its damage to 1.',
        isSecret: true,
        secretTrigger: 'OPPONENT_PLAYS_SUN'
      },
      {
        id: '',
        name: 'Eclipse Gambit',
        type: CardType.ECLIPSE,
        rarity: CardRarity.EPIC,
        cost: 3,
        damage: 5,
        healing: 0,
        effects: [
          { type: EffectType.SWITCH_PHASE }
        ],
        description: 'Play face-down. After 2 turns, deal 5 damage and change the phase.',
        isSecret: true,
        delayedTurns: 2
      }
    ];
  }
  
  // Helper method to get a specific card by name
  getCardByName(name: string): Card | undefined {
    const allCards = [
      ...this.getNormalCards(),
      ...this.getEpicCards(),
      ...this.getLegendaryCards(),
      ...this.getSecretCards()
    ];
    
    return allCards.find(card => card.name === name);
  }
} 