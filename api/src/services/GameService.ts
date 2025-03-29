import { createGame, type EffectResult, type Game } from '../models/Game';
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
    // Ensure players have initial energy
    for (const player of players) {
      player.energy = 2; // Start with 2 energy
    }
    
    // Create a new game
    const game = createGame(players);
    
    // Initialize player decks and draw initial hands
    for (const player of game.players) {
      player.deck = this.cardService.createDeck();
      this.drawCards(game, player, 5); // Draw 5 initial cards
    }
    
    console.log(`Game initialized with ${players.length} players. Starting phase: ${game.currentPhase}`);
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
    
    console.log(`${player.username} drew ${drawnCards.length} cards. Hand size: ${player.hand.length}`);
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
    
    // Calculate effective cost
    let effectiveCost = card.cost;
    let costReduced = false;
    
    // Check for Overdrive (cards cost 1 less when below 5 HP)
    if (player.hp <= 5) {
      player.inOverdrive = true;
      effectiveCost = Math.max(0, effectiveCost - 1);
      costReduced = true;
      console.log(`${player.username} is in Overdrive! Card cost reduced to ${effectiveCost}`);
    }
    
    // Check hero power (Dawncaller: first Sun card costs 1 less)
    if (player.heroPower === 'Dawncaller' && 
        card.type === CardType.SUN && 
        !game.lastPlayedCards.some(c => c.playerId === player.id && c.turnPlayed === game.turnCount)) {
      effectiveCost = Math.max(0, effectiveCost - 1);
      costReduced = true;
      console.log(`${player.username}'s Dawncaller power activates! Card cost reduced to ${effectiveCost}`);
    }
    
    // Special case: Some Eclipse cards might have reduced cost in certain situations
    if (card.type === CardType.ECLIPSE && game.phaseJustChanged) {
      effectiveCost = Math.max(0, effectiveCost - 1);
      costReduced = true;
      console.log(`Eclipse card played during phase change! Cost reduced to ${effectiveCost}`);
    }
    
    console.log(`Player ${player.username} attempting to play card ${card.name} with cost ${effectiveCost}, has energy: ${player.energy}`);
    
    if (player.energy < effectiveCost) {
      throw new Error(`Not enough energy: need ${effectiveCost}, have ${player.energy}`);
    }
    
    // Spend energy
    player.energy -= effectiveCost;
    console.log(`${player.username} spent ${effectiveCost} energy, remaining: ${player.energy}`);
    
    // Remove the card from hand
    player.hand.splice(cardIndex, 1);
    
    // Add to last played cards with more information
    game.lastPlayedCards.push({ 
      playerId: player.id, 
      cardId: card.id,
      cardName: card.name,
      cardDescription: card.description,
      cardType: card.type,
      cardCost: effectiveCost,
      cardDamage: card.damage || 0,
      cardHealing: card.healing || 0,
      turnPlayed: game.turnCount ,

    });
    if (game.lastPlayedCards.length > 6) {
      game.lastPlayedCards.shift();
    }
    
    // Check for phase surge effects
    this.handlePhaseSurge(game, player, card);
    
    // Update momentum
    this.updateMomentum(game, player, card);
    
    // Reset last applied effect
    game.lastAppliedEffect = null;
    
    // Apply card effects
    this.applyCardEffects(game, player, card);
    
    // Add to discard pile
    player.discardPile.push(card);
    
    // Check for secret card triggers
    this.checkSecretTriggers(game, card);
    
    return game;
  }

  // Start a new turn
  startNewTurn(game: Game): Game {
    // Switch to the next player
    game.currentPlayerIndex = 1 - game.currentPlayerIndex;
    
    // Increment turn count
    game.turnCount++;
    
    // Get the current player
    const currentPlayer = game.players[game.currentPlayerIndex];
    
    // Give energy to the current player (1 per turn, max 10)
    currentPlayer.energy = Math.min(10, currentPlayer.energy + 1);
    console.log(`${currentPlayer.username} gained 1 energy, now has ${currentPlayer.energy}`);
    
    // Increment phase change counter
    game.phaseChangeCounter++;
    
    // Check if we need to switch phases (every 3 turns)
    if (game.phaseChangeCounter >= 3 && !game.phaseLocked) {
      game.currentPhase = game.currentPhase === Phase.DAY ? Phase.NIGHT : Phase.DAY;
      game.phaseChangeCounter = 0;
      game.phaseJustChanged = true; // Set flag for phase surge
      console.log(`Phase changed to ${game.currentPhase}`);
      
      // Check for Eclipse Wanderer hero power
      for (const player of game.players) {
        if (player.heroPower === 'Eclipse Wanderer') {
          this.drawCards(game, player, 1);
          console.log(`${player.username}'s Eclipse Wanderer power activates! Drew a card.`);
        }
      }
    }
    
    // Decrease phase lock duration if active
    if (game.phaseLocked && game.phaseLockDuration > 0) {
      game.phaseLockDuration--;
      if (game.phaseLockDuration === 0) {
        game.phaseLocked = false;
        console.log('Phase lock has ended');
      }
    }
    
    // Draw a card for the new current player
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
        discardPileSize: player.discardPile.length,
        shields: player.shields || 0,
        burnDamage: player.burnDamage || 0,
        inOverdrive: player.inOverdrive || false,
        heroPower: player.heroPower || ''
      },
      opponent: {
        id: opponent.id,
        username: opponent.username,
        hp: opponent.hp,
        energy: opponent.energy,
        handSize: opponent.hand.length,
        deckSize: opponent.deck.length,
        discardPileSize: opponent.discardPile.length,
        shields: opponent.shields || 0,
        burnDamage: opponent.burnDamage || 0,
        inOverdrive: opponent.inOverdrive || false,
        heroPower: opponent.heroPower || ''
      },
      lastPlayedCards: game.lastPlayedCards,
      secretCards: game.secretCards || [],
      isGameOver: game.isGameOver,
      winner: game.winner ? {
        id: game.winner.id,
        username: game.winner.username
      } : null,
      lastAppliedEffect: game.lastAppliedEffect
    };
  }

  // Apply card effects
  private applyCardEffects(game: Game, player: Player, card: Card): void {
    const opponent = game.players.find(p => p.id !== player.id);
    if (!opponent) return;
    
    let damage = card.damage || 0;
    let healing = card.healing || 0;
    
    // Apply phase bonuses
    if ((card.type === CardType.SUN && game.currentPhase === Phase.DAY) ||
        (card.type === CardType.MOON && game.currentPhase === Phase.NIGHT)) {
      // Cards are stronger in their corresponding phase
      damage = Math.floor(damage * 1.5);
      healing = Math.floor(healing * 1.5);
      console.log(`${card.name} gets phase bonus! Damage: ${card.damage} -> ${damage}, Healing: ${card.healing} -> ${healing}`);
    }
    
    // Apply damage reduction effects if opponent has any
    if (damage > 0 && opponent.damageReduction) {
      const reducedDamage = Math.min(opponent.damageReduction, damage);
      damage -= reducedDamage;
      opponent.damageReduction -= reducedDamage;
      console.log(`${opponent.username}'s damage reduction reduces damage by ${reducedDamage}. Remaining reduction: ${opponent.damageReduction}`);
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
          console.log(`${opponent.username} is in Overdrive! Takes +1 damage`);
        }
        
        opponent.hp -= damage;
        console.log(`${opponent.username} takes ${damage} damage, HP: ${opponent.hp}`);
        
        // Check if opponent died
        if (opponent.hp <= 0) {
          game.isGameOver = true;
          game.winner = player;
          console.log(`${player.username} wins the game!`);
        }
      }
    }
    
    // Apply healing to player
    if (healing > 0) {
      const oldHp = player.hp;
      player.hp = Math.min(20, player.hp + healing); // Max HP is 20
      const actualHealing = player.hp - oldHp;
      console.log(`${player.username} heals for ${actualHealing} HP, HP: ${player.hp}`);
    }
    
    // Apply card effects
    if (card.effects && card.effects.length > 0) {
      for (const effect of card.effects) {
        this.applyEffect(game, player, opponent, effect, card);
      }
    }
  }

  // Apply a specific effect
  private applyEffect(game: Game, player: Player, opponent: Player, effect: Effect, card: Card): void {
    // Check if the condition is met before applying the effect
    if (!this.isConditionMet(game, player, effect.condition)) {
      console.log(`Condition not met for effect: ${effect.type}, condition: ${effect.condition}`);
      return;
    }
    
    console.log(`Applying effect: ${effect.type}, value: ${effect.value}, condition: ${effect.condition}`);
    
    // Create an effect result to track this effect application
    const effectResult: EffectResult = {
      type: effect.type,
      value: effect.value,
      sourceCardId: card.id,
      sourceCardName: card.name,
      targetPlayerId: this.getEffectTarget(effect.type, player.id, opponent.id),
      appliedAt: Date.now()
    };
    
    // Store as the last applied effect
    game.lastAppliedEffect = effectResult;
    
    switch (effect.type) {
      case EffectType.SWITCH_PHASE:
        this.changePhase(game);
        break;
        
      case EffectType.SELF_DAMAGE:
        const damageValue = effect.value || 0;
        if (damageValue > 0) {
          opponent.hp -= damageValue;
          console.log(`${opponent.username} takes ${damageValue} damage from effect, HP: ${opponent.hp}`);
          
          // Check if opponent died
          if (opponent.hp <= 0) {
            game.isGameOver = true;
            game.winner = player;
            console.log(`${player.username} wins the game!`);
          }
        }
        break;
        
      case EffectType.DISCARD:
        const discardCount = effect.value || 1;
        if (opponent.hand.length > 0) {
          // Randomly select cards to discard
          for (let i = 0; i < Math.min(discardCount, opponent.hand.length); i++) {
            const randomIndex = Math.floor(Math.random() * opponent.hand.length);
            const discardedCard = opponent.hand.splice(randomIndex, 1)[0];
            opponent.discardPile.push(discardedCard);
            console.log(`${opponent.username} discards ${discardedCard.name}`);
          }
        }
        break;
        
      case EffectType.DRAW:
        const drawCount = effect.value || 1;
        this.drawCards(game, player, drawCount);
        console.log(`${player.username} draws ${drawCount} card(s)`);
        break;
        
      case EffectType.PHASE_LOCK:
        const lockDuration = effect.duration || 1;
        game.phaseLocked = true;
        game.phaseLockDuration = lockDuration;
        console.log(`Phase locked for ${lockDuration} turns`);
        break;
        
      case EffectType.STEAL_CARD:
        if (opponent.hand.length > 0) {
          // Randomly select a card to steal
          const randomIndex = Math.floor(Math.random() * opponent.hand.length);
          const stolenCard = opponent.hand.splice(randomIndex, 1)[0];
          player.hand.push(stolenCard);
          console.log(`${player.username} steals ${stolenCard.name} from ${opponent.username}`);
        }
        break;
        
      case EffectType.SHIELD:
        const shieldValue = effect.value || 2;
        player.shields = (player.shields || 0) + shieldValue;
        console.log(`${player.username} gains ${shieldValue} shields, total: ${player.shields}`);
        break;
        
      case EffectType.REDUCE_DAMAGE:
        const reductionValue = effect.value || 2;
        player.damageReduction = (player.damageReduction || 0) + reductionValue;
        console.log(`${player.username} will reduce next damage by ${reductionValue}`);
        break;
        
      case EffectType.BURN:
        const burnValue = effect.value || 1;
        opponent.burnDamage = (opponent.burnDamage || 0) + burnValue;
        console.log(`${opponent.username} is burning for ${burnValue} damage per turn`);
        break;
        
      case EffectType.BALANCE_HP:
        // Calculate average HP
        const avgHp = Math.floor((player.hp + opponent.hp) / 2);
        player.hp = avgHp;
        opponent.hp = avgHp;
        console.log(`Both players' HP balanced to ${avgHp}`);
        break;
        
      default:
        console.log(`Unhandled effect type: ${effect.type}`);
    }
  }

  // Helper method to determine the target of an effect
  private getEffectTarget(effectType: EffectType, playerId: string, opponentId: string): string {
    // Effects that target the opponent
    if (effectType === EffectType.SELF_DAMAGE || 
        effectType === EffectType.DISCARD) {
      return opponentId;
    }
    
    // Effects that target both players
    if (effectType === EffectType.BALANCE_HP) {
      return 'both';
    }
    
    // By default, effects target the player who played the card
    return playerId;
  }

  // Handle phase surge effects
  private handlePhaseSurge(game: Game, player: Player, card: Card): void {
    if (!game.phaseJustChanged) return;
    
    // Apply surge effects based on card type and current phase
    if (card.type === CardType.SUN && game.currentPhase === Phase.DAY) {
      // Sun surge effect
      card.damage = (card.damage || 0) + 2; // Increase damage by 2
      console.log(`Sun Surge activated! ${card.name} gets +2 damage`);
    } 
    else if (card.type === CardType.MOON && game.currentPhase === Phase.NIGHT) {
      // Moon surge effect
      player.shields = (player.shields || 0) + 2; // Add 2 shields
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
    const opponent = game.players.find(p => p.id !== player.id);
    if (!opponent) return;
    
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
    
    console.log(`${player.username}'s momentum: Sun=${momentum.sun}, Moon=${momentum.moon}, Eclipse=${momentum.eclipse}`);
    
    // Check for momentum effects
    if (momentum.sun >= 3) {
      // Apply Sun momentum effect (burn)
      opponent.burnDamage = (opponent.burnDamage || 0) + 2; // Apply burn effect
      console.log(`Sun Momentum activated! ${opponent.username} is burning for 2 damage per turn`);
      momentum.sun = 0; // Reset momentum
    }
    else if (momentum.moon >= 3) {
      // Apply Moon momentum effect (double heal and shield)
      player.shields = (player.shields || 0) + 3;
      console.log(`Moon Momentum activated! ${player.username} gets 3 shields`);
      momentum.moon = 0; // Reset momentum
    }
    else if (momentum.eclipse >= 3) {
      // Apply Eclipse momentum effect (steal energy)
      if (opponent.energy > 0) {
        opponent.energy--;
        player.energy++;
        console.log(`Eclipse Momentum activated! ${player.username} steals 1 energy`);
      }
      momentum.eclipse = 0; // Reset momentum
    }
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

  // In the endTurn method, ensure energy is properly reset and incremented
  endTurn(game: Game): Game {
    // Current player ends their turn
    const currentPlayer = game.players[game.currentPlayerIndex];
    
    // Switch to next player
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    const nextPlayer = game.players[game.currentPlayerIndex];
    
    // Increment turn count if we've gone through all players
    if (game.currentPlayerIndex === 0) {
      game.turnCount++;
      
      // Check if phase should change (every 3 turns)
      if (game.turnCount % 3 === 0 && !game.phaseLocked) {
        this.changePhase(game);
      }
    }
    
    // Apply burn damage if any
    if (currentPlayer.burnDamage > 0) {
      currentPlayer.hp -= currentPlayer.burnDamage;
      console.log(`${currentPlayer.username} takes ${currentPlayer.burnDamage} burn damage, HP: ${currentPlayer.hp}`);
      
      // Reduce burn by 1 each turn
      currentPlayer.burnDamage = Math.max(0, currentPlayer.burnDamage - 1);
      
      // Check if player died from burn damage
      if (currentPlayer.hp <= 0) {
        game.isGameOver = true;
        game.winner = nextPlayer;
        console.log(`${nextPlayer.username} wins the game due to burn damage!`);
      }
    }
    
    // Give energy to the next player (max 10)
    nextPlayer.energy = Math.min(10, nextPlayer.energy + 1);
    
    // Draw a card for the next player
    this.drawCards(game, nextPlayer, 1);
    
    // Check for Eclipse Wanderer hero power
    if (nextPlayer.heroPower === 'Eclipse Wanderer' && game.phaseJustChanged) {
      this.drawCards(game, nextPlayer, 1);
      console.log(`${nextPlayer.username}'s Eclipse Wanderer power activates! Drew an extra card.`);
    }
    
    console.log(`Turn ended. Now ${nextPlayer.username}'s turn. Energy: ${nextPlayer.energy}`);
    return game;
  }

  // Add this method to your GameService class
  private changePhase(game: Game): void {
    // Switch to the opposite phase
    game.currentPhase = game.currentPhase === Phase.DAY ? Phase.NIGHT : Phase.DAY;
    game.phaseChangeCounter = 0;
    game.phaseJustChanged = true;
    
    console.log(`Phase changed to ${game.currentPhase}`);
    
    // Check for Eclipse Wanderer hero power for both players
    for (const player of game.players) {
      if (player.heroPower === 'Eclipse Wanderer') {
        this.drawCards(game, player, 1);
        console.log(`${player.username}'s Eclipse Wanderer power activates! Drew a card.`);
      }
    }
  }

  // Add this method to check if a condition is met
  private isConditionMet(game: Game, player: Player, condition?: string): boolean {
    if (!condition) return true; // No condition means always apply
    
    switch (condition) {
      case "DAY_PHASE":
        return game.currentPhase === Phase.DAY;
        
      case "NIGHT_PHASE":
        return game.currentPhase === Phase.NIGHT;
        
      case "LOW_HP":
        return player.hp <= 5;
        
      case "PLAYED_MOON_LAST_TURN":
        // Check if player played a Moon card last turn
        const lastTurnCards = game.lastPlayedCards.filter(
          card => card.playerId === player.id && 
                 card.turnPlayed === game.turnCount - 1 &&
                 card.cardType === CardType.MOON
        );
        return lastTurnCards.length > 0;
        
      case "OPPONENT_PLAYS_SUN":
        // For secret cards - checked separately in the secret card trigger logic
        return true;
        
      case "OPPONENT_PLAYS_MOON":
        // For secret cards - checked separately in the secret card trigger logic
        return true;
        
      default:
        console.log(`Unknown condition: ${condition}`);
        return false;
    }
  }
}
