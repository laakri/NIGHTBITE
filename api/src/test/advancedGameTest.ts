import { RoomService } from '../services/RoomService';
import { CardService } from '../services/CardService';
import { GameService } from '../services/GameService';
import {  createPlayer } from '../models/Player';
import {  CardType, Phase, EffectType, type Card } from '../models/Card';
import { v4 as uuidv4 } from 'uuid';

// Create services
const roomService = new RoomService();
const cardService = new CardService();
const gameService = new GameService();

// Function to log the game state in a readable format
function logGameState(gameState: any): void {
  console.log('\n==== GAME STATE ====');
  console.log(`Phase: ${gameState.currentPhase}`);
  console.log(`Turn: ${gameState.turnCount}`);
  console.log(`Current Player: ${gameState.isYourTurn ? 'Player 1' : 'Player 2'}`);
  
  console.log('\nPlayer 1:');
  console.log(`  HP: ${gameState.player.hp}`);
  console.log(`  Hand: ${gameState.player.hand.length} cards`);
  console.log(`  Deck: ${gameState.player.deckSize} cards`);
  
  console.log('\nPlayer 2:');
  console.log(`  HP: ${gameState.opponent.hp}`);
  console.log(`  Hand: ${gameState.opponent.handSize} cards`);
  console.log(`  Deck: ${gameState.opponent.deckSize} cards`);
  
  console.log('\nCards in hand:');
  gameState.player.hand.forEach((card: any, index: number) => {
    console.log(`  ${index + 1}. ${card.name} (${card.type}) - Damage: ${card.damage}, Healing: ${card.healing}`);
    if (card.description) {
      console.log(`     Description: ${card.description}`);
    }
  });
  
  if (gameState.isGameOver) {
    console.log(`\nGAME OVER! Winner: ${gameState.winner.username}`);
  }
  console.log('====================\n');
}

// Create predefined cards for testing
function createTestCards(): Card[] {
  return [
    {
      id: uuidv4(),
      name: 'Solar Blast',
      type: CardType.SUN,
      description: 'Deal 6 damage. If in Day phase, deal 9 damage instead.',
      damage: 6,
      healing: 0,
      effects: []
    },
    {
      id: uuidv4(),
      name: 'Lunar Healing',
      type: CardType.NIGHT,
      description: 'Heal 4 HP. If in Night phase, heal 6 HP instead.',
      damage: 0,
      healing: 4,
      effects: []
    },
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
      name: 'Solar Flare',
      type: CardType.SUN,
      description: 'Deal 4 damage and draw a card.',
      damage: 4,
      healing: 0,
      effects: [{ type: EffectType.DRAW, value: 1 }]
    },
    {
      id: uuidv4(),
      name: 'Moonlight Strike',
      type: CardType.NIGHT,
      description: 'Deal 3 damage and heal 2 HP.',
      damage: 3,
      healing: 2,
      effects: []
    }
  ];
}

// Run a test game with predefined cards and moves
async function runAdvancedTestGame() {
  console.log('Starting advanced test game...');
  
  // Create a room
  const room = roomService.createRoom('Advanced Test Room');
  console.log(`Room created: ${room.id}`);
  
  // Create two players
  const player1 = createPlayer('player1', 'Alice');
  const player2 = createPlayer('player2', 'Bob');
  
  // Add players to the room
  room.players.push(player1);
  room.players.push(player2);
  
  // Start the game
  roomService.startGame(room.id);
  console.log('Game started!');
  
  // Override the initial phase for testing
  if (room.game) {
    room.game.currentPhase = Phase.DAY;
  }
  
  // Replace players' hands with predefined cards for testing
  const testCards = createTestCards();
  
  // Give player 1 specific cards
  player1.hand = [
    { ...testCards[0] }, // Solar Blast
    { ...testCards[2] }, // Phase Shift
    { ...testCards[3] }  // Solar Flare
  ];
  
  // Give player 2 specific cards
  player2.hand = [
    { ...testCards[1] }, // Lunar Healing
    { ...testCards[4] }, // Moonlight Strike
    { ...testCards[2] }  // Phase Shift
  ];
  
  // Get initial game state
  let gameState1 = roomService.getGameState(room.id, player1.id);
  let gameState2 = roomService.getGameState(room.id, player2.id);
  
  console.log('Initial game state for Player 1:');
  logGameState(gameState1);
  
  // Simulate specific moves
  console.log('\n----- TURN 1 -----');
  console.log("Alice's turn (Phase: DAY)");
  console.log('Alice plays: Solar Blast (SUN) - should do 9 damage in Day phase');
  roomService.playCard(room.id, player1.id, player1.hand[0].id);
  
  // Get updated game states
  gameState1 = roomService.getGameState(room.id, player1.id);
  gameState2 = roomService.getGameState(room.id, player2.id);
  console.log(`After Alice's move: Alice's HP: ${gameState1.player.hp}, Bob's HP: ${gameState2.player.hp}`);
  
  console.log('\n----- TURN 2 -----');
  console.log("Bob's turn (Phase: DAY)");
  console.log('Bob plays: Lunar Healing (NIGHT) - should heal 4 HP in Day phase');
  roomService.playCard(room.id, player2.id, player2.hand[0].id);
  
  // Get updated game states
  gameState1 = roomService.getGameState(room.id, player1.id);
  gameState2 = roomService.getGameState(room.id, player2.id);
  console.log(`After Bob's move: Alice's HP: ${gameState1.player.hp}, Bob's HP: ${gameState2.player.hp}`);
  
  console.log('\n----- TURN 3 -----');
  console.log("Alice's turn (Phase: DAY)");
  console.log('Alice plays: Phase Shift (ECLIPSE) - should switch to Night phase');
  roomService.playCard(room.id, player1.id, player1.hand[0].id);
  
  // Get updated game states
  gameState1 = roomService.getGameState(room.id, player1.id);
  gameState2 = roomService.getGameState(room.id, player2.id);
  console.log(`After Alice's move: Current Phase: ${gameState1.currentPhase}`);
  
  console.log('\n----- TURN 4 -----');
  console.log("Bob's turn (Phase: NIGHT)");
  console.log('Bob plays: Moonlight Strike (NIGHT) - should do 3 damage and heal 3 HP in Night phase');
  roomService.playCard(room.id, player2.id, player2.hand[0].id);
  
  // Get updated game states
  gameState1 = roomService.getGameState(room.id, player1.id);
  gameState2 = roomService.getGameState(room.id, player2.id);
  console.log(`After Bob's move: Alice's HP: ${gameState1.player.hp}, Bob's HP: ${gameState2.player.hp}`);
  
  // Final game state
  console.log('\n----- FINAL GAME STATE -----');
  gameState1 = roomService.getGameState(room.id, player1.id);
  logGameState(gameState1);
}

// Run the test
runAdvancedTestGame().catch(error => {
  console.error('Error running advanced test game:', error);
}); 