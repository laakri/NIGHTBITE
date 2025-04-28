import { CardEffectTestService } from '../services/CardEffectTestService';
import { NORMAL_CARDS } from '../cards/NormalCards';

// The cards we want to test
const CARDS_TO_TEST = [
  'IRONCLAD_DEFENDER',  // Tests shield and healing effects
  'ARCANE_SCHOLAR',     // Tests draw effect
  'FROST_CHANNELER',    // Tests direct damage
  'SHADOW_INFILTRATOR', // Tests attack effects
  'LEGION_COMMANDER',   // Tests aura effects
  'ARCHMAGE_LUMINAR',   // Tests cost reduction
  'CELESTIAL_ARBITER'   // Tests multiple effects
];

async function testSpecificCards() {
  console.log('Testing specific cards to verify effect implementation...\n');
  
  const testService = new CardEffectTestService();
  
  // Test each card individually and show detailed results
  for (const cardId of CARDS_TO_TEST) {
    console.log(`Testing card: ${NORMAL_CARDS[cardId].name} (${cardId})`);
    console.log(`Type: ${NORMAL_CARDS[cardId].type}, Rarity: ${NORMAL_CARDS[cardId].rarity}`);
    console.log(`Description: ${NORMAL_CARDS[cardId].description}`);
    console.log('Effects:');
    
    NORMAL_CARDS[cardId].effects.forEach((effect, index) => {
      console.log(`  ${index + 1}. ${effect.type} (Value: ${effect.value}, Trigger: ${effect.trigger})`);
    });
    
    try {
      const result = testService.testCard(cardId);
      
      if (result.success) {
        console.log('\n✅ Test PASSED');
        
        // Display state changes
        if (result.stateChanges) {
          console.log('\nState changes:');
          
          // Player 1 (card player) changes
          const p1 = result.stateChanges.player1;
          if (p1.bloodEnergy) {
            console.log(`  Blood Energy: ${p1.bloodEnergy.from} -> ${p1.bloodEnergy.to}`);
          }
          if (p1.health) {
            console.log(`  Health: ${p1.health.from} -> ${p1.health.to}`);
          }
          if (p1.shields) {
            console.log(`  Shields: ${p1.shields.from} -> ${p1.shields.to}`);
          }
          if (p1.handSize) {
            console.log(`  Hand Size: ${p1.handSize.from} -> ${p1.handSize.to}`);
          }
          if (p1.battlefieldSize) {
            console.log(`  Battlefield Size: ${p1.battlefieldSize.from} -> ${p1.battlefieldSize.to}`);
          }
          
          // Player 2 (target player) changes
          const p2 = result.stateChanges.player2;
          if (p2.health) {
            console.log(`  Target Health: ${p2.health.from} -> ${p2.health.to}`);
          }
          if (p2.shields) {
            console.log(`  Target Shields: ${p2.shields.from} -> ${p2.shields.to}`);
          }
          
          // New effect results
          if (result.stateChanges.newEffectResults.length > 0) {
            console.log('\n  Applied effects:');
            result.stateChanges.newEffectResults.forEach(effect => {
              console.log(`    - ${effect.type} (Value: ${effect.value})`);
            });
          }
        }
      } else {
        console.log(`\n❌ Test FAILED: ${result.message}`);
        if (result.error) {
          console.log(`Error: ${result.error.message}`);
          console.log(result.error.stack);
        }
      }
      
      console.log('\n' + '-'.repeat(80) + '\n');
    } catch (error) {
      console.error(`Error testing card ${cardId}:`, error);
    }
  }
  
  // Summary
  console.log('Test Summary:');
  const batchResult = testService.testCards(CARDS_TO_TEST);
  console.log(`Total Cards: ${batchResult.totalTests}`);
  console.log(`Successful: ${batchResult.successCount}`);
  console.log(`Failed: ${batchResult.failCount}`);
  console.log(`Success Rate: ${(batchResult.successCount / batchResult.totalTests * 100).toFixed(1)}%`);
  
  if (batchResult.failCount > 0) {
    console.log('\nFailed cards:');
    Object.entries(batchResult.results)
      .filter(([_, result]) => !result.success)
      .forEach(([cardId, result]) => {
        console.log(`- ${NORMAL_CARDS[cardId].name}: ${result.message}`);
      });
  }
}

// Run the tests
testSpecificCards().catch(error => {
  console.error('Error running card tests:', error);
  process.exit(1);
}); 