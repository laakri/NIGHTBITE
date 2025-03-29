import {  createGame, type Game } from '../models/Game';
import type { Player } from '../models/Player';
import {  CardType, Phase, EffectType, type Card } from '../models/Card';
import { CardService } from './CardService';

export class GameService {
  private cardService: CardService;

  constructor() {
    this.cardService = new CardService();
  }

  // Initialize a new game
  initializeGame(players: Player[]): Game {
    // Create a new game
    const game = createGame(players);
    
    // Initialize player decks and draw initial hands
    for (const player of game.players) {
      player.deck = this.cardService.createDeck();
      this.drawCards(game, player, 5); // Draw 5 initial cards
    }
    
    return game;
  }

  // Draw cards for a player
  drawCards(game: Game, player: Player, count: number): Card[] {
    const drawnCards: Card[] = [];
    
    for (let i = 0; i < count; i++) {
      if (player.deck.length === 0) {
        // If deck is empty, shuffle discard pile back into deck
        if (player.discardPile.length > 0) {
          player.deck = this.cardService.shuffleDeck([...player.discardPile]);
          player.discardPile = [];
        } else {
          // No cards left to draw
          break;
        }
      }
      
      const card = player.deck.pop();
      if (card) {
        player.hand.push(card);
        drawnCards.push(card);
      }
    }
    
    return drawnCards;
  }

  // Play a card
  playCard(game: Game, playerId: string, cardId: string): Game {
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || playerIndex !== game.currentPlayerIndex) {
      throw new Error('Not your turn');
    }
    
    const player = game.players[playerIndex];
    const opponent = game.players[1 - playerIndex]; // In a 2-player game, the opponent is the other player
    
    // Find the card in the player's hand
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error('Card not found in hand');
    }
    
    const card = player.hand[cardIndex];
    
    // Remove the card from hand and add to discard pile
    player.hand.splice(cardIndex, 1);
    player.discardPile.push(card);
    
    // Apply card effects based on current phase
    let damage = card.damage;
    let healing = card.healing;
    
    // Apply phase bonuses
    if ((card.type === CardType.SUN && game.currentPhase === Phase.DAY) ||
        (card.type === CardType.NIGHT && game.currentPhase === Phase.NIGHT)) {
      // Cards are stronger in their corresponding phase
      damage = Math.floor(damage * 1.5);
      healing = Math.floor(healing * 1.5);
    }
    
    // Apply damage to opponent
    if (damage > 0) {
      opponent.hp -= damage;
    }
    
    // Apply healing to player
    if (healing > 0) {
      player.hp += healing;
      // Cap HP at 20
      if (player.hp > 20) {
        player.hp = 20;
      }
    }
    
    // Apply card effects
    for (const effect of card.effects) {
      switch (effect.type) {
        case EffectType.SWITCH_PHASE:
          game.currentPhase = game.currentPhase === Phase.DAY ? Phase.NIGHT : Phase.DAY;
          game.phaseChangeCounter = 0; // Reset phase change counter
          break;
        case EffectType.SELF_DAMAGE:
          if (effect.value) {
            player.hp -= effect.value;
          }
          break;
        case EffectType.DISCARD:
          if (effect.value && player.hand.length > 0) {
            const discardCount = Math.min(effect.value, player.hand.length);
            for (let i = 0; i < discardCount; i++) {
              const randomIndex = Math.floor(Math.random() * player.hand.length);
              const discardedCard = player.hand.splice(randomIndex, 1)[0];
              player.discardPile.push(discardedCard);
            }
          }
          break;
        case EffectType.DRAW:
          if (effect.value) {
            this.drawCards(game, player, effect.value);
          }
          break;
        // Implement other effects as needed
      }
    }
    
    // Check if the game is over
    if (opponent.hp <= 0) {
      game.winner = player;
      game.isGameOver = true;
      return game;
    }
    
    // Move to the next turn
    return this.nextTurn(game);
  }

  // Move to the next turn
  nextTurn(game: Game): Game {
    // Switch to the next player
    game.currentPlayerIndex = 1 - game.currentPlayerIndex;
    
    // If we've gone back to the first player, increment turn count
    if (game.currentPlayerIndex === 0) {
      game.turnCount++;
    }
    
    // Increment phase change counter
    game.phaseChangeCounter++;
    
    // Check if we need to switch phases (every 3 turns)
    if (game.phaseChangeCounter >= 3) {
      game.currentPhase = game.currentPhase === Phase.DAY ? Phase.NIGHT : Phase.DAY;
      game.phaseChangeCounter = 0;
    }
    
    // Draw a card for the new current player
    const currentPlayer = game.players[game.currentPlayerIndex];
    this.drawCards(game, currentPlayer, 1);
    
    return game;
  }

  // Get the current game state (for sending to clients)
  getGameState(game: Game, playerId: string): any {
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error('Player not found');
    }
    
    const player = game.players[playerIndex];
    const opponent = game.players[1 - playerIndex];
    
    // Return only the information that this player should see
    return {
      gameId: game.id,
      currentPhase: game.currentPhase,
      turnCount: game.turnCount,
      isYourTurn: game.currentPlayerIndex === playerIndex,
      player: {
        id: player.id,
        username: player.username,
        hp: player.hp,
        hand: player.hand,
        deckSize: player.deck.length,
        discardPileSize: player.discardPile.length
      },
      opponent: {
        id: opponent.id,
        username: opponent.username,
        hp: opponent.hp,
        handSize: opponent.hand.length,
        deckSize: opponent.deck.length,
        discardPileSize: opponent.discardPile.length
      },
      isGameOver: game.isGameOver,
      winner: game.winner ? {
        id: game.winner.id,
        username: game.winner.username
      } : null
    };
  }
}
