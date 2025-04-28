import { CardEffectTestService } from '../services/CardEffectTestService';
import { NORMAL_CARDS } from '../cards/NormalCards';
import { CardType, CardRarity, Phase } from '../models/Card';
import { EffectType } from '../models/Effect';
import fs from 'fs';
import path from 'path';

/**
 * Card Balance Analysis Script
 * 
 * This script:
 * 1. Runs tests for all cards to verify their effects work
 * 2. Analyzes card balance across types, rarities, and effects
 * 3. Provides recommendations for improving game balance
 */

// Define balance metrics
interface CardBalanceMetrics {
  averageAttack: number;
  averageHealth: number;
  attackHealthRatio: number;
  effectsPerCard: number;
  energyGeneration: number;
  damagePerMana: number; // Damage efficiency
  healingPerMana: number; // Healing efficiency
  effectivenessByPhase: {
    [key: string]: {
      attackBonus: number;
      healthBonus: number;
      specialEffects: number;
    }
  };
}

// Define balance analysis by card type and rarity
interface BalanceAnalysis {
  byType: Record<string, CardBalanceMetrics>;
  byRarity: Record<string, CardBalanceMetrics>;
  overallMetrics: CardBalanceMetrics;
  imbalances: string[];
  recommendations: string[];
}

/**
 * Analyze card balance based on card types, rarities, and effects
 */
function analyzeCardBalance(): BalanceAnalysis {
  console.log('Analyzing card balance...');
  
  // Initialize balance metrics
  const defaultMetrics = (): CardBalanceMetrics => ({
    averageAttack: 0,
    averageHealth: 0,
    attackHealthRatio: 0,
    effectsPerCard: 0,
    energyGeneration: 0,
    damagePerMana: 0,
    healingPerMana: 0,
    effectivenessByPhase: {
      [Phase.Normal]: { attackBonus: 0, healthBonus: 0, specialEffects: 0 },
      [Phase.BloodMoon]: { attackBonus: 0, healthBonus: 0, specialEffects: 0 },
      [Phase.Void]: { attackBonus: 0, healthBonus: 0, specialEffects: 0 }
    }
  });
  
  // Get all used card types and rarities from the cards
  const usedCardTypes = new Set<string>();
  const usedCardRarities = new Set<string>();
  
  // Find all used card types and rarities
  for (const card of Object.values(NORMAL_CARDS)) {
    usedCardTypes.add(card.type);
    usedCardRarities.add(card.rarity);
  }
  
  // Initialize analysis structure with detected card types and rarities
  const byType: Record<string, CardBalanceMetrics> = {};
  const byRarity: Record<string, CardBalanceMetrics> = {};
  
  usedCardTypes.forEach(type => {
    byType[type] = defaultMetrics();
  });
  
  usedCardRarities.forEach(rarity => {
    byRarity[rarity] = defaultMetrics();
  });
  
  const analysis: BalanceAnalysis = {
    byType,
    byRarity,
    overallMetrics: defaultMetrics(),
    imbalances: [],
    recommendations: []
  };
  
  // Counters for aggregation - only track card types and rarities that actually exist in the cards
  const cardCountByType: Record<string, number> = {};
  const cardCountByRarity: Record<string, number> = {};
  
  usedCardTypes.forEach(type => {
    cardCountByType[type] = 0;
  });
  
  usedCardRarities.forEach(rarity => {
    cardCountByRarity[rarity] = 0;
  });
  
  let totalCards = 0;
  
  // Gather initial metrics
  for (const cardId of Object.keys(NORMAL_CARDS)) {
    const card = NORMAL_CARDS[cardId];
    totalCards++;
    
    // Update counters
    cardCountByType[card.type]++;
    cardCountByRarity[card.rarity]++;
    
    // Track stats for overall metrics
    analysis.overallMetrics.averageAttack += card.stats.attack;
    analysis.overallMetrics.averageHealth += card.stats.health;
    analysis.overallMetrics.effectsPerCard += card.effects.length;
    analysis.overallMetrics.energyGeneration += card.stats.bloodMoonEnergy || 0;
    
    // Track stats by type
    analysis.byType[card.type].averageAttack += card.stats.attack;
    analysis.byType[card.type].averageHealth += card.stats.health;
    analysis.byType[card.type].effectsPerCard += card.effects.length;
    analysis.byType[card.type].energyGeneration += card.stats.bloodMoonEnergy || 0;
    
    // Track stats by rarity
    analysis.byRarity[card.rarity].averageAttack += card.stats.attack;
    analysis.byRarity[card.rarity].averageHealth += card.stats.health;
    analysis.byRarity[card.rarity].effectsPerCard += card.effects.length;
    analysis.byRarity[card.rarity].energyGeneration += card.stats.bloodMoonEnergy || 0;
    
    // Track phase-specific bonuses
    for (const phase of Object.values(Phase)) {
      const phaseEffect = card.stats.phaseEffects?.[phase];
      if (phaseEffect) {
        if (phaseEffect.attackBonus) {
          if (!analysis.overallMetrics.effectivenessByPhase[phase]) {
            analysis.overallMetrics.effectivenessByPhase[phase] = { attackBonus: 0, healthBonus: 0, specialEffects: 0 };
          }
          
          if (!analysis.byType[card.type].effectivenessByPhase[phase]) {
            analysis.byType[card.type].effectivenessByPhase[phase] = { attackBonus: 0, healthBonus: 0, specialEffects: 0 };
          }
          
          if (!analysis.byRarity[card.rarity].effectivenessByPhase[phase]) {
            analysis.byRarity[card.rarity].effectivenessByPhase[phase] = { attackBonus: 0, healthBonus: 0, specialEffects: 0 };
          }
          
          analysis.overallMetrics.effectivenessByPhase[phase].attackBonus += phaseEffect.attackBonus;
          analysis.byType[card.type].effectivenessByPhase[phase].attackBonus += phaseEffect.attackBonus;
          analysis.byRarity[card.rarity].effectivenessByPhase[phase].attackBonus += phaseEffect.attackBonus;
        }
        
        if (phaseEffect.healthBonus) {
          if (!analysis.overallMetrics.effectivenessByPhase[phase]) {
            analysis.overallMetrics.effectivenessByPhase[phase] = { attackBonus: 0, healthBonus: 0, specialEffects: 0 };
          }
          
          if (!analysis.byType[card.type].effectivenessByPhase[phase]) {
            analysis.byType[card.type].effectivenessByPhase[phase] = { attackBonus: 0, healthBonus: 0, specialEffects: 0 };
          }
          
          if (!analysis.byRarity[card.rarity].effectivenessByPhase[phase]) {
            analysis.byRarity[card.rarity].effectivenessByPhase[phase] = { attackBonus: 0, healthBonus: 0, specialEffects: 0 };
          }
          
          analysis.overallMetrics.effectivenessByPhase[phase].healthBonus += phaseEffect.healthBonus;
          analysis.byType[card.type].effectivenessByPhase[phase].healthBonus += phaseEffect.healthBonus;
          analysis.byRarity[card.rarity].effectivenessByPhase[phase].healthBonus += phaseEffect.healthBonus;
        }
        
        if (phaseEffect.specialEffect) {
          if (!analysis.overallMetrics.effectivenessByPhase[phase]) {
            analysis.overallMetrics.effectivenessByPhase[phase] = { attackBonus: 0, healthBonus: 0, specialEffects: 0 };
          }
          
          if (!analysis.byType[card.type].effectivenessByPhase[phase]) {
            analysis.byType[card.type].effectivenessByPhase[phase] = { attackBonus: 0, healthBonus: 0, specialEffects: 0 };
          }
          
          if (!analysis.byRarity[card.rarity].effectivenessByPhase[phase]) {
            analysis.byRarity[card.rarity].effectivenessByPhase[phase] = { attackBonus: 0, healthBonus: 0, specialEffects: 0 };
          }
          
          analysis.overallMetrics.effectivenessByPhase[phase].specialEffects++;
          analysis.byType[card.type].effectivenessByPhase[phase].specialEffects++;
          analysis.byRarity[card.rarity].effectivenessByPhase[phase].specialEffects++;
        }
      }
    }
    
    // Track damage and healing effects for efficiency calculation
    for (const effect of card.effects) {
      if (effect.type === EffectType.DIRECT_DAMAGE || effect.type === EffectType.AREA_DAMAGE || effect.type === EffectType.VOID_DAMAGE) {
        const damageValue = effect.value || 0;
        
        analysis.overallMetrics.damagePerMana += damageValue;
        analysis.byType[card.type].damagePerMana += damageValue;
        analysis.byRarity[card.rarity].damagePerMana += damageValue;
      }
      
      if (effect.type === EffectType.HEALING) {
        const healingValue = effect.value || 0;
        
        analysis.overallMetrics.healingPerMana += healingValue;
        analysis.byType[card.type].healingPerMana += healingValue;
        analysis.byRarity[card.rarity].healingPerMana += healingValue;
      }
    }
  }
  
  // Calculate average metrics for overall
  analysis.overallMetrics.averageAttack /= totalCards;
  analysis.overallMetrics.averageHealth /= totalCards;
  analysis.overallMetrics.attackHealthRatio = analysis.overallMetrics.averageAttack / analysis.overallMetrics.averageHealth;
  analysis.overallMetrics.effectsPerCard /= totalCards;
  analysis.overallMetrics.energyGeneration /= totalCards;
  
  // Calculate average metrics by type
  for (const type of usedCardTypes) {
    const count = cardCountByType[type];
    if (count > 0) {
      analysis.byType[type].averageAttack /= count;
      analysis.byType[type].averageHealth /= count;
      analysis.byType[type].attackHealthRatio = analysis.byType[type].averageAttack / analysis.byType[type].averageHealth;
      analysis.byType[type].effectsPerCard /= count;
      analysis.byType[type].energyGeneration /= count;
      analysis.byType[type].damagePerMana /= count;
      analysis.byType[type].healingPerMana /= count;
      
      // Calculate phase effectiveness
      for (const phase of Object.values(Phase)) {
        if (analysis.byType[type].effectivenessByPhase[phase]) {
          analysis.byType[type].effectivenessByPhase[phase].attackBonus /= count;
          analysis.byType[type].effectivenessByPhase[phase].healthBonus /= count;
          analysis.byType[type].effectivenessByPhase[phase].specialEffects /= count;
        }
      }
    }
  }
  
  // Calculate average metrics by rarity
  for (const rarity of usedCardRarities) {
    const count = cardCountByRarity[rarity];
    if (count > 0) {
      analysis.byRarity[rarity].averageAttack /= count;
      analysis.byRarity[rarity].averageHealth /= count;
      analysis.byRarity[rarity].attackHealthRatio = analysis.byRarity[rarity].averageAttack / analysis.byRarity[rarity].averageHealth;
      analysis.byRarity[rarity].effectsPerCard /= count;
      analysis.byRarity[rarity].energyGeneration /= count;
      analysis.byRarity[rarity].damagePerMana /= count;
      analysis.byRarity[rarity].healingPerMana /= count;
      
      // Calculate phase effectiveness
      for (const phase of Object.values(Phase)) {
        if (analysis.byRarity[rarity].effectivenessByPhase[phase]) {
          analysis.byRarity[rarity].effectivenessByPhase[phase].attackBonus /= count;
          analysis.byRarity[rarity].effectivenessByPhase[phase].healthBonus /= count;
          analysis.byRarity[rarity].effectivenessByPhase[phase].specialEffects /= count;
        }
      }
    }
  }
  
  // Identify imbalances
  
  // Compare types for balance
  const attackDeviations = Array.from(usedCardTypes).map(type => {
    const deviation = Math.abs(analysis.byType[type].averageAttack - analysis.overallMetrics.averageAttack);
    return { type, deviation };
  }).filter(d => d.deviation > 1);
  
  if (attackDeviations.length > 0) {
    attackDeviations.forEach(d => {
      const direction = analysis.byType[d.type].averageAttack > analysis.overallMetrics.averageAttack ? 'higher' : 'lower';
      analysis.imbalances.push(`${d.type} has ${direction} average attack (${analysis.byType[d.type].averageAttack.toFixed(1)}) than overall (${analysis.overallMetrics.averageAttack.toFixed(1)})`);
    });
  }
  
  const healthDeviations = Array.from(usedCardTypes).map(type => {
    const deviation = Math.abs(analysis.byType[type].averageHealth - analysis.overallMetrics.averageHealth);
    return { type, deviation };
  }).filter(d => d.deviation > 1.5);
  
  if (healthDeviations.length > 0) {
    healthDeviations.forEach(d => {
      const direction = analysis.byType[d.type].averageHealth > analysis.overallMetrics.averageHealth ? 'higher' : 'lower';
      analysis.imbalances.push(`${d.type} has ${direction} average health (${analysis.byType[d.type].averageHealth.toFixed(1)}) than overall (${analysis.overallMetrics.averageHealth.toFixed(1)})`);
    });
  }
  
  // Check for energy generation imbalances
  const energyDeviations = Array.from(usedCardTypes).map(type => {
    const deviation = Math.abs(analysis.byType[type].energyGeneration - analysis.overallMetrics.energyGeneration);
    return { type, deviation };
  }).filter(d => d.deviation > 0.5);
  
  if (energyDeviations.length > 0) {
    energyDeviations.forEach(d => {
      const direction = analysis.byType[d.type].energyGeneration > analysis.overallMetrics.energyGeneration ? 'higher' : 'lower';
      analysis.imbalances.push(`${d.type} has ${direction} energy generation (${analysis.byType[d.type].energyGeneration.toFixed(1)}) than overall (${analysis.overallMetrics.energyGeneration.toFixed(1)})`);
    });
  }
  
  // Check for phase power imbalances
  for (const phase of Object.values(Phase)) {
    const phaseTypeDeviations = Array.from(usedCardTypes).map(type => {
      const attackBonus = analysis.byType[type].effectivenessByPhase[phase]?.attackBonus || 0;
      const healthBonus = analysis.byType[type].effectivenessByPhase[phase]?.healthBonus || 0;
      const overallAttackBonus = analysis.overallMetrics.effectivenessByPhase[phase]?.attackBonus || 0;
      const overallHealthBonus = analysis.overallMetrics.effectivenessByPhase[phase]?.healthBonus || 0;
      
      const attackDeviation = Math.abs(attackBonus - overallAttackBonus);
      const healthDeviation = Math.abs(healthBonus - overallHealthBonus);
      
      return {
        type,
        attackDeviation,
        healthDeviation,
        attackBonus,
        healthBonus
      };
    }).filter(d => d.attackDeviation > 0.5 || d.healthDeviation > 0.5);
    
    if (phaseTypeDeviations.length > 0) {
      phaseTypeDeviations.forEach(d => {
        if (d.attackDeviation > 0.5) {
          const direction = d.attackBonus > (analysis.overallMetrics.effectivenessByPhase[phase]?.attackBonus || 0) ? 'higher' : 'lower';
          analysis.imbalances.push(`${d.type} has ${direction} attack bonus (${d.attackBonus.toFixed(1)}) in ${phase} phase than overall`);
        }
        
        if (d.healthDeviation > 0.5) {
          const direction = d.healthBonus > (analysis.overallMetrics.effectivenessByPhase[phase]?.healthBonus || 0) ? 'higher' : 'lower';
          analysis.imbalances.push(`${d.type} has ${direction} health bonus (${d.healthBonus.toFixed(1)}) in ${phase} phase than overall`);
        }
      });
    }
  }
  
  // Generate recommendations
  
  // Analyze type balancing needs
  const typeStats = Array.from(usedCardTypes).map(type => ({
    type,
    attackToHealthRatio: analysis.byType[type].attackHealthRatio,
    effectsPerCard: analysis.byType[type].effectsPerCard,
    energyGeneration: analysis.byType[type].energyGeneration,
    averageEfficiency: (analysis.byType[type].damagePerMana + analysis.byType[type].healingPerMana) / 2
  }));
  
  // Find best and worst performers
  const sortedByEfficiency = [...typeStats].sort((a, b) => b.averageEfficiency - a.averageEfficiency);
  
  if (sortedByEfficiency.length > 1 && sortedByEfficiency[0].averageEfficiency > sortedByEfficiency[sortedByEfficiency.length - 1].averageEfficiency * 1.5) {
    analysis.recommendations.push(`${sortedByEfficiency[0].type} is significantly more efficient than ${sortedByEfficiency[sortedByEfficiency.length - 1].type}. Consider reducing effect values for ${sortedByEfficiency[0].type} or increasing them for ${sortedByEfficiency[sortedByEfficiency.length - 1].type}.`);
  }
  
  // Check attack to health ratios for balance
  const attackToHealthRatios = typeStats.map(t => t.attackToHealthRatio);
  const avgRatio = attackToHealthRatios.reduce((sum, ratio) => sum + ratio, 0) / attackToHealthRatios.length;
  
  typeStats.forEach(typeStat => {
    if (typeStat.attackToHealthRatio > avgRatio * 1.5) {
      analysis.recommendations.push(`${typeStat.type} has a very high attack-to-health ratio (${typeStat.attackToHealthRatio.toFixed(2)}). Consider increasing health or reducing attack to improve survivability.`);
    } else if (typeStat.attackToHealthRatio < avgRatio * 0.6) {
      analysis.recommendations.push(`${typeStat.type} has a very low attack-to-health ratio (${typeStat.attackToHealthRatio.toFixed(2)}). Consider increasing attack or reducing health to improve offensive capabilities.`);
    }
  });
  
  // Check rarity progression
  const rarityProgression = Array.from(usedCardRarities).map(rarity => ({
    rarity,
    totalValue: analysis.byRarity[rarity].averageAttack + analysis.byRarity[rarity].averageHealth,
    effectsPerCard: analysis.byRarity[rarity].effectsPerCard
  }));
  
  // Sort by expected power level (common < rare < epic < legendary < mythic)
  const rarityOrder = {
    [CardRarity.COMMON]: 0,
    [CardRarity.RARE]: 1,
    [CardRarity.EPIC]: 2,
    [CardRarity.LEGENDARY]: 3,
    [CardRarity.MYTHIC]: 4
  };
  
  rarityProgression.sort((a, b) => {
    const orderA = rarityOrder[a.rarity as CardRarity] || 0;
    const orderB = rarityOrder[b.rarity as CardRarity] || 0;
    return orderA - orderB;
  });
  
  for (let i = 1; i < rarityProgression.length; i++) {
    const current = rarityProgression[i];
    const previous = rarityProgression[i - 1];
    
    if (current.totalValue <= previous.totalValue) {
      analysis.recommendations.push(`${current.rarity} cards don't have higher stats than ${previous.rarity} cards. Consider increasing stats for ${current.rarity} cards to create proper progression.`);
    }
    
    if (current.effectsPerCard <= previous.effectsPerCard) {
      analysis.recommendations.push(`${current.rarity} cards don't have more effects than ${previous.rarity} cards. Consider adding more effects to ${current.rarity} cards to create proper progression.`);
    }
  }
  
  // Check phase effectiveness across types
  for (const phase of Object.values(Phase)) {
    const phaseEffectiveness = Array.from(usedCardTypes).map(type => ({
      type,
      attackBonus: analysis.byType[type].effectivenessByPhase[phase]?.attackBonus || 0,
      healthBonus: analysis.byType[type].effectivenessByPhase[phase]?.healthBonus || 0,
      specialEffects: analysis.byType[type].effectivenessByPhase[phase]?.specialEffects || 0
    }));
    
    const lowEffectiveness = phaseEffectiveness.filter(e => 
      e.attackBonus === 0 && e.healthBonus === 0 && e.specialEffects === 0);
    
    if (lowEffectiveness.length > 0) {
      analysis.recommendations.push(`${lowEffectiveness.map(e => e.type).join(', ')} have no effectiveness in ${phase} phase. Consider adding phase bonuses to create strategic phase choices.`);
    }
  }
  
  return analysis;
}

/**
 * Run card tests and perform balance analysis
 */
async function runCardTestsAndAnalysis() {
  console.log('Starting card effect tests and balance analysis...');
  
  const testService = new CardEffectTestService();
  
  // Test all cards
  console.log('\n=== CARD EFFECT TESTS ===\n');
  const results = testService.testAllCards();
  console.log(`Tests completed. Success: ${results.successCount}, Failed: ${results.failCount}`);
  
  if (results.failCount > 0) {
    console.log('\nFailing cards:');
    Object.entries(results.results)
      .filter(([_, result]) => !result.success)
      .forEach(([cardId, result]) => {
        console.log(`- ${NORMAL_CARDS[cardId].name}: ${result.message}`);
      });
  }
  
  // Perform balance analysis
  console.log('\n=== CARD BALANCE ANALYSIS ===\n');
  const balanceAnalysis = analyzeCardBalance();
  
  // Display overall metrics
  console.log('Overall Card Metrics:');
  console.log(`- Average Attack: ${balanceAnalysis.overallMetrics.averageAttack.toFixed(2)}`);
  console.log(`- Average Health: ${balanceAnalysis.overallMetrics.averageHealth.toFixed(2)}`);
  console.log(`- Attack to Health Ratio: ${balanceAnalysis.overallMetrics.attackHealthRatio.toFixed(2)}`);
  console.log(`- Average Effects Per Card: ${balanceAnalysis.overallMetrics.effectsPerCard.toFixed(2)}`);
  console.log(`- Average Energy Generation: ${balanceAnalysis.overallMetrics.energyGeneration.toFixed(2)}`);
  
  // Display metrics by card type
  console.log('\nMetrics by Card Type:');
  for (const type of Object.keys(balanceAnalysis.byType)) {
    console.log(`\n${type}:`);
    console.log(`- Average Attack: ${balanceAnalysis.byType[type].averageAttack.toFixed(2)}`);
    console.log(`- Average Health: ${balanceAnalysis.byType[type].averageHealth.toFixed(2)}`);
    console.log(`- Attack to Health Ratio: ${balanceAnalysis.byType[type].attackHealthRatio.toFixed(2)}`);
    console.log(`- Average Effects Per Card: ${balanceAnalysis.byType[type].effectsPerCard.toFixed(2)}`);
    console.log(`- Average Energy Generation: ${balanceAnalysis.byType[type].energyGeneration.toFixed(2)}`);
    console.log(`- Damage Efficiency: ${balanceAnalysis.byType[type].damagePerMana.toFixed(2)}`);
    console.log(`- Healing Efficiency: ${balanceAnalysis.byType[type].healingPerMana.toFixed(2)}`);
  }
  
  // Display metrics by rarity
  console.log('\nMetrics by Card Rarity:');
  for (const rarity of Object.keys(balanceAnalysis.byRarity)) {
    console.log(`\n${rarity}:`);
    console.log(`- Average Attack: ${balanceAnalysis.byRarity[rarity].averageAttack.toFixed(2)}`);
    console.log(`- Average Health: ${balanceAnalysis.byRarity[rarity].averageHealth.toFixed(2)}`);
    console.log(`- Average Effects Per Card: ${balanceAnalysis.byRarity[rarity].effectsPerCard.toFixed(2)}`);
  }
  
  // Display identified imbalances
  if (balanceAnalysis.imbalances.length > 0) {
    console.log('\nIdentified Imbalances:');
    balanceAnalysis.imbalances.forEach((imbalance, i) => {
      console.log(`${i + 1}. ${imbalance}`);
    });
  }
  
  // Display recommendations
  if (balanceAnalysis.recommendations.length > 0) {
    console.log('\nBalance Recommendations:');
    balanceAnalysis.recommendations.forEach((recommendation, i) => {
      console.log(`${i + 1}. ${recommendation}`);
    });
  }
  
  // Save analysis to file
  const reportsDir = path.join(__dirname, '../../../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const analysisFilePath = path.join(reportsDir, `balance-analysis-${Date.now()}.json`);
  fs.writeFileSync(analysisFilePath, JSON.stringify(balanceAnalysis, null, 2));
  
  console.log(`\nBalance analysis saved to ${analysisFilePath}`);
}

// Execute tests and analysis
runCardTestsAndAnalysis().catch(error => {
  console.error('Error running card tests and analysis:', error);
  process.exit(1);
}); 