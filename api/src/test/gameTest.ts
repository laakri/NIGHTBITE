import { RoomService } from '../services/RoomService';
import { CardService } from '../services/CardService';
import { GameService } from '../services/GameService';
import { createPlayer } from '../models/Player';
import { Phase } from '../models/Card';

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

// Run a test game
async function runTestGame() {
  console.log('Starting test game...');
  
  // Create a room
  const room = roomService.createRoom('Test Room');
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
  
  // Get initial game state
  let gameState1 = roomService.getGameState(room.id, player1.id);
  let gameState2 = roomService.getGameState(room.id, player2.id);
  
  console.log('Initial game state for Player 1:');
  logGameState(gameState1);
  
  console.log('Initial game state for Player 2:');
  logGameState(gameState2);
  
  // Simulate several turns
  for (let turn = 0; turn < 10; turn++) {
    console.log(`\n----- TURN ${turn + 1} -----`);
    
    // Get current player and their game state
    const currentPlayerId = room.game!.currentPlayerIndex === 0 ? player1.id : player2.id;
    const currentPlayerName = room.game!.currentPlayerIndex === 0 ? 'Alice' : 'Bob';
    const gameState = roomService.getGameState(room.id, currentPlayerId);
    
    console.log(`${currentPlayerName}'s turn (Phase: ${room.game!.currentPhase})`);
    
    // Choose a card to play (for simplicity, always play the first card in hand)
    if (gameState.player.hand.length > 0) {
      const cardToPlay = gameState.player.hand[0];
      console.log(`${currentPlayerName} plays: ${cardToPlay.name} (${cardToPlay.type})`);
      
      // Play the card
      roomService.playCard(room.id, currentPlayerId, cardToPlay.id);
      
      // Get updated game states
      gameState1 = roomService.getGameState(room.id, player1.id);
      gameState2 = roomService.getGameState(room.id, player2.id);
      
      console.log(`\nAfter ${currentPlayerName}'s move:`);
      console.log(`Alice's HP: ${gameState1.player.hp}, Bob's HP: ${gameState1.opponent.hp}`);
      
      // Check if game is over
      if (room.game!.isGameOver) {
        console.log(`\nGAME OVER! ${room.game!.winner!.username} wins!`);
        break;
      }
    } else {
      console.log(`${currentPlayerName} has no cards to play!`);
    }
  }
  
  // Final game state
  console.log('\n----- FINAL GAME STATE -----');
  gameState1 = roomService.getGameState(room.id, player1.id);
  logGameState(gameState1);
}

// Run the test
runTestGame().catch(error => {
  console.error('Error running test game:', error);
}); 