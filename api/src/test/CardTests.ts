import { CardEffectTestService } from '../services/CardEffectTestService';
import { NORMAL_CARDS } from '../cards/NormalCards';
import { EffectType } from '../models/Effect';
import fs from 'fs';
import path from 'path';

// Define interfaces for report data
interface EffectSummary {
  count: number;
  cards: {
    id: string;
    name: string;
    value: number;
  }[];
}

interface CardReport {
  name: string;
  type: string;
  description: string;
  success: boolean;
  message: string;
  effects: {
    type: string;
    value: number;
    trigger: string;
  }[];
  stateChanges: any;
  error: string | null;
}

interface TestReport {
  testTime: string;
  summary: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
  };
  cardResults: Record<string, CardReport>;
}

/**
 * Test runner for card effects
 * This script tests each card's effects and logs the results
 */
async function runCardTests() {
  console.log('Starting card effect tests...');
  
  const testService = new CardEffectTestService();
  const cardIds = Object.keys(NORMAL_CARDS);
  
  console.log(`Found ${cardIds.length} cards to test`);
  
  // Run tests for all cards
  const results = testService.testAllCards();
  
  console.log(`Tests completed. Success: ${results.successCount}, Failed: ${results.failCount}`);
  
  // Generate detailed report for each card
  const reportData: TestReport = {
    testTime: new Date().toISOString(),
    summary: {
      total: results.totalTests,
      success: results.successCount,
      failed: results.failCount,
      successRate: (results.successCount / results.totalTests) * 100
    },
    cardResults: {}
  };
  
  // Process individual card results
  for (const cardId of Object.keys(results.results)) {
    const result = results.results[cardId];
    const card = NORMAL_CARDS[cardId];
    
    const cardReport: CardReport = {
      name: card.name,
      type: card.type,
      description: card.description,
      success: result.success,
      message: result.message,
      effects: card.effects.map(effect => ({
        type: effect.type,
        value: effect.value || 0,
        trigger: effect.trigger
      })),
      stateChanges: result.stateChanges || null,
      error: result.error ? result.error.message : null
    };
    
    reportData.cardResults[cardId] = cardReport;
    
    // Log summary for this card
    if (result.success) {
      console.log(`✅ ${card.name}: Success`);
      
      // Log state changes for successful tests
      if (result.stateChanges) {
        // Player 1 changes (card player)
        const p1 = result.stateChanges.player1;
        if (p1.bloodEnergy) {
          console.log(`  - Blood Energy: ${p1.bloodEnergy.from} -> ${p1.bloodEnergy.to}`);
        }
        if (p1.bloodMoonMeter) {
          console.log(`  - Blood Moon Meter: ${p1.bloodMoonMeter.from} -> ${p1.bloodMoonMeter.to}`);
        }
        if (p1.health) {
          console.log(`  - Health: ${p1.health.from} -> ${p1.health.to}`);
        }
        if (p1.shields) {
          console.log(`  - Shields: ${p1.shields.from} -> ${p1.shields.to}`);
        }
        if (p1.battlefieldSize) {
          console.log(`  - Battlefield Size: ${p1.battlefieldSize.from} -> ${p1.battlefieldSize.to}`);
        }
        
        // Player 2 changes (target player)
        const p2 = result.stateChanges.player2;
        if (p2.health) {
          console.log(`  - Target Health: ${p2.health.from} -> ${p2.health.to}`);
        }
        if (p2.shields) {
          console.log(`  - Target Shields: ${p2.shields.from} -> ${p2.shields.to}`);
        }
        
        // Effects added
        if (p1.activeEffectsAdded.length > 0) {
          console.log(`  - Added Effects: ${p1.activeEffectsAdded.map(e => e.type).join(', ')}`);
        }
      }
    } else {
      console.log(`❌ ${card.name}: Failed - ${result.message}`);
    }
  }
  
  // Save test results to file
  const reportsDir = path.join(__dirname, '../../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportFilePath = path.join(reportsDir, `card-tests-${Date.now()}.json`);
  fs.writeFileSync(reportFilePath, JSON.stringify(reportData, null, 2));
  
  console.log(`Test report saved to ${reportFilePath}`);
  
  // Generate a summary of card effects by type
  const effectTypeSummary: Record<string, EffectSummary> = {};
  
  for (const cardId of Object.keys(NORMAL_CARDS)) {
    const card = NORMAL_CARDS[cardId];
    for (const effect of card.effects) {
      const effectTypeKey = effect.type as string;
      
      if (!effectTypeSummary[effectTypeKey]) {
        effectTypeSummary[effectTypeKey] = {
          count: 0,
          cards: []
        };
      }
      
      effectTypeSummary[effectTypeKey].count++;
      effectTypeSummary[effectTypeKey].cards.push({
        id: cardId,
        name: card.name,
        value: effect.value || 0
      });
    }
  }
  
  console.log('\nEffect Type Summary:');
  for (const [effectType, data] of Object.entries(effectTypeSummary)) {
    console.log(`${effectType}: ${data.count} occurrences`);
  }
  
  const summaryFilePath = path.join(reportsDir, `effect-summary-${Date.now()}.json`);
  fs.writeFileSync(summaryFilePath, JSON.stringify(effectTypeSummary, null, 2));
}

// Execute tests
runCardTests().catch(error => {
  console.error('Error running card tests:', error);
  process.exit(1);
}); 