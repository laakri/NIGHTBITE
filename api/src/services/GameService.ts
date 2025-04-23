import type { Game } from '../models/Game';
import type { FrontendGameState, OpponentPublicData } from '../models/FrontendGameState';
import { Phase, CardType } from '../models/Card';
import type { Card } from '../models/Card';
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
  initializeGame(players: Player[], useFullDeck: boolean = false): Game {
    // Create a new game
    const game = createGame(players);
    
    // Initialize player decks and draw initial hands
    for (const player of game.players) {
      // Use full deck if specified, otherwise use standard deck
      player.deck = useFullDeck 
        ? this.cardService.createFullDeck() 
        : this.cardService.createDeck();
        
      // Initialize player stats - ensure blood energy is set but at a lower value
      player.stats.bloodEnergy = 1; // Start with just 1 blood energy
      player.stats.maxBloodEnergy = 10;
      
      // Debug log
      console.log(`[GAME] Initializing player ${player.username} with ${player.stats.bloodEnergy} blood energy`);
      
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

  // Apply blood moon energy from card stats
  private applyBloodMoonEnergy(game: Game, player: Player, card: Card): void {
    // Get base energy value
    let energyGain = card.stats.bloodMoonEnergy || 0;
    
    console.log(`[ENERGY] Card ${card.name} has base blood energy value: ${energyGain}`);
    
    // Add phase-specific bonus if applicable
    if (card.stats.phaseEffects && 
        card.stats.phaseEffects[game.state.currentPhase] && 
        card.stats.phaseEffects[game.state.currentPhase]?.energyBonus) {
      const phaseBonus = card.stats.phaseEffects[game.state.currentPhase]?.energyBonus || 0;
      energyGain += phaseBonus;
      console.log(`[ENERGY] Adding phase bonus of ${phaseBonus} for ${game.state.currentPhase} phase`);
    }
    
    // Don't automatically add energy if none is specified
    if (energyGain === 0) {
      console.log(`[ENERGY] Card ${card.name} does not generate any energy`);
      return;
    }
    
    console.log(`[ENERGY] Total energy gain from ${card.name}: ${energyGain}`);
    
    // Handle negative energy (stealing)
    if (energyGain < 0) {
      // Find opponent
      const opponent = game.players.find(p => p.id !== player.id);
      if (opponent) {
        // Calculate how much to steal (limited by what opponent has)
        const stealAmount = Math.min(opponent.stats.bloodEnergy, Math.abs(energyGain));
        opponent.stats.bloodEnergy -= stealAmount;
        player.stats.bloodEnergy += stealAmount;
        
        console.log(`[ENERGY] Stealing ${stealAmount} energy from ${opponent.username}`);
      }
    } else if (energyGain > 0) {
      // Add energy to player
      const previousEnergy = player.stats.bloodEnergy;
      player.stats.bloodEnergy += energyGain;
      
      // Cap at max blood energy
      if (player.stats.bloodEnergy > player.stats.maxBloodEnergy) {
        player.stats.bloodEnergy = player.stats.maxBloodEnergy;
        console.log(`[ENERGY] Capped energy at max: ${player.stats.maxBloodEnergy}`);
      }
      
      console.log(`[ENERGY] Player ${player.username} blood energy: ${previousEnergy} -> ${player.stats.bloodEnergy}`);
      
      // Track energy generation for metrics
      if (!game.state.energyStats) {
        game.state.energyStats = {};
      }
      if (!game.state.energyStats[player.id]) {
        game.state.energyStats[player.id] = { generated: 0, spent: 0 };
      }
      game.state.energyStats[player.id].generated += energyGain;
    }
  }

  // Play a card
  playCard(game: Game, playerId: string, cardId: string): Game {
    const player = this.getPlayer(game, playerId);
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    
    if (cardIndex === -1) {
      throw new Error('Card not found in hand');
    }
    
    const card = player.hand[cardIndex];
    
    // Debug blood energy before playing card
    console.log(`[ENERGY] Before playing ${card.name} - Player ${player.username} has ${player.stats.bloodEnergy} blood energy`);
    
    // Check if card can be played in current phase
    if (card.type === CardType.BLOOD && game.state.currentPhase !== Phase.BloodMoon) {
      // Blood cards can only be played during blood moon phase
      throw new Error('Blood cards can only be played during blood moon phase');
    }
    
    // Check blood energy cost for blood moon cards
    const bloodCost = card.stats.bloodMoonCost || 0;
    if (bloodCost > 0) {
      console.log(`[ENERGY] Card ${card.name} costs ${bloodCost} blood energy`);
      
      if (player.stats.bloodEnergy < bloodCost) {
        throw new Error(`Not enough blood energy: need ${bloodCost}, have ${player.stats.bloodEnergy}`);
      }
      
      // Spend blood energy
      const previousEnergy = player.stats.bloodEnergy;
      player.stats.bloodEnergy -= bloodCost;
      console.log(`[ENERGY] Player ${player.username} spent ${bloodCost} blood energy: ${previousEnergy} -> ${player.stats.bloodEnergy}`);
      
      // Track energy spent for metrics
      if (!game.state.energyStats) {
        game.state.energyStats = {};
      }
      if (!game.state.energyStats[player.id]) {
        game.state.energyStats[player.id] = { generated: 0, spent: 0 };
      }
      game.state.energyStats[player.id].spent += bloodCost;
    } else {
      console.log(`[ENERGY] Card ${card.name} has no blood energy cost`);
    }
    
    // Remove card from hand
    player.hand.splice(cardIndex, 1);
    
    // Add card to YOUR battlefield (not the opponent's)
    if (!player.battlefield) {
      player.battlefield = [];
    }
    player.battlefield.push(card);
    
    // Apply blood moon energy from card stats
    this.applyBloodMoonEnergy(game, player, card);
    
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
    
    // Add to game's lastPlayedCards with turn number - ONLY for the current turn
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
    
    // Final blood energy check
    console.log(`[ENERGY] After playing ${card.name} - Player ${player.username} has ${player.stats.bloodEnergy} blood energy`);
    
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
    const previousPhase = game.state.currentPhase;
    game.state.currentPhase = game.phaseOrder[nextPhaseIndex];
    game.state.phaseJustChanged = true;
    game.state.phaseChangeCounter++;

    // Give players blood energy when phase changes - but less than before
    game.players.forEach(player => {
      // Give moderate blood energy on phase change
      let energyAmount = 1; // Base amount for phase change
      
      if (game.state.currentPhase === Phase.BloodMoon) {
        energyAmount = 2; // More energy when moving to Blood Moon phase
        console.log(`[ENERGY] Blood Moon phase - giving ${player.username} ${energyAmount} blood energy`);
      } else if (game.state.currentPhase === Phase.Void) {
        energyAmount = 1; // Normal energy for Void phase
        console.log(`[ENERGY] Void phase - giving ${player.username} ${energyAmount} blood energy`);
      } else {
        console.log(`[ENERGY] Normal phase - giving ${player.username} ${energyAmount} blood energy`);
      }
      
      player.stats.bloodEnergy += energyAmount;
      
      // Cap blood energy at max
      if (player.stats.bloodEnergy > player.stats.maxBloodEnergy) {
        player.stats.bloodEnergy = player.stats.maxBloodEnergy;
      }
      
      console.log(`[ENERGY] Player ${player.username} now has ${player.stats.bloodEnergy} blood energy`);
    });
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
          duration: effect.duration,
          isActive: true,
          phase: game.state.currentPhase,
          source: sourceCard.id,
          target: player.id
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
        // Shuffle the deck
        for (let i = player.deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [player.deck[i], player.deck[j]] = [player.deck[j], player.deck[i]];
        }
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
    
    // Debug log for blood energy
    console.log(`[ENERGY DEBUG] Getting game state for ${currentPlayer.username}`);
    console.log(`[ENERGY DEBUG] Player ${currentPlayer.username} blood energy: ${currentPlayer.stats.bloodEnergy}`);
    console.log(`[ENERGY DEBUG] Opponent ${opponent.username} blood energy: ${opponent.stats.bloodEnergy}`);

    // Create opponent public data (hiding cards in hand)
    const opponentPublicData: OpponentPublicData = {
      id: opponent.id,
      username: opponent.username,
      stats: {
        health: opponent.stats.health,
        maxHealth: opponent.stats.maxHealth,
        bloodEnergy: opponent.stats.bloodEnergy,
        maxBloodEnergy: opponent.stats.maxBloodEnergy,
        bloodMoonMeter: opponent.stats.bloodMoonMeter,
        shields: opponent.stats.shields
      },
      state: {
        isInBloodMoon: opponent.state.isInBloodMoon,
        isInVoid: opponent.state.isInVoid,
        hasEvasion: opponent.state.isEvading,
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
    
    // Create game state with proper energy information
    const gameState: FrontendGameState = {
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
      // Only show cards played in the current turn
      lastPlayedCards: game.state.lastPlayedCards || [],
      // Cards from the previous turn
      lastPlayedCardsForTurn: game.state.lastPlayedCardsForTurn || [],
      realityWarpDuration: game.state.realityWarpDuration,
      
      // Extra frontend data
      canPlayCard: game.state.currentPlayerId === currentPlayerId,
      availableEnergy: currentPlayer.stats.bloodEnergy, // Specifically set blood energy for frontened
      bloodMoonActive: currentPlayer.state.isInBloodMoon,
      bloodMoonCharge: currentPlayer.stats.bloodMoonMeter,
      phaseEndsIn,
      activeEffects,
      lastEffectResults,
      originalPhaseOrder: game.state.originalPhaseOrder,
      phaseOrder: game.phaseOrder
    };
    
    // Double-check and log the energy value being sent to frontend
    console.log(`[ENERGY DEBUG] Sending game state with availableEnergy = ${gameState.availableEnergy} to ${currentPlayer.username}`);
    
    return gameState;
  }

  // Start a new turn
  startNewTurn(game: Game): Game {
    // Get current player before switching
    const currentPlayer = this.getPlayer(game, game.state.currentPlayerId);
    
    // Store the lastPlayedCards for the current turn into lastPlayedCardsForTurn
    game.state.lastPlayedCardsForTurn = game.state.lastPlayedCards || [];
    // Clear the current turn's played cards
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
    nextPlayer.hasPlayedCard = false;

    // Draw a card for the next player at the start of their turn
    this.drawCards(game, nextPlayer, 1);
    
    // Give blood energy at start of turn - reduced amount
    const turnEnergyAmount = 1;
    nextPlayer.stats.bloodEnergy += turnEnergyAmount;
    
    // Cap blood energy at max
    if (nextPlayer.stats.bloodEnergy > nextPlayer.stats.maxBloodEnergy) {
      nextPlayer.stats.bloodEnergy = nextPlayer.stats.maxBloodEnergy;
    }
    
    console.log(`[ENERGY] Turn start - giving ${nextPlayer.username} ${turnEnergyAmount} blood energy (total: ${nextPlayer.stats.bloodEnergy})`);

    // Apply turn start effects
    this.applyTurnStartEffects(game, nextPlayer);
    
    return game;
  }
}
