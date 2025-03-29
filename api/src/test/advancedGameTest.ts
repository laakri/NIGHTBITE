import { GameService } from '../services/GameService';
import { CardService } from '../services/CardService';
import { createPlayer } from '../models/Player';
import { CardType, Phase, EffectType } from '../models/Card';
import { v4 as uuidv4 } from 'uuid';

// Helper function to create test players
function createTestPlayers() {
  const player1 = createPlayer(uuidv4(), 'Player1');
  const player2 = createPlayer(uuidv4(), 'Player2');
  return [player1, player2];
}

// Test the Phase Surge mechanics
function testPhaseSurge() {
  console.log('=== Testing Phase Surge Mechanics ===');
  
  const gameService = new GameService();
  const cardService = new CardService();
  const players = createTestPlayers();
  
  // Initialize game
  const game = gameService.initializeGame(players);
  
  // Force phase to Day and set phaseJustChanged flag
  game.currentPhase = Phase.DAY;
  game.phaseJustChanged = true;
  
  // Set player energy to ensure they can play cards
  players[0].energy = 10;
  
  // Get a Sun card to test Sun surge
  const sunbeam = cardService.getCardByName('Sunbeam');
  if (!sunbeam) {
    console.error('Test card not found');
    return;
  }
  
  // Add the card to player's hand
  players[0].hand.push({...sunbeam, id: uuidv4()});
  
  // Play the card
  console.log('Playing Sunbeam during Day with Phase Surge active');
  console.log('Original damage:', sunbeam.damage);
  gameService.playCard(game, players[0].id, players[0].hand[0].id);
  
  // Check if phaseJustChanged was reset
  console.log('Phase surge consumed:', !game.phaseJustChanged);
  
  // Now test Moon surge
  console.log('\nTesting Moon Surge:');
  game.currentPhase = Phase.NIGHT;
  game.phaseJustChanged = true;
  
  // Reset to player 1's turn
  game.currentPlayerIndex = 0;
  
  // Make sure player has energy for the next card
  players[0].energy = 10;
  
  // Get a Moon card
  const moonlight = cardService.getCardByName('Moonlight');
  if (!moonlight) {
    console.error('Test card not found');
    return;
  }
  
  // Add the card to player's hand
  players[0].hand.push({...moonlight, id: uuidv4()});
  
  // Play the card
  console.log('Playing Moonlight during Night with Phase Surge active');
  console.log('Player shields before:', players[0].shields);
  gameService.playCard(game, players[0].id, players[0].hand[0].id);
  console.log('Player shields after:', players[0].shields);
  console.log('Phase surge consumed:', !game.phaseJustChanged);
}

// Test the Momentum system
function testMomentum() {
  console.log('\n=== Testing Momentum System ===');
  
  const gameService = new GameService();
  const cardService = new CardService();
  const players = createTestPlayers();
  
  // Initialize game
  const game = gameService.initializeGame(players);
  
  // Clear player hands and add specific cards for testing
  players[0].hand = [];
  players[0].energy = 10; // Give enough energy
  
  // Add 3 Sun cards to test Sun momentum
  const sunbeam = cardService.getCardByName('Sunbeam');
  if (!sunbeam) {
    console.error('Test card not found');
    return;
  }
  
  for (let i = 0; i < 3; i++) {
    players[0].hand.push({...sunbeam, id: uuidv4()});
  }
  
  // Play the cards one by one
  console.log('Playing 3 Sun cards to trigger Sun Momentum');
  console.log('Opponent burn damage before:', players[1].burnDamage);
  
  // First card
  game.currentPlayerIndex = 0; // Ensure it's player 0's turn
  gameService.playCard(game, players[0].id, players[0].hand[0].id);
  console.log(`Sun momentum after card 1:`, game.playerMomentum[players[0].id].sun);
  
  // Second card - need to reset turn to player 0
  game.currentPlayerIndex = 0;
  players[0].energy = 10; // Replenish energy
  gameService.playCard(game, players[0].id, players[0].hand[0].id);
  console.log(`Sun momentum after card 2:`, game.playerMomentum[players[0].id].sun);
  
  // Third card - need to reset turn to player 0
  game.currentPlayerIndex = 0;
  players[0].energy = 10; // Replenish energy
  gameService.playCard(game, players[0].id, players[0].hand[0].id);
  console.log(`Sun momentum after card 3:`, game.playerMomentum[players[0].id].sun);
  
  console.log('Opponent burn damage after:', players[1].burnDamage);
  
  // Test Moon momentum
  console.log('\nTesting Moon Momentum:');
  
  // Reset game state
  players[0].hand = [];
  game.playerMomentum[players[0].id] = { sun: 0, moon: 0, eclipse: 0 };
  
  // Add 3 Moon cards
  const moonlight = cardService.getCardByName('Moonlight');
  if (!moonlight) {
    console.error('Test card not found');
    return;
  }
  
  for (let i = 0; i < 3; i++) {
    players[0].hand.push({...moonlight, id: uuidv4()});
  }
  
  // Play the cards one by one
  console.log('Playing 3 Moon cards to trigger Moon Momentum');
  console.log('Player shields before:', players[0].shields);
  
  // First card
  game.currentPlayerIndex = 0; // Ensure it's player 0's turn
  players[0].energy = 10; // Replenish energy
  gameService.playCard(game, players[0].id, players[0].hand[0].id);
  console.log(`Moon momentum after card 1:`, game.playerMomentum[players[0].id].moon);
  
  // Second card
  game.currentPlayerIndex = 0;
  players[0].energy = 10; // Replenish energy
  gameService.playCard(game, players[0].id, players[0].hand[0].id);
  console.log(`Moon momentum after card 2:`, game.playerMomentum[players[0].id].moon);
  
  // Third card
  game.currentPlayerIndex = 0;
  players[0].energy = 10; // Replenish energy
  gameService.playCard(game, players[0].id, players[0].hand[0].id);
  console.log(`Moon momentum after card 3:`, game.playerMomentum[players[0].id].moon);
  
  console.log('Player shields after:', players[0].shields);
}

// Test Secret Cards
function testSecretCards() {
  console.log('\n=== Testing Secret Cards ===');
  
  const gameService = new GameService();
  const cardService = new CardService();
  const players = createTestPlayers();
  
  // Initialize game
  const game = gameService.initializeGame(players);
  
  // Clear player hands
  players[0].hand = [];
  players[1].hand = [];
  players[0].energy = 10;
  players[1].energy = 10;
  
  // Add a secret card to player 1's hand
  const solarTrap = cardService.getCardByName('Solar Trap');
  if (!solarTrap) {
    console.error('Test card not found');
    return;
  }
  
  const solarTrapWithId = {...solarTrap, id: uuidv4()};
  players[0].hand.push(solarTrapWithId);
  
  // Ensure it's player 0's turn
  game.currentPlayerIndex = 0;
  
  // Play the secret card
  console.log('Playing Solar Trap as a secret card');
  gameService.playSecretCard(game, players[0].id, solarTrapWithId.id);
  
  console.log('Secret cards in play:', game.secretCards.length);
  
  // Now it should be player 1's turn after playing the secret card
  
  // Add a Moon card to player 2's hand to trigger the trap
  const moonlight = cardService.getCardByName('Moonlight');
  if (!moonlight) {
    console.error('Test card not found');
    return;
  }
  
  const moonlightWithId = {...moonlight, id: uuidv4()};
  players[1].hand.push(moonlightWithId);
  
  // Player 2 plays the Moon card, which should trigger the trap
  console.log('\nPlayer 2 plays a Moon card, which should trigger Solar Trap');
  console.log('Player 2 HP before:', players[1].hp);
  gameService.playCard(game, players[1].id, moonlightWithId.id);
  console.log('Player 2 HP after:', players[1].hp);
  console.log('Secret cards remaining:', game.secretCards.length);
}

// Test Hero Powers
function testHeroPowers() {
  console.log('\n=== Testing Hero Powers ===');
  
  const gameService = new GameService();
  const cardService = new CardService();
  const players = createTestPlayers();
  
  // Initialize game
  const game = gameService.initializeGame(players);
  
  // Set hero powers
  players[0].heroPower = 'Dawncaller';
  players[1].heroPower = 'Midnight Reaper';
  
  console.log('Testing Dawncaller hero power:');
  
  // Clear player hands
  players[0].hand = [];
  players[0].energy = 3;
  
  // Ensure it's player 0's turn
  game.currentPlayerIndex = 0;
  
  // Add a Sun card to player 1's hand
  const sunbeam = cardService.getCardByName('Sunbeam');
  if (!sunbeam) {
    console.error('Test card not found');
    return;
  }
  
  const sunbeamWithId = {...sunbeam, id: uuidv4()};
  players[0].hand.push(sunbeamWithId);
  
  // Play the Sun card with Dawncaller power
  console.log('Original card cost:', sunbeam.cost);
  console.log('Player energy before:', players[0].energy);
  gameService.playCard(game, players[0].id, players[0].hand[0].id);
  console.log('Player energy after:', players[0].energy);
  
  console.log('\nTesting Midnight Reaper hero power:');
  
  // Now it should be player 1's turn
  
  // Add a discard card to player 2's hand
  const nightmareWeaver = cardService.getCardByName('Nightmare Weaver');
  if (!nightmareWeaver) {
    console.error('Test card not found');
    return;
  }
  
  // Add some cards to player 1's hand to be discarded
  players[0].hand.push({...sunbeam, id: uuidv4()});
  
  // Give player 1 enough energy for Nightmare Weaver (which costs 3)
  players[1].energy = 10;
  
  const nightmareWeaverWithId = {...nightmareWeaver, id: uuidv4()};
  players[1].hand.push(nightmareWeaverWithId);
  
  // Play the discard card with Midnight Reaper power
  console.log('Player 1 HP before:', players[0].hp);
  gameService.playCard(game, players[1].id, nightmareWeaverWithId.id);
  console.log('Player 1 HP after:', players[0].hp);
}

// Test Overdrive system
function testOverdrive() {
  console.log('\n=== Testing Overdrive System ===');
  
  const gameService = new GameService();
  const cardService = new CardService();
  const players = createTestPlayers();
  
  // Initialize game
  const game = gameService.initializeGame(players);
  
  // Set player 1 HP to trigger Overdrive
  players[0].hp = 5;
  players[0].inOverdrive = true;
  
  // Clear player hands
  players[0].hand = [];
  players[0].energy = 3;
  
  // Ensure it's player 0's turn
  game.currentPlayerIndex = 0;
  
  // Add an expensive card to player 1's hand
  const solarFlare = cardService.getCardByName('Solar Flare');
  if (!solarFlare) {
    console.error('Test card not found');
    return;
  }
  
  const solarFlareWithId = {...solarFlare, id: uuidv4()};
  players[0].hand.push(solarFlareWithId);
  
  // Play the card with Overdrive active
  console.log('Original card cost:', solarFlare.cost);
  console.log('Player energy before:', players[0].energy);
  gameService.playCard(game, players[0].id, solarFlareWithId.id);
  console.log('Player energy after:', players[0].energy);
  
  // Test increased damage in Overdrive
  console.log('\nTesting increased damage taken in Overdrive:');
  
  // Now it should be player 1's turn
  
  // Add a damage card to player 2's hand
  const sunbeam = cardService.getCardByName('Sunbeam');
  if (!sunbeam) {
    console.error('Test card not found');
    return;
  }
  
  const sunbeamWithId = {...sunbeam, id: uuidv4()};
  players[1].hand.push(sunbeamWithId);
  
  // Play the damage card against a player in Overdrive
  console.log('Player 1 HP before:', players[0].hp);
  gameService.playCard(game, players[1].id, sunbeamWithId.id);
  console.log('Player 1 HP after:', players[0].hp);
}

// Run all tests
function runAllTests() {
  testPhaseSurge();
  testMomentum();
  testSecretCards();
  testHeroPowers();
  testOverdrive();
  
  console.log('\n=== All tests completed ===');
}

// Run the tests
runAllTests();
