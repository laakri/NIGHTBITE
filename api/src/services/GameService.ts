import { createGame, type Game } from '../models/Game';
import type { Player } from '../models/Player';
import { CardType, Phase, EffectType, type Card, type Effect } from '../models/Card';
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
    const opponent = game.players[1 - playerIndex];
    
    // Check if player has enough energy
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error('Card not found in hand');
    }
    
    const card = player.hand[cardIndex];
    
    // Check for Overdrive (cards cost 1 less when below 5 HP)
    let cardCost = card.cost;
    if (player.hp <= 5) {
      player.inOverdrive = true;
      cardCost = Math.max(0, cardCost - 1);
      console.log(`${player.username} is in Overdrive! Card cost reduced to ${cardCost}`);
    }
    
    // Check hero power (Dawncaller: first Sun card costs 1 less)
    if (player.heroPower === 'Dawncaller' && 
        card.type === CardType.SUN && 
        !game.lastPlayedCards.some(c => c.playerId === player.id && c.turnPlayed === game.turnCount)) {
      cardCost = Math.max(0, cardCost - 1);
      console.log(`${player.username}'s Dawncaller power activates! Card cost reduced to ${cardCost}`);
    }
    
    console.log(`Player ${player.username} attempting to play card ${card.name} with cost ${cardCost}, has energy: ${player.energy}`);
    
    if (player.energy < cardCost) {
      throw new Error(`Not enough energy: need ${cardCost}, have ${player.energy}`);
    }
    
    // Spend energy
    player.energy -= cardCost;
    console.log(`${player.username} spent ${cardCost} energy, remaining: ${player.energy}`);
    
    // Remove the card from hand
    player.hand.splice(cardIndex, 1);
    
    // Add to last played cards
    game.lastPlayedCards.push({ 
      playerId: player.id, 
      cardId: card.id,
      turnPlayed: game.turnCount 
    });
    if (game.lastPlayedCards.length > 6) { // Keep track of last 6 cards (3 per player)
      game.lastPlayedCards.shift();
    }
    
    // Check for phase surge effects
    this.handlePhaseSurge(game, player, card);
    
    // Update momentum
    this.updateMomentum(game, player, card);
    
    // Apply card effects
    this.applyCardEffects(game, player, card);
    
    // Add to discard pile
    player.discardPile.push(card);
    
    // Check for secret card triggers
    this.checkSecretTriggers(game, card);
    
    return game;
  }

  // Move to the next turn
  nextTurn(game: Game): Game {
    // Switch to the next player
    game.currentPlayerIndex = 1 - game.currentPlayerIndex;
    
    // Increment turn count
    game.turnCount++;
    
    // Increment phase change counter
    game.phaseChangeCounter++;
    
    // Check if we need to switch phases (every 3 turns)
    if (game.phaseChangeCounter >= 3) {
      game.currentPhase = game.currentPhase === Phase.DAY ? Phase.NIGHT : Phase.DAY;
      game.phaseChangeCounter = 0;
      game.phaseJustChanged = true; // Set flag for phase surge
      console.log(`Phase changed to ${game.currentPhase}`);
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
        energy: player.energy,
        hand: player.hand,
        deckSize: player.deck.length,
        discardPileSize: player.discardPile.length
      },
      opponent: {
        id: opponent.id,
        username: opponent.username,
        hp: opponent.hp,
        energy: opponent.energy,
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

  // Handle phase surge effects
  private handlePhaseSurge(game: Game, player: Player, card: Card): void {
    if (!game.phaseJustChanged) return;
    
    // Apply surge effects based on card type and current phase
    if (card.type === CardType.SUN && game.currentPhase === Phase.DAY) {
      // Sun surge effect
      card.damage += 2; // Increase damage by 2
      console.log(`Sun Surge activated! ${card.name} gets +2 damage`);
    } 
    else if (card.type === CardType.MOON && game.currentPhase === Phase.NIGHT) {
      // Moon surge effect
      player.shields += 2; // Add 2 shields
      console.log(`Moon Surge activated! ${player.username} gets 2 shields`);
    }
    else if (card.type === CardType.ECLIPSE) {
      // Eclipse surge effect
      for (const p of game.players) {
        this.drawCards(game, p, 1);
      }
      console.log(`Eclipse Surge activated! All players draw a card`);
    }
    
    // Phase surge is consumed
    game.phaseJustChanged = false;
  }

  // Update momentum when a card is played
  private updateMomentum(game: Game, player: Player, card: Card): void {
    const momentum = game.playerMomentum[player.id];
    
    // Reset other types of momentum
    if (card.type === CardType.SUN) {
      momentum.moon = 0;
      momentum.eclipse = 0;
      momentum.sun++;
    } else if (card.type === CardType.MOON) {
      momentum.sun = 0;
      momentum.eclipse = 0;
      momentum.moon++;
    } else if (card.type === CardType.ECLIPSE) {
      momentum.sun = 0;
      momentum.moon = 0;
      momentum.eclipse++;
    }
    
    // Check for momentum effects
    if (momentum.sun >= 3) {
      // Apply Sun momentum effect (burn)
      const opponent = game.players.find(p => p.id !== player.id);
      if (opponent) {
        opponent.burnDamage += 2; // Apply burn effect
        console.log(`Sun Momentum activated! ${opponent.username} is burning for 2 damage per turn`);
      }
      momentum.sun = 0; // Reset momentum
    }
    else if (momentum.moon >= 3) {
      // Apply Moon momentum effect (double heal and shield)
      player.shields += 3;
      console.log(`Moon Momentum activated! ${player.username} gets 3 shields`);
      momentum.moon = 0; // Reset momentum
    }
    else if (momentum.eclipse >= 3) {
      // Apply Eclipse momentum effect (steal energy)
      const opponent = game.players.find(p => p.id !== player.id);
      if (opponent && opponent.energy > 0) {
        opponent.energy--;
        player.energy++;
        console.log(`Eclipse Momentum activated! ${player.username} steals 1 energy`);
      }
      momentum.eclipse = 0; // Reset momentum
    }
  }

  // Play a secret card
  playSecretCard(game: Game, playerId: string, cardId: string): Game {
    // Find the player
    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || playerIndex !== game.currentPlayerIndex) {
      throw new Error('Not your turn');
    }
    
    const player = game.players[playerIndex];
    
    // Find the card in the player's hand
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error('Card not found in hand');
    }
    
    const card = player.hand[cardIndex];
    
    // Check if the card can be played as a secret
    if (!card.isSecret) {
      throw new Error('This card cannot be played as a secret');
    }
    
    // Remove the card from hand
    player.hand.splice(cardIndex, 1);
    
    // Add to secret cards
    game.secretCards.push({
      playerId: player.id,
      cardId: card.id,
      trigger: card.secretTrigger || ''
    });
    
    console.log(`${player.username} played a secret card`);
    
    // Move to the next turn
    return this.nextTurn(game);
  }

  // Check for secret card triggers
  private checkSecretTriggers(game: Game, playedCard: Card): void {
    const secretsToActivate = [];
    
    // Find secrets that should trigger
    for (let i = 0; i < game.secretCards.length; i++) {
      const secret = game.secretCards[i];
      const secretOwner = game.players.find(p => p.id === secret.playerId);
      
      if (!secretOwner) continue;
      
      // Find the secret card
      const secretCard = [...secretOwner.deck, ...secretOwner.discardPile]
        .find(c => c.id === secret.cardId);
      
      if (!secretCard) continue;
      
      // Check if the trigger condition is met
      if (this.isSecretTriggered(secretCard, playedCard)) {
        secretsToActivate.push({ index: i, card: secretCard, owner: secretOwner });
      }
    }
    
    // Activate triggered secrets (in reverse order to avoid index issues when removing)
    for (let i = secretsToActivate.length - 1; i >= 0; i--) {
      const { index, card, owner } = secretsToActivate[i];
      
      console.log(`Secret card triggered: ${card.name}`);
      
      // Apply the secret card's effects
      this.applyCardEffects(game, owner, card);
      
      // Remove from secrets and add to discard pile
      game.secretCards.splice(index, 1);
      owner.discardPile.push(card);
    }
  }

  // Check if a secret card should trigger
  private isSecretTriggered(secretCard: Card, playedCard: Card): boolean {
    if (!secretCard.secretTrigger) return false;
    
    switch (secretCard.secretTrigger) {
      case 'OPPONENT_PLAYS_SUN':
        return playedCard.type === CardType.SUN;
      case 'OPPONENT_PLAYS_MOON':
        return playedCard.type === CardType.MOON;
      case 'OPPONENT_PLAYS_ECLIPSE':
        return playedCard.type === CardType.ECLIPSE;
      case 'PHASE_CHANGES':
        return true; // This will be checked separately when phase changes
      default:
        return false;
    }
  }

  // New method to apply card effects
  private applyCardEffects(game: Game, player: Player, card: Card): void {
    const opponent = game.players.find(p => p.id !== player.id);
    if (!opponent) return;
    
    let damage = card.damage;
    let healing = card.healing;
    
    // Apply phase bonuses
    if ((card.type === CardType.SUN && game.currentPhase === Phase.DAY) ||
        (card.type === CardType.MOON && game.currentPhase === Phase.NIGHT)) {
      // Cards are stronger in their corresponding phase
      damage = Math.floor(damage * 1.5);
      healing = Math.floor(healing * 1.5);
    }
    
    // Apply damage to opponent (considering shields)
    if (damage > 0) {
      if (opponent.shields > 0) {
        const absorbedDamage = Math.min(opponent.shields, damage);
        damage -= absorbedDamage;
        opponent.shields -= absorbedDamage;
        console.log(`${opponent.username}'s shield absorbs ${absorbedDamage} damage`);
      }
      
      // Apply remaining damage
      if (damage > 0) {
        // In Overdrive, take extra damage
        if (opponent.inOverdrive) {
          damage += 1;
        }
        
        opponent.hp -= damage;
        console.log(`${opponent.username} takes ${damage} damage`);
      }
    }
    
    // Apply healing to player
    if (healing > 0) {
      player.hp += healing;
      // Cap HP at 20
      if (player.hp > 20) {
        player.hp = 20;
      }
      console.log(`${player.username} heals for ${healing} HP`);
    }
    
    // Apply card effects
    for (const effect of card.effects) {
      this.applyEffect(game, player, opponent, effect);
    }
  }

  // New method to apply individual effects
  private applyEffect(game: Game, player: Player, opponent: Player, effect: Effect): void {
    switch (effect.type) {
      case EffectType.SWITCH_PHASE:
        if (!game.phaseLocked) {
          game.currentPhase = game.currentPhase === Phase.DAY ? Phase.NIGHT : Phase.DAY;
          game.phaseChangeCounter = 0; // Reset phase change counter
          game.phaseJustChanged = true; // Set flag for phase surge
          console.log(`Phase changed to ${game.currentPhase}`);
          
          // Eclipse Wanderer hero power
          if (player.heroPower === 'Eclipse Wanderer') {
            this.drawCards(game, player, 1);
            console.log(`${player.username}'s Eclipse Wanderer power activates: Draw a card`);
          }
        }
        break;
        
      case EffectType.PHASE_LOCK:
        game.phaseLocked = true;
        game.phaseLockDuration = effect.duration || 2;
        console.log(`Phase locked for ${game.phaseLockDuration} turns`);
        break;
        
      case EffectType.STEAL_CARD:
        if (opponent.hand.length > 0) {
          const randomIndex = Math.floor(Math.random() * opponent.hand.length);
          const stolenCard = opponent.hand.splice(randomIndex, 1)[0];
          player.hand.push(stolenCard);
          console.log(`${player.username} steals a card from ${opponent.username}`);
        }
        break;
        
      // Add other effect handlers...
      
      default:
        // Handle existing effects from the original code
        if (effect.type === EffectType.SELF_DAMAGE && effect.value) {
          player.hp -= effect.value;
        } else if (effect.type === EffectType.DISCARD && effect.value) {
          // Existing discard logic
          // Also check for Midnight Reaper hero power
          if (player.heroPower === 'Midnight Reaper') {
            opponent.hp -= 2;
            console.log(`${player.username}'s Midnight Reaper power activates: ${opponent.username} takes 2 damage`);
          }
        } else if (effect.type === EffectType.DRAW && effect.value) {
          this.drawCards(game, player, effect.value);
        }
        break;
    }
  }

  // Start a new turn
  startNewTurn(game: Game): Game {
    // Switch to the next player
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    
    // If we've gone through all players, increment the turn counter
    if (game.currentPlayerIndex === 0) {
      game.turnCount++;
      
      // Check if phase should change (every 3 turns)
      if (!game.phaseLocked) {
        game.phaseChangeCounter++;
        if (game.phaseChangeCounter >= 3) {
          game.currentPhase = game.currentPhase === Phase.DAY ? Phase.NIGHT : Phase.DAY;
          game.phaseChangeCounter = 0;
          game.phaseJustChanged = true;
          
          // Eclipse Wanderer hero power
          for (const player of game.players) {
            if (player.heroPower === 'Eclipse Wanderer') {
              this.drawCards(game, player, 1);
              console.log(`${player.username}'s Eclipse Wanderer power activates: Draw a card`);
            }
          }
        }
      } else {
        // Decrement phase lock duration
        game.phaseLockDuration--;
        if (game.phaseLockDuration <= 0) {
          game.phaseLocked = false;
        }
      }
    }
    
    const currentPlayer = game.players[game.currentPlayerIndex];
    
    // Give player energy for the new turn
    currentPlayer.energy += 1;
    console.log(`${currentPlayer.username} gained 1 energy, now has ${currentPlayer.energy}`);
    
    // Draw a card
    this.drawCards(game, currentPlayer, 1);
    
    // Apply burn damage if any
    if (currentPlayer.burnDamage > 0) {
      currentPlayer.hp -= currentPlayer.burnDamage;
      console.log(`${currentPlayer.username} took ${currentPlayer.burnDamage} burn damage`);
      
      // Check if player died from burn damage
      if (currentPlayer.hp <= 0) {
        game.isGameOver = true;
        game.winner = game.players.find(p => p.id !== currentPlayer.id) || null;
      }
    }
    
    return game;
  }
}
