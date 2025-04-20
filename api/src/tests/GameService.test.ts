import type { Game } from '../models/Game';
import type { Player } from '../models/Player';
import { GameService } from '../services/GameService';
import { CardService } from '../services/CardService';
import { CardType } from '../models/Card';

// Add Bun's test types
declare global {
  function describe(name: string, fn: () => void): void;
  function test(name: string, fn: () => void): void;
  function expect(value: any): any;
  function beforeEach(fn: () => void): void;
}

describe('GameService', () => {
  let gameService: GameService;
  let cardService: CardService;
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    cardService = CardService.getInstance();
    gameService = new GameService(cardService);
    
    // Create test players with proper energy
    player1 = {
      id: 'player1',
      username: 'Player 1',
      stats: {
        health: 30,
        maxHealth: 30,
        energy: 10, // Start with max energy
        maxEnergy: 10,
        bloodMoonMeter: 0,
        shields: 0,
        crystals: 0,
        powerBoost: 0,
        temporaryAttackBoost: 0,
        voidShieldDuration: 0,
        inOverdrive: false
      },
      state: {
        isInBloodMoon: false,
        bloodMoonCharge: 0,
        hasEvasion: false,
        evasionDuration: 0,
        enemiesKilledThisTurn: 0,
        activeEffects: [],
        lastPlayedCard: undefined
      },
      hand: [],
      deck: [],
      discardPile: [],
      battlefield: [],
      isReady: true,
      hasPlayedCard: false
    };

    player2 = {
      id: 'player2',
      username: 'Player 2',
      stats: {
        health: 30,
        maxHealth: 30,
        energy: 10, // Start with max energy
        maxEnergy: 10,
        bloodMoonMeter: 0,
        shields: 0,
        crystals: 0,
        powerBoost: 0,
        temporaryAttackBoost: 0,
        voidShieldDuration: 0,
        inOverdrive: false
      },
      state: {
        isInBloodMoon: false,
        bloodMoonCharge: 0,
        hasEvasion: false,
        evasionDuration: 0,
        enemiesKilledThisTurn: 0,
        activeEffects: [],
        lastPlayedCard: undefined
      },
      hand: [],
      deck: [],
      discardPile: [],
      battlefield: [],
      isReady: true,
      hasPlayedCard: false
    };

    // Initialize game
    game = gameService.initializeGame([player1, player2]);

    // Ensure players have playable cards in their hands
    const player1Index = game.players.findIndex(p => p.id === player1.id);
    const player2Index = game.players.findIndex(p => p.id === player2.id);

    // Add a playable card to player1's hand
    const playableCard = cardService.createCard('BLOOD_1'); // Blood Moon Cultist has cost 2
    game.players[player1Index].hand.push(playableCard);
    game.players[player1Index].stats.energy = 10; // Ensure enough energy

    // Add a card with effects to player1's hand
    const effectCard = cardService.createCard('VOID_3'); // Netherblade Assassin has cost 4
    game.players[player1Index].hand.push(effectCard);
  });

  test('should initialize game with correct starting state', () => {
    expect(game.players).toHaveLength(2);
    expect(game.state.currentPlayerId).toBe(player1.id);
    expect(game.state.currentPhase).toBe('PHASE_ONE');
    expect(game.state.turnCount).toBe(1);
    expect(game.state.phaseChangeCounter).toBe(0);
    expect(game.state.phaseJustChanged).toBe(false);
    expect(game.state.phaseLocked).toBe(false);
    expect(game.state.phaseLockDuration).toBeUndefined();
  });

  test('should give players starting hands', () => {
    const player1Index = game.players.findIndex(p => p.id === player1.id);
    expect(game.players[player1Index].hand.length).toBeGreaterThan(0);
    const player2Index = game.players.findIndex(p => p.id === player2.id);
    expect(game.players[player2Index].hand.length).toBeGreaterThan(0);
  });

  test('should initialize player decks', () => {
    const player1Index = game.players.findIndex(p => p.id === player1.id);
    expect(game.players[player1Index].deck.length).toBeGreaterThan(0);
    const player2Index = game.players.findIndex(p => p.id === player2.id);
    expect(game.players[player2Index].deck.length).toBeGreaterThan(0);
  });

  test('should allow player to play a card when they have enough energy', () => {
    const player1Index = game.players.findIndex(p => p.id === player1.id);
    const playableCard = game.players[player1Index].hand.find(card => card.stats.cost <= 10);
    expect(playableCard).toBeDefined();
    
    if (playableCard) {
      // Initialize game history
      game.history = {
        turns: [{
          turnNumber: 1,
          playerId: player1.id,
          actions: []
        }]
      };

      // Play the card
      const updatedGame = gameService.playCard(game, player1.id, playableCard.id);
      
      // Verify card was moved from hand to battlefield
      const updatedPlayerIndex = updatedGame.players.findIndex(p => p.id === player1.id);
      expect(updatedGame.players[updatedPlayerIndex].hand).not.toContain(playableCard);
      expect(updatedGame.players[updatedPlayerIndex].battlefield).toContainEqual(playableCard);
      
      // Verify energy was spent
      expect(updatedGame.players[updatedPlayerIndex].stats.energy).toBe(10 - playableCard.stats.cost);
    }
  });

  test('should not allow playing a card without enough energy', () => {
    const player1Index = game.players.findIndex(p => p.id === player1.id);
    game.players[player1Index].stats.energy = 1; // Set low energy
    
    const expensiveCard = game.players[player1Index].hand.find(card => card.stats.cost > 1);
    expect(expensiveCard).toBeDefined();
    
    if (expensiveCard) {
      expect(() => {
        gameService.playCard(game, player1.id, expensiveCard.id);
      }).toThrow('Not enough energy');
    }
  });

  test('should apply card effects when played', () => {
    const player1Index = game.players.findIndex(p => p.id === player1.id);
    const effectCard = game.players[player1Index].hand.find(card => card.effects.length > 0);
    expect(effectCard).toBeDefined();
    
    if (effectCard) {
      // Initialize game history
      game.history = {
        turns: [{
          turnNumber: 1,
          playerId: player1.id,
          actions: []
        }]
      };

      const originalHealth = player2.stats.health;
      const updatedGame = gameService.playCard(game, player1.id, effectCard.id);
      
      // Verify effects were applied
      const opponentIndex = updatedGame.players.findIndex(p => p.id === player2.id);
      expect(updatedGame.players[opponentIndex].stats.health).not.toBe(originalHealth);
    }
  });

  test('should switch turns correctly', () => {
    // Initialize game history
    game.history = {
      turns: [{
        turnNumber: 1,
        playerId: player1.id,
        actions: []
      }]
    };

    // Start new turn
    const updatedGame = gameService.startNewTurn(game);
    
    // Verify turn switched to player2
    expect(updatedGame.state.currentPlayerId).toBe(player2.id);
    expect(updatedGame.state.turnCount).toBe(2);
    
    // Verify player2 got energy
    const player2Index = updatedGame.players.findIndex(p => p.id === player2.id);
    expect(updatedGame.players[player2Index].stats.energy).toBe(updatedGame.players[player2Index].stats.maxEnergy);
  });

  test('should change phase after phase duration', () => {
    // Set phase duration to 2 turns
    game.phaseDuration = 2;
    
    // Initialize game history
    game.history = {
      turns: [{
        turnNumber: 1,
        playerId: player1.id,
        actions: []
      }]
    };
    
    // First turn - should stay in PHASE_ONE
    let updatedGame = gameService.startNewTurn(game);
    expect(updatedGame.state.currentPhase).toBe('PHASE_TWO');
    
    // Second turn - should stay in PHASE_TWO
    updatedGame = gameService.startNewTurn(updatedGame);
    expect(updatedGame.state.currentPhase).toBe('PHASE_TWO');
    expect(updatedGame.state.phaseJustChanged).toBe(false);
  });

  test('should track player momentum', () => {
    const player1Index = game.players.findIndex(p => p.id === player1.id);
    const bloodCard = game.players[player1Index].hand.find(card => card.type === CardType.BLOOD);
    
    if (bloodCard) {
      // Initialize game history
      game.history = {
        turns: [{
          turnNumber: 1,
          playerId: player1.id,
          actions: []
        }]
      };

      const updatedGame = gameService.playCard(game, player1.id, bloodCard.id);
      expect(updatedGame.state.playerMomentum[player1.id].PHASE_ONE).toBeGreaterThan(0);
    }
  });

  test('should handle blood moon transformation', () => {
    const player1Index = game.players.findIndex(p => p.id === player1.id);
    game.players[player1Index].stats.bloodMoonMeter = 100;
    game.players[player1Index].state.bloodMoonCharge = 5; // Set to threshold for blood moon activation
    
    // Initialize game history
    game.history = {
      turns: [{
        turnNumber: 1,
        playerId: player1.id,
        actions: []
      }]
    };

    // Add a card that will trigger blood moon transformation
    const bloodMoonCard = cardService.createCard('BLOOD_1'); // Blood Moon Cultist
    game.players[player1Index].hand.push(bloodMoonCard);
    
    // Play the card to trigger transformation
    const updatedGame = gameService.playCard(game, player1.id, bloodMoonCard.id);
    
    // Verify blood moon transformation
    const updatedPlayer1Index = updatedGame.players.findIndex(p => p.id === player1.id);
    expect(updatedGame.players[updatedPlayer1Index].state.isInBloodMoon).toBe(true);
    expect(updatedGame.players[updatedPlayer1Index].state.bloodMoonTurnsLeft).toBe(3);
  });
}); 