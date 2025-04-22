import type { Game, FrontendGameState, OpponentPublicData, EffectResult } from '../models/Game';
import type { Card } from '../models/Card';
import { Phase, CardType } from '../models/Card';
import { createGame } from '../models/Game';
import { EffectService } from './EffectService';
import { CardService } from './CardService';
import type { Player } from '../models/Player';
import type { Effect } from '../models/Effect';
import { EffectType, EffectTrigger } from '../models/Effect';

export class GameService {
  private cardService: CardService;
  private effectService: EffectService;

  constructor(cardService?: CardService) {
    this.cardService = cardService || CardService.getInstance();
    this.effectService = new EffectService();
  }

  // Initialize a new game
  initializeGame(players: Player[]): Game {
    // Create a new game
    const game = createGame(players);
    
    // Initialize player decks and draw initial hands
    for (const player of game.players) {
      player.deck = this.cardService.createDeck();
      this.drawCards(game, player, game.startingHandSize);
    }
    
    // Initialize game history with first turn
    game.history = {
      turns: [{
        turnNumber: 1,
        playerId: game.state.currentPlayerId,
        actions: []
      }]
    };
    
    return game;
  }

  // Play a card
  playCard(game: Game, playerId: string, cardId: string): Game {
    const player = this.getPlayer(game, playerId);
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    
    if (cardIndex === -1) {
      throw new Error('Card not found in hand');
    }
    
    const card = player.hand[cardIndex];
    const phasePower = this.effectService.getPhasePower(card, game.state.currentPhase);
    const effectiveCost = Math.max(0, card.stats.cost - phasePower.costReduction);

    if (player.stats.energy < effectiveCost) {
      throw new Error(`Not enough energy: need ${effectiveCost}, have ${player.stats.energy}`);
    }

    // Ensure we have a current turn in history
    if (!game.history.turns.length || game.history.turns[game.history.turns.length - 1].turnNumber !== game.state.turnCount) {
      game.history.turns.push({
        turnNumber: game.state.turnCount,
        playerId: game.state.currentPlayerId,
        actions: []
      });
    }
    
    // Spend energy
    player.stats.energy -= effectiveCost;
    
    // Remove card from hand
    player.hand.splice(cardIndex, 1);
    
    // Add card to battlefield
    if (!player.battlefield) {
      player.battlefield = [];
    }
    player.battlefield.push(card);
    
    // Apply card effects
    const opponent = game.players.find(p => p.id !== playerId)!;
    for (const effect of card.effects) {
      this.effectService.applyEffect(game, player, opponent, effect, card);
    }

    // Update last played card in both player state and game state
    if (!player.state.lastPlayedCards) {
      player.state.lastPlayedCards = [];
    }
    
    // Add to player's lastPlayedCards
    player.state.lastPlayedCards.push({
      id: card.id,
      name: card.name,
      effects: card.effects
    });
    
    // Update game state's lastPlayedCard
    game.state.lastPlayedCard = {
      cardId: card.id,
      playerId: player.id,
      effects: card.effects
    };
    
    // Initialize lastPlayedCards if it doesn't exist
    if (!game.state.lastPlayedCards) {
      game.state.lastPlayedCards = [];
    }
    
    // Add to game's lastPlayedCards with turn number
    game.state.lastPlayedCards.push({
      cardId: card.id,
      playerId: player.id,
      effects: card.effects,
      turnNumber: game.state.turnCount
    });
    
    // Record last played card
    const currentTurn = game.history.turns[game.history.turns.length - 1];
    currentTurn.actions.push({
      type: 'PLAY_CARD',
      cardId: card.id,
      effects: card.effects,
      timestamp: Date.now()
    });
    
    // Update player momentum for this card type
    this.updatePlayerMomentum(game, player.id, card.type);
    
    return game;
  }

  // Update player momentum for a card type
  private updatePlayerMomentum(game: Game, playerId: string, cardType: CardType): void {
    // Get current phase momentum
    const currentPhase = game.state.currentPhase;
    
    // Increment momentum for current phase
    if (game.state.playerMomentum[playerId]) {
      game.state.playerMomentum[playerId][currentPhase] += 1;
    }
  }

  // Lock the phase for a certain duration
  lockPhase(game: Game, duration: number): void {
    game.state.phaseLocked = true;
    game.state.phaseLockDuration = duration;
  }

  // Unlock the phase
  unlockPhase(game: Game): void {
    game.state.phaseLocked = false;
    game.state.phaseLockDuration = undefined;
  }

  // Change game phase
  private changePhase(game: Game): void {
    // Don't change phase if it's locked
    if (game.state.phaseLocked) {
      // Decrement lock duration
      if (game.state.phaseLockDuration !== undefined && game.state.phaseLockDuration > 0) {
        game.state.phaseLockDuration--;
        
        // Unlock if duration is over
        if (game.state.phaseLockDuration <= 0) {
          this.unlockPhase(game);
        }
      }
      return;
    }

    const currentPhaseIndex = game.phaseOrder.indexOf(game.state.currentPhase);
    const nextPhaseIndex = (currentPhaseIndex + 1) % game.phaseOrder.length;
    game.state.currentPhase = game.phaseOrder[nextPhaseIndex];
    game.state.phaseJustChanged = true;
    game.state.phaseChangeCounter++;
  }

  // Apply turn start effects
  private applyTurnStartEffects(game: Game, player: Player): void {
    // Reset phase just changed flag at start of turn
    game.state.phaseJustChanged = false;
    
    // Apply any active effects
    for (const effect of player.state.activeEffects) {
      // Find the card that created this effect
      const sourceCard = [...player.hand, ...player.discardPile]
        .find(card => card.effects.some(e => e.id === effect.id));
      
      if (sourceCard) {
        // Convert the active effect to a proper Effect type
        const properEffect: Effect = {
          id: effect.id,
          type: effect.type as EffectType,
          value: effect.value,
          trigger: EffectTrigger.ON_TURN_START,
          duration: effect.duration
        };
        this.effectService.applyEffect(game, player, player, properEffect, sourceCard);
      }
      
      // Decrement duration and remove if expired
      effect.duration--;
      if (effect.duration <= 0) {
        player.state.activeEffects = player.state.activeEffects.filter(e => e.id !== effect.id);
      }
    }

    // Check for blood moon transformation
    if (player.state.isInBloodMoon) {
      player.state.bloodMoonTurnsLeft = (player.state.bloodMoonTurnsLeft || 0) - 1;
      if (player.state.bloodMoonTurnsLeft <= 0) {
        player.state.isInBloodMoon = false;
      }
    }
  }
  

  // Draw cards for a player
  private drawCards(game: Game, player: Player, count: number): void {
    for (let i = 0; i < count; i++) {
      if (player.deck.length === 0) {
        // Shuffle discard pile into deck
        player.deck = [...player.discardPile];
        player.discardPile = [];
        // TODO: Add shuffle logic
      }
      if (player.deck.length > 0) {
        player.hand.push(player.deck.pop()!);
      }
    }
  }

  // Get player by ID
  private getPlayer(game: Game, playerId: string): Player {
    const player = game.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }
    
    return player;
  }

 


  // Get game state for frontend
  getGameState(game: Game, currentPlayerId: string): FrontendGameState {
    const currentPlayer = this.getPlayer(game, currentPlayerId);
    const opponent = game.players.find(p => p.id !== currentPlayerId);

    if (!opponent) {
      throw new Error('Opponent not found');
    }

    // Create opponent public data (hiding cards in hand)
    const opponentPublicData: OpponentPublicData = {
      id: opponent.id,
      username: opponent.username,
      stats: {
        health: opponent.stats.health,
        maxHealth: opponent.stats.maxHealth,
        energy: opponent.stats.energy,
        maxEnergy: opponent.stats.maxEnergy,
        bloodMoonMeter: opponent.stats.bloodMoonMeter,
        shields: opponent.stats.shields,
        crystals: opponent.stats.crystals,
        powerBoost: opponent.stats.powerBoost,
        temporaryAttackBoost: opponent.stats.temporaryAttackBoost,
        voidShieldDuration: opponent.stats.voidShieldDuration,
        inOverdrive: opponent.stats.inOverdrive
      },
      state: {
        isInBloodMoon: opponent.state.isInBloodMoon,
        bloodMoonCharge: opponent.state.bloodMoonCharge,
        hasEvasion: opponent.state.hasEvasion,
        evasionDuration: opponent.state.evasionDuration,
        enemiesKilledThisTurn: opponent.state.enemiesKilledThisTurn,
        activeEffects: opponent.state.activeEffects,
        lastPlayedCards: opponent.state.lastPlayedCards
      },
      handSize: opponent.hand.length,
      deckSize: opponent.deck.length,
      discardPileSize: opponent.discardPile.length,
      battlefield: opponent.battlefield || []
    };

    // Calculate turns until phase change
    const phaseEndsIn = game.phaseDuration - (game.state.turnCount % game.phaseDuration);

    // Create last effect results (use empty array if not available)
    const lastEffectResults = game.state.lastEffectResults || [];

    // Create active effects with source information
    const activeEffects = currentPlayer.state.activeEffects.map(effect => ({
      ...effect,
      source: 'card' 
    }));

    // Return the frontend game state
    return {
      gameId: game.id,
      currentPhase: game.state.currentPhase,
      phaseChangeCounter: game.state.phaseChangeCounter,
      phaseJustChanged: game.state.phaseJustChanged,
      phaseLocked: game.state.phaseLocked,
      phaseLockDuration: game.state.phaseLockDuration,
      turnCount: game.state.turnCount,
      isYourTurn: game.state.currentPlayerId === currentPlayerId,
      player: currentPlayer,
      opponent: opponentPublicData,
      isGameOver: game.isGameOver,
      winner: game.winner ? { 
        id: game.winner.id, 
        username: game.winner.username 
      } : null,
      playerMomentum: game.state.playerMomentum,
      lastPlayedCard: game.state.lastPlayedCard,
      lastPlayedCards: [
        ...(currentPlayer.state.lastPlayedCards || []).map(card => ({
          cardId: card.id,
          playerId: currentPlayer.id,
          effects: card.effects
        })),
        ...(opponent.state.lastPlayedCards || []).map(card => ({
          cardId: card.id,
          playerId: opponent.id,
          effects: card.effects
        }))
      ],
      lastPlayedCardsForTurn: game.state.lastPlayedCardsForTurn || [],
      realityWarpDuration: game.state.realityWarpDuration,
      
      // Extra frontend data
      canPlayCard: game.state.currentPlayerId === currentPlayerId && currentPlayer.stats.energy > 0,
      availableEnergy: currentPlayer.stats.energy,
      bloodMoonActive: currentPlayer.state.isInBloodMoon,
      phaseEndsIn,
      activeEffects,
      lastEffectResults,
      originalPhaseOrder: game.state.originalPhaseOrder,
      phaseOrder: game.phaseOrder,
      bloodMoonCharge: currentPlayer.state.bloodMoonCharge || 0
    };
  }

  // Start a new turn
  startNewTurn(game: Game): Game {
    // Get current player before switching
    const currentPlayer = this.getPlayer(game, game.state.currentPlayerId);
    
    // Increase max energy for the player who just finished their turn
    if (currentPlayer.stats.maxEnergy < 10) {
      currentPlayer.stats.maxEnergy += 1;
    }
    
    // Reset the lastPlayedCards for the new turn
    game.state.lastPlayedCardsForTurn = game.state.lastPlayedCards || [];
    game.state.lastPlayedCards = [];
    game.state.lastPlayedCard = undefined;
    
    // Switch to next player
    const currentPlayerIndex = game.players.findIndex(p => p.id === game.state.currentPlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
    game.state.currentPlayerId = game.players[nextPlayerIndex].id;
    
    // Increment turn counter
    game.state.turnCount++;
      
    // Check phase change
    if (game.state.turnCount % game.phaseDuration === 0) {
        this.changePhase(game);
    }

    // Reset next player's state for new turn
    const nextPlayer = game.players[nextPlayerIndex];
    nextPlayer.stats.energy = nextPlayer.stats.maxEnergy;
    nextPlayer.hasPlayedCard = false;

    // Apply turn start effects
    this.applyTurnStartEffects(game, nextPlayer);
    
    return game;
  }
}
