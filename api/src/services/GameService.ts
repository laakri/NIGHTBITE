import type { Game, GameState, GameHistory, GameAction } from '../models/Game';
import type { FrontendGameState, OpponentPublicData, EffectResult } from '../models/FrontendGameState';
import { Phase, CardType } from '../models/Card';
import type { Card, CardStats } from '../models/Card';
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
      throw new Error('Blood cards can only be played during blood moon phase');
    }
    
    // Check blood energy cost for blood moon cards
    const bloodCost = card.stats.bloodMoonCost || 0;
    if (bloodCost > 0) {
      if (player.stats.bloodEnergy < bloodCost) {
        throw new Error(`Not enough blood energy: need ${bloodCost}, have ${player.stats.bloodEnergy}`);
      }
      player.stats.bloodEnergy -= bloodCost;
    }
    
    // Remove card from hand
    player.hand.splice(cardIndex, 1);
    
    // Handle passive cards
    if (card.stats.isPassive) {
      if (!game.state.passiveFields[playerId]) {
        game.state.passiveFields[playerId] = { cards: [], activeEffects: [] };
      }
      game.state.passiveFields[playerId].cards.push(card);
      
      // Activate passive effect immediately
      if (card.stats.passiveEffect) {
        this.activatePassiveEffect(game, player, card);
      }
    } else {
      // Add to battlefield for non-passive cards
      if (!player.battlefield) {
        player.battlefield = [];
      }
      player.battlefield.push(card);
    }
    
    // Apply blood moon energy from card stats
    this.applyBloodMoonEnergy(game, player, card);
    
    // Apply card effects
    const opponent = game.players.find(p => p.id !== playerId)!;
    for (const effect of card.effects) {
      this.effectService.applyEffect(game, player, opponent, effect, card);
    }

    // Update last played card
    if (!player.state.lastPlayedCards) {
      player.state.lastPlayedCards = [];
    }
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
    
    // Final blood energy check
    console.log(`[ENERGY] After playing ${card.name} - Player ${player.username} has ${player.stats.bloodEnergy} blood energy`);
    
    return game;
  }

  // Activate passive effect
  private activatePassiveEffect(game: Game, player: Player, card: Card): void {
    if (!card.stats.passiveEffect) return;
    
    const { trigger, effect, value, target } = card.stats.passiveEffect;
    
    // Add to active effects
    if (!game.state.passiveFields[player.id]) {
      game.state.passiveFields[player.id] = { cards: [], activeEffects: [] };
    }
    
    game.state.passiveFields[player.id].activeEffects.push({
      cardId: card.id,
      effect,
      value,
      target
    });
    
    // Apply effect immediately if trigger is CARD_PLAYED
    if (trigger === 'CARD_PLAYED') {
      this.applyPassiveEffect(game, player, card.stats.passiveEffect);
    }
  }

  // Apply passive effect
  private applyPassiveEffect(game: Game, player: Player, effect: CardStats['passiveEffect']): void {
    if (!effect) return;
    
    const { value, target } = effect;
    const opponent = game.players.find(p => p.id !== player.id)!;
    
    switch (effect.effect) {
      case 'GAIN_ENERGY':
        if (target === 'SELF') {
          player.stats.bloodEnergy = Math.min(player.stats.maxBloodEnergy, player.stats.bloodEnergy + value);
        }
        break;
      case 'ADD_SHIELD':
        if (target === 'SELF') {
          player.stats.shields += value;
        } else if (target === 'ALL_ALLIES') {
          game.players.forEach(p => {
            if (p.id === player.id) {
              p.stats.shields += value;
            }
          });
        }
        break;
      case 'HEAL':
        if (target === 'SELF') {
          player.stats.health = Math.min(player.stats.maxHealth, player.stats.health + value);
        } else if (target === 'ALL_ALLIES') {
          game.players.forEach(p => {
            if (p.id === player.id) {
              p.stats.health = Math.min(p.stats.maxHealth, p.stats.health + value);
            }
          });
        }
        break;
      case 'DAMAGE':
        if (target === 'ALL_ENEMIES') {
          opponent.stats.health -= value;
        }
        break;
    }
  }

  // Check and process card evolution
  private checkCardEvolution(game: Game, player: Player, card: Card): void {
    if (!card.stats.evolution || card.stats.evolution.isEvolved) return;
    
    const { conditions } = card.stats.evolution;
    let canEvolve = true;
    
    for (const condition of conditions) {
      if (condition.currentProgress < condition.value) {
        canEvolve = false;
        break;
      }
    }
    
    if (canEvolve) {
      this.evolveCard(game, player, card);
    }
  }

  // Evolve a card
  private evolveCard(game: Game, player: Player, card: Card): void {
    if (!card.stats.evolution) return;
    
    const targetCardId = card.stats.evolution.targetCardId;
    const targetCard = this.cardService.getCardType(targetCardId);
    
    if (!targetCard) return;
    
    // Create evolved card
    const evolvedCard = this.cardService.createCard(targetCardId);
    evolvedCard.stats.evolution = { ...card.stats.evolution, isEvolved: true };
    
    // Replace card in battlefield or passive field
    if (card.stats.isPassive) {
      const passiveIndex = game.state.passiveFields[player.id].cards.findIndex(c => c.id === card.id);
      if (passiveIndex !== -1) {
        game.state.passiveFields[player.id].cards[passiveIndex] = evolvedCard;
      }
    } else {
      const battlefieldIndex = player.battlefield.findIndex(c => c.id === card.id);
      if (battlefieldIndex !== -1) {
        player.battlefield[battlefieldIndex] = evolvedCard;
      }
    }
    
    // Record evolution in game history
    const currentTurn = game.history.turns[game.history.turns.length - 1];
    currentTurn.actions.push({
      type: 'EVOLUTION',
      cardId: card.id,
      evolvedTo: targetCardId,
      timestamp: Date.now()
    });
  }

  // Process passive effects at turn start/end
  private processPassiveEffects(game: Game, trigger: 'TURN_START' | 'TURN_END' | 'PHASE_CHANGE'): void {
    game.players.forEach(player => {
      const passiveField = game.state.passiveFields[player.id];
      if (!passiveField) return;
      
      passiveField.cards.forEach(card => {
        if (card.stats.passiveEffect?.trigger === trigger) {
          this.applyPassiveEffect(game, player, card.stats.passiveEffect);
        }
      });
    });
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
        shields: opponent.stats.shields
      },
      state: {
        isInBloodMoon: opponent.state.isInBloodMoon,
        isInVoid: opponent.state.isInVoid,
        isEvading: opponent.state.isEvading,
        activeEffects: opponent.state.activeEffects.map(effect => ({
          id: effect.id,
          type: effect.type,
          value: effect.value,
          duration: effect.duration
        })),
        lastPlayedCards: opponent.state.lastPlayedCards
      },
      handSize: opponent.hand.length,
      deckSize: opponent.deck.length,
      discardPileSize: opponent.discardPile.length,
      battlefield: opponent.battlefield
    };

    // Calculate turns until phase change
    const phaseEndsIn = game.phaseDuration - (game.state.turnCount % game.phaseDuration);

    // Create last effect results (use empty array if not available)
    const lastEffectResults = game.state.lastEffectResults || [];

    // Create active effects with source information
    const activeEffects = currentPlayer.state.activeEffects.map(effect => ({
      id: effect.id,
      type: effect.type,
      value: effect.value,
      duration: effect.duration
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
      lastPlayedCards: game.state.lastPlayedCards || [],
      lastPlayedCardsForTurn: game.state.lastPlayedCardsForTurn || [],
      activeEffects,
      lastEffectResults: game.state.lastEffectResults || [],
      phaseOrder: game.phaseOrder,
      phaseEndsIn,
      availableEnergy: currentPlayer.stats.bloodEnergy,
      bloodMoonActive: currentPlayer.state.isInBloodMoon,
      bloodMoonCharge: currentPlayer.stats.bloodEnergy,
      canPlayCard: game.state.currentPlayerId === currentPlayerId
    };
    
    // Double-check and log the energy value being sent to frontend
    console.log(`[ENERGY DEBUG] Sending game state with availableEnergy = ${gameState.availableEnergy} to ${currentPlayer.username}`);
    
    return gameState;
  }

  // Start a new turn
  startNewTurn(game: Game): Game {
    // Get current player before switching
    const currentPlayer = this.getPlayer(game, game.state.currentPlayerId);
    
    // Process passive effects at turn end
    this.processPassiveEffects(game, 'TURN_END');
    
    // Store the lastPlayedCards for the current turn
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
      this.processPassiveEffects(game, 'PHASE_CHANGE');
    }

    // Reset next player's state for new turn
    const nextPlayer = game.players[nextPlayerIndex];
    nextPlayer.hasPlayedCard = false;

    // Draw a card for the next player
    this.drawCards(game, nextPlayer, 1);
    
    // Give blood energy at start of turn
    const turnEnergyAmount = 1;
    nextPlayer.stats.bloodEnergy += turnEnergyAmount;
    
    // Cap blood energy at max
    if (nextPlayer.stats.bloodEnergy > nextPlayer.stats.maxBloodEnergy) {
      nextPlayer.stats.bloodEnergy = nextPlayer.stats.maxBloodEnergy;
    }
    
    // Process passive effects at turn start
    this.processPassiveEffects(game, 'TURN_START');
    
    // Apply turn start effects
    this.applyTurnStartEffects(game, nextPlayer);
    
    // Check card evolution
    nextPlayer.battlefield.forEach(card => {
      this.checkCardEvolution(game, nextPlayer, card);
    });
    
    return game;
  }
}
