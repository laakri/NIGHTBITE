import type { Game } from '../models/Game';
import type { Player } from '../models/Player';
import type { Card } from '../models/Card';
import { CardType, Phase } from '../models/Card';
import { EffectType, EffectTrigger } from '../models/Effect';
import type { Effect } from '../models/Effect';
import { EffectService } from './EffectService';
import { NORMAL_CARDS } from '../cards/NormalCards';
import crypto from 'crypto';

/**
 * Service for testing card effects in isolation and in combination
 * Provides helper methods for setting up test scenarios and validating outcomes
 */
export class CardEffectTestService {
  private effectService: EffectService;

  constructor() {
    this.effectService = new EffectService();
  }

  /**
   * Create a test game instance with basic setup
   */
  createTestGame(): Game {
    const player1Id = crypto.randomUUID();
    const player2Id = crypto.randomUUID();

    const player1: Player = {
      id: player1Id,
      username: 'TestPlayer1',
      stats: {
        health: 30,
        maxHealth: 30,
        bloodEnergy: 0,
        maxBloodEnergy: 10,
        bloodMoonMeter: 0,
        shields: 0,
        momentum: 0,
        phasePower: {}
      },
      state: {
        isInBloodMoon: false,
        isInVoid: false,
        isEvading: false,
        activeEffects: [],
        lastPhaseChange: Phase.Normal,
        phaseStreak: 0,
        bloodMoonStreak: 0,
        voidStreak: 0,
        lastPlayedCards: []
      },
      hand: [],
      deck: [],
      discardPile: [],
      battlefield: [],
      isReady: true,
      hasPlayedCard: false
    };

    const player2: Player = {
      id: player2Id,
      username: 'TestPlayer2',
      stats: {
        health: 30,
        maxHealth: 30,
        bloodEnergy: 0,
        maxBloodEnergy: 10,
        bloodMoonMeter: 0,
        shields: 0,
        momentum: 0,
        phasePower: {}
      },
      state: {
        isInBloodMoon: false,
        isInVoid: false,
        isEvading: false,
        activeEffects: [],
        lastPhaseChange: Phase.Normal,
        phaseStreak: 0,
        bloodMoonStreak: 0,
        voidStreak: 0,
        lastPlayedCards: []
      },
      hand: [],
      deck: [],
      discardPile: [],
      battlefield: [],
      isReady: true,
      hasPlayedCard: false
    };

    const game: Game = {
      id: crypto.randomUUID(),
      players: [player1, player2],
      state: {
        currentPhase: Phase.Normal,
        phaseChangeCounter: 0,
        phaseJustChanged: false,
        phaseLocked: false,
        turnCount: 1,
        currentPlayerId: player1Id,
        playerMomentum: {
          [player1Id]: {
            [Phase.Normal]: 0,
            [Phase.BloodMoon]: 0,
            [Phase.Void]: 0
          },
          [player2Id]: {
            [Phase.Normal]: 0,
            [Phase.BloodMoon]: 0,
            [Phase.Void]: 0
          }
        },
        energyGenerated: {},
        lastEffectResults: []
      },
      history: {
        turns: [{
          turnNumber: 1,
          playerId: player1Id,
          actions: []
        }]
      },
      isActive: true,
      isGameOver: false,
      bloodMoonThreshold: 10,
      maxTurns: 30,
      startingHandSize: 5,
      phaseDuration: 3,
      phaseOrder: [Phase.Normal, Phase.Void, Phase.BloodMoon],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    return game;
  }

  /**
   * Create a card from the card definition
   */
  createCard(cardId: string): Card | null {
    const cardDefinition = NORMAL_CARDS[cardId];
    if (!cardDefinition) {
      console.error(`Card definition not found for ID: ${cardId}`);
      return null;
    }

    const card: Card = {
      id: crypto.randomUUID(),
      id_name: cardDefinition.id,
      name: cardDefinition.name,
      description: cardDefinition.description,
      type: cardDefinition.type,
      rarity: cardDefinition.rarity,
      stats: { ...cardDefinition.stats },
      effects: cardDefinition.effects.map(effect => ({ ...effect })),
      currentAttack: cardDefinition.stats.attack,
      currentHealth: cardDefinition.stats.health,
      isTransformed: false
    };

    return card;
  }

  /**
   * Add a card to a player's hand
   */
  addCardToHand(player: Player, cardId: string): Card | null {
    const card = this.createCard(cardId);
    if (card) {
      player.hand.push(card);
      return card;
    }
    return null;
  }

  /**
   * Play a card and apply its effects
   */
  playCard(game: Game, sourcePlayer: Player, targetPlayer: Player, cardId: string): void {
    // Find card in hand
    const cardIndex = sourcePlayer.hand.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
      console.error(`Card ${cardId} not found in player's hand`);
      return;
    }

    const card = sourcePlayer.hand[cardIndex];
    
    // Move card from hand to battlefield
    sourcePlayer.hand.splice(cardIndex, 1);
    sourcePlayer.battlefield.push(card);
    
    // Record in history
    game.history.turns[game.history.turns.length - 1].actions.push({
      type: 'PLAY_CARD',
      cardId: card.id,
      timestamp: Date.now()
    });
    
    // Add to last played cards
    if (!sourcePlayer.state.lastPlayedCards) {
      sourcePlayer.state.lastPlayedCards = [];
    }
    
    sourcePlayer.state.lastPlayedCards.unshift({
      id: card.id,
      name: card.name,
      effects: card.effects
    });
    
    // Keep only last 5 played cards
    if (sourcePlayer.state.lastPlayedCards.length > 5) {
      sourcePlayer.state.lastPlayedCards.pop();
    }
    
    // Apply energy effect before other effects if card generates energy
    if (card.stats.bloodMoonEnergy && card.stats.bloodMoonEnergy > 0) {
      this.applyBloodMoonEnergy(game, sourcePlayer, card);
    }
    
    // Apply each effect
    card.effects.forEach(effect => {
      this.effectService.applyEffect(game, sourcePlayer, targetPlayer, effect, card);
    });
  }

  /**
   * Apply blood moon energy from a card
   */
  private applyBloodMoonEnergy(game: Game, player: Player, card: Card): void {
    // Get base energy value
    let energyGain = card.stats.bloodMoonEnergy || 0;
    
    // Add phase-specific bonus if applicable
    const phaseEffect = card.stats.phaseEffects?.[game.state.currentPhase];
    if (phaseEffect?.energyBonus) {
      energyGain += phaseEffect.energyBonus;
    }
    
    // Handle negative energy (stealing)
    if (energyGain < 0) {
      // Find opponent
      const opponent = game.players.find(p => p.id !== player.id);
      if (opponent) {
        // Calculate how much to steal (limited by what opponent has)
        const stealAmount = Math.min(opponent.stats.bloodEnergy, Math.abs(energyGain));
        opponent.stats.bloodEnergy -= stealAmount;
        player.stats.bloodEnergy += stealAmount;
      }
    } else if (energyGain > 0) {
      // Add energy to player
      player.stats.bloodEnergy += energyGain;
      
      // Cap at max blood energy
      if (player.stats.bloodEnergy > player.stats.maxBloodEnergy) {
        player.stats.bloodEnergy = player.stats.maxBloodEnergy;
      }
      
      // Track energy generation for metrics
      const energyGenerated = game.state.energyGenerated ?? {};
      const playerEnergy = energyGenerated[player.id] ?? 0;
      game.state.energyGenerated = { ...energyGenerated, [player.id]: playerEnergy + energyGain };
    }
  }

  /**
   * Run a test for a specific card
   */
  testCard(cardId: string): TestResult {
    const game = this.createTestGame();
    const player1 = game.players[0];
    const player2 = game.players[1];
    
    // Initial state snapshot
    const initialState = this.captureGameState(game);
    
    // Add card to player's hand
    const card = this.addCardToHand(player1, cardId);
    if (!card) {
      return {
        cardId,
        success: false,
        message: `Card ${cardId} not found in card definitions`,
        initialState,
        finalState: initialState
      };
    }
    
    try {
      // Play the card
      this.playCard(game, player1, player2, card.id);
      
      // Final state snapshot
      const finalState = this.captureGameState(game);
      
      return {
        cardId,
        success: true,
        message: `Card ${cardId} played successfully`,
        initialState,
        finalState,
        stateChanges: this.compareGameStates(initialState, finalState)
      };
    } catch (error) {
      return {
        cardId,
        success: false,
        message: `Error playing card ${cardId}: ${error instanceof Error ? error.message : String(error)}`,
        initialState,
        finalState: this.captureGameState(game),
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Capture a snapshot of the current game state
   */
  private captureGameState(game: Game): GameStateSnapshot {
    const player1 = game.players[0];
    const player2 = game.players[1];
    
    return {
      phase: game.state.currentPhase,
      turnCount: game.state.turnCount,
      currentPlayerId: game.state.currentPlayerId,
      isGameOver: game.isGameOver,
      player1: {
        health: player1.stats.health,
        bloodEnergy: player1.stats.bloodEnergy,
        bloodMoonMeter: player1.stats.bloodMoonMeter,
        shields: player1.stats.shields,
        isInBloodMoon: player1.state.isInBloodMoon,
        handSize: player1.hand.length,
        battlefieldSize: player1.battlefield.length,
        activeEffects: player1.state.activeEffects.map(effect => ({
          type: effect.type,
          value: effect.value,
          duration: effect.duration
        }))
      },
      player2: {
        health: player2.stats.health,
        bloodEnergy: player2.stats.bloodEnergy,
        bloodMoonMeter: player2.stats.bloodMoonMeter,
        shields: player2.stats.shields,
        isInBloodMoon: player2.state.isInBloodMoon,
        handSize: player2.hand.length,
        battlefieldSize: player2.battlefield.length,
        activeEffects: player2.state.activeEffects.map(effect => ({
          type: effect.type,
          value: effect.value,
          duration: effect.duration
        }))
      },
      lastEffectResults: game.state.lastEffectResults || []
    };
  }

  /**
   * Compare two game state snapshots and return a list of changes
   */
  private compareGameStates(before: GameStateSnapshot, after: GameStateSnapshot): StateChanges {
    const changes: StateChanges = {
      phase: before.phase !== after.phase ? { from: before.phase, to: after.phase } : undefined,
      isGameOver: before.isGameOver !== after.isGameOver ? { from: before.isGameOver, to: after.isGameOver } : undefined,
      player1: {
        health: before.player1.health !== after.player1.health ? 
          { from: before.player1.health, to: after.player1.health } : undefined,
        bloodEnergy: before.player1.bloodEnergy !== after.player1.bloodEnergy ? 
          { from: before.player1.bloodEnergy, to: after.player1.bloodEnergy } : undefined,
        bloodMoonMeter: before.player1.bloodMoonMeter !== after.player1.bloodMoonMeter ? 
          { from: before.player1.bloodMoonMeter, to: after.player1.bloodMoonMeter } : undefined,
        shields: before.player1.shields !== after.player1.shields ? 
          { from: before.player1.shields, to: after.player1.shields } : undefined,
        isInBloodMoon: before.player1.isInBloodMoon !== after.player1.isInBloodMoon ? 
          { from: before.player1.isInBloodMoon, to: after.player1.isInBloodMoon } : undefined,
        handSize: before.player1.handSize !== after.player1.handSize ? 
          { from: before.player1.handSize, to: after.player1.handSize } : undefined,
        battlefieldSize: before.player1.battlefieldSize !== after.player1.battlefieldSize ? 
          { from: before.player1.battlefieldSize, to: after.player1.battlefieldSize } : undefined,
        activeEffectsAdded: after.player1.activeEffects.filter(
          effect => !before.player1.activeEffects.some(e => e.type === effect.type && e.value === effect.value)
        ),
        activeEffectsRemoved: before.player1.activeEffects.filter(
          effect => !after.player1.activeEffects.some(e => e.type === effect.type && e.value === effect.value)
        )
      },
      player2: {
        health: before.player2.health !== after.player2.health ? 
          { from: before.player2.health, to: after.player2.health } : undefined,
        bloodEnergy: before.player2.bloodEnergy !== after.player2.bloodEnergy ? 
          { from: before.player2.bloodEnergy, to: after.player2.bloodEnergy } : undefined,
        bloodMoonMeter: before.player2.bloodMoonMeter !== after.player2.bloodMoonMeter ? 
          { from: before.player2.bloodMoonMeter, to: after.player2.bloodMoonMeter } : undefined,
        shields: before.player2.shields !== after.player2.shields ? 
          { from: before.player2.shields, to: after.player2.shields } : undefined,
        isInBloodMoon: before.player2.isInBloodMoon !== after.player2.isInBloodMoon ? 
          { from: before.player2.isInBloodMoon, to: after.player2.isInBloodMoon } : undefined,
        handSize: before.player2.handSize !== after.player2.handSize ? 
          { from: before.player2.handSize, to: after.player2.handSize } : undefined,
        battlefieldSize: before.player2.battlefieldSize !== after.player2.battlefieldSize ? 
          { from: before.player2.battlefieldSize, to: after.player2.battlefieldSize } : undefined,
        activeEffectsAdded: after.player2.activeEffects.filter(
          effect => !before.player2.activeEffects.some(e => e.type === effect.type && e.value === effect.value)
        ),
        activeEffectsRemoved: before.player2.activeEffects.filter(
          effect => !after.player2.activeEffects.some(e => e.type === effect.type && e.value === effect.value)
        )
      },
      newEffectResults: after.lastEffectResults.filter(
        result => !before.lastEffectResults.some(r => 
          r.type === result.type && 
          r.value === result.value && 
          r.sourceCardId === result.sourceCardId
        )
      )
    };
    
    return changes;
  }

  /**
   * Run batch tests for multiple cards
   */
  testCards(cardIds: string[]): BatchTestResult {
    const results: Record<string, TestResult> = {};
    let successCount = 0;
    let failCount = 0;
    
    for (const cardId of cardIds) {
      const result = this.testCard(cardId);
      results[cardId] = result;
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }
    
    return {
      totalTests: cardIds.length,
      successCount,
      failCount,
      results
    };
  }

  /**
   * Test all cards in the database
   */
  testAllCards(): BatchTestResult {
    const cardIds = Object.keys(NORMAL_CARDS);
    return this.testCards(cardIds);
  }
}

// Types for test results
interface GameStateSnapshot {
  phase: Phase;
  turnCount: number;
  currentPlayerId: string;
  isGameOver: boolean;
  player1: {
    health: number;
    bloodEnergy: number;
    bloodMoonMeter: number;
    shields: number;
    isInBloodMoon: boolean;
    handSize: number;
    battlefieldSize: number;
    activeEffects: {
      type: string;
      value: number;
      duration: number;
    }[];
  };
  player2: {
    health: number;
    bloodEnergy: number;
    bloodMoonMeter: number;
    shields: number;
    isInBloodMoon: boolean;
    handSize: number;
    battlefieldSize: number;
    activeEffects: {
      type: string;
      value: number;
      duration: number;
    }[];
  };
  lastEffectResults: any[];
}

interface ValueChange<T> {
  from: T;
  to: T;
}

interface PlayerStateChanges {
  health?: ValueChange<number>;
  bloodEnergy?: ValueChange<number>;
  bloodMoonMeter?: ValueChange<number>;
  shields?: ValueChange<number>;
  isInBloodMoon?: ValueChange<boolean>;
  handSize?: ValueChange<number>;
  battlefieldSize?: ValueChange<number>;
  activeEffectsAdded: {
    type: string;
    value: number;
    duration: number;
  }[];
  activeEffectsRemoved: {
    type: string;
    value: number;
    duration: number;
  }[];
}

interface StateChanges {
  phase?: ValueChange<Phase>;
  isGameOver?: ValueChange<boolean>;
  player1: PlayerStateChanges;
  player2: PlayerStateChanges;
  newEffectResults: any[];
}

interface TestResult {
  cardId: string;
  success: boolean;
  message: string;
  initialState: GameStateSnapshot;
  finalState: GameStateSnapshot;
  stateChanges?: StateChanges;
  error?: Error;
}

interface BatchTestResult {
  totalTests: number;
  successCount: number;
  failCount: number;
  results: Record<string, TestResult>;
} 