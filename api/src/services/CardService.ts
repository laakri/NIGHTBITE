import { CardType, Phase, EffectType } from '../models/Card';
import type { Card } from './../models/Card';
import { v4 as uuidv4 } from 'uuid';
// Sample cards for the game
const sunCards: Card[] = [
  {
    id: uuidv4(),
    name: 'Solar Flare',
    type: CardType.SUN,
    description: 'Deal 5 damage. If in Day phase, deal 7 damage instead.',
    damage: 5,
    healing: 0,
    effects: []
  },
  {
    id: uuidv4(),
    name: 'Burning Ray',
    type: CardType.SUN,
    description: 'Deal 4 damage. If in Day phase, deal 2 damage to yourself.',
    damage: 4,
    healing: 0,
    effects: [{ type: EffectType.SELF_DAMAGE, value: 2 }]
  },
  // Add more sun cards
];

const nightCards: Card[] = [
  {
    id: uuidv4(),
    name: 'Moonlight Healing',
    type: CardType.NIGHT,
    description: 'Heal 3 HP. If in Night phase, heal 5 HP instead.',
    damage: 0,
    healing: 3,
    effects: []
  },
  {
    id: uuidv4(),
    name: 'Shadow Strike',
    type: CardType.NIGHT,
    description: 'Deal 3 damage. If in Night phase, heal 2 HP.',
    damage: 3,
    healing: 0,
    effects: []
  },
  // Add more night cards
];

const eclipseCards: Card[] = [
  {
    id: uuidv4(),
    name: 'Phase Shift',
    type: CardType.ECLIPSE,
    description: 'Switch the current phase.',
    damage: 0,
    healing: 0,
    effects: [{ type: EffectType.SWITCH_PHASE }]
  },
  {
    id: uuidv4(),
    name: 'Total Eclipse',
    type: CardType.ECLIPSE,
    description: 'Deal 3 damage and switch the current phase.',
    damage: 3,
    healing: 0,
    effects: [{ type: EffectType.SWITCH_PHASE }]
  },
  // Add more eclipse cards
];

export class CardService {
  // Get all cards
  getAllCards(): Card[] {
    return [...sunCards, ...nightCards, ...eclipseCards];
  }

  // Get cards by type
  getCardsByType(type: CardType): Card[] {
    switch (type) {
      case CardType.SUN:
        return sunCards;
      case CardType.NIGHT:
        return nightCards;
      case CardType.ECLIPSE:
        return eclipseCards;
    }
  }

  // Create a random deck of 20 cards
  createDeck(): Card[] {
    const allCards = this.getAllCards();
    const deck: Card[] = [];
    
    // Create a copy of each card to avoid reference issues
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * allCards.length);
      const cardCopy = { ...allCards[randomIndex], id: uuidv4() };
      deck.push(cardCopy);
    }
    
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
} 