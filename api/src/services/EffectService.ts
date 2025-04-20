import type { Game, EffectResult } from '../models/Game';
import type { Card, Phase } from '../models/Card';
import type { Effect } from '../models/Effect';
import { EffectType, EffectTrigger } from '../models/Effect';
import type { Player } from '../models/Player';

export class EffectService {
  // Apply a single effect to the game
  applyEffect(game: Game, sourcePlayer: Player, targetPlayer: Player, effect: Effect, sourceCard: Card): void {
    // Check if effect condition is met
    if (!this.checkEffectCondition(game, effect)) {
      return;
    }

    // Apply effect based on type
    switch (effect.type) {
      // Basic Effects
      case EffectType.DAMAGE:
        this.applyDamage(game, targetPlayer, effect.value || 0);
        break;
      case EffectType.HEAL:
        this.applyHealing(game, targetPlayer, effect.value || 0);
        break;
      case EffectType.SHIELD:
        this.applyShield(game, targetPlayer, effect.value || 0);
        break;
      case EffectType.DRAW:
        this.applyDraw(game, sourcePlayer, effect.value || 1);
        break;

      // Dark Fantasy Effects
      case EffectType.VOID_DAMAGE:
        this.applyVoidDamage(game, targetPlayer, effect.value || 0);
        break;
      case EffectType.BLOOD_DRAIN:
        this.applyBloodDrain(game, sourcePlayer, targetPlayer, effect.value || 0);
        break;
      case EffectType.SHADOW_STEP:
        this.applyShadowStep(game, sourcePlayer, effect.value || 0);
        break;
      case EffectType.NETHER_EMPOWER:
        this.applyNetherEmpower(game, sourcePlayer, effect.value || 0);
        break;
      case EffectType.SOUL_HARVEST:
        this.applySoulHarvest(game, sourcePlayer, effect.value || 0);
        break;

      // Blood Moon Effects
      case EffectType.BLOOD_TRANSFORM:
        this.applyBloodTransform(game, sourcePlayer, sourceCard);
        break;
      case EffectType.POWER_BOOST:
        this.applyPowerBoost(game, sourcePlayer, effect.value || 0);
        break;

      // Special Effects
      case EffectType.VOID_SHIELD:
        this.applyVoidShield(game, targetPlayer, effect.duration || 1);
        break;
      case EffectType.REALITY_WARP:
        this.applyRealityWarp(game, effect.duration || 1);
        break;
    }

    // Track effect in player's active effects if it has duration
    if (effect.duration && effect.duration > 0) {
      this.addActiveEffect(targetPlayer, effect);
    }

    // Record effect in game history
    this.recordEffect(game, sourcePlayer, targetPlayer, effect, sourceCard);

    // Create effect result for game history
    const effectResult: EffectResult = {
      type: effect.type,
      value: effect.value,
      sourceCardId: sourceCard.id,
      sourceCardName: sourceCard.name,
      targetPlayerId: targetPlayer.id,
      appliedAt: Date.now()
    };

    // Store last 5 effect results
    if (!game.state.lastEffectResults) {
      game.state.lastEffectResults = [];
    }
    game.state.lastEffectResults.unshift(effectResult);
    if (game.state.lastEffectResults.length > 5) {
      game.state.lastEffectResults.pop();
    }

    // Check for blood moon activation
    this.checkBloodMoonActivation(game, sourcePlayer);
  }

  // Add an active effect to a player
  private addActiveEffect(player: Player, effect: Effect): void {
    if (!effect.duration || effect.duration <= 0) return;
    
    // Add or update the effect
    const existingIndex = player.state.activeEffects.findIndex(e => e.id === effect.id);
    
    if (existingIndex >= 0) {
      // Update existing effect
      player.state.activeEffects[existingIndex].duration = effect.duration;
      player.state.activeEffects[existingIndex].value = effect.value;
    } else {
      // Add new effect
      player.state.activeEffects.push({
        id: effect.id,
        type: effect.type,
        value: effect.value,
        duration: effect.duration
      });
    }
  }

  // Check if effect condition is met
  private checkEffectCondition(game: Game, effect: Effect): boolean {
    if (!effect.condition) return true;

    switch (effect.condition.type) {
      case 'BLOOD_MOON':
        return game.players.some(p => p.state.isInBloodMoon);
      case 'HP_THRESHOLD':
        return game.players.some(p => p.stats.health <= effect.condition!.value);
      case 'CRYSTAL_COUNT':
        return game.players.some(p => p.stats.crystals >= effect.condition!.value);
      default:
        return true;
    }
  }

  // Apply damage considering shields and overdrive
  private applyDamage(game: Game, targetPlayer: Player, damage: number): void {
    if (targetPlayer.stats.shields > 0) {
      const absorbedDamage = Math.min(targetPlayer.stats.shields, damage);
      damage -= absorbedDamage;
      targetPlayer.stats.shields -= absorbedDamage;
    }

    if (damage > 0) {
      if (targetPlayer.stats.inOverdrive) {
        damage += 1;
      }
      targetPlayer.stats.health -= damage;

      if (targetPlayer.stats.health <= 0) {
        game.isGameOver = true;
        game.winner = game.players.find(p => p.id !== targetPlayer.id);
      }
    }
  }

  // Apply healing with max HP cap
  private applyHealing(game: Game, targetPlayer: Player, healing: number): void {
    const oldHp = targetPlayer.stats.health;
    targetPlayer.stats.health = Math.min(targetPlayer.stats.maxHealth, targetPlayer.stats.health + healing);
    const actualHealing = targetPlayer.stats.health - oldHp;
  }

  // Apply shield
  private applyShield(game: Game, targetPlayer: Player, shieldAmount: number): void {
    targetPlayer.stats.shields += shieldAmount;
  }

  // Draw cards from deck
  private applyDraw(game: Game, player: Player, drawCount: number): void {
    for (let i = 0; i < drawCount; i++) {
      if (player.deck.length > 0) {
        player.hand.push(player.deck.pop()!);
      }
    }
  }

  // Apply blood moon transformation
  private applyBloodTransform(game: Game, player: Player, card: Card): void {
    if (card.bloodMoonEffects) {
      const bloodMoonEffect = card.bloodMoonEffects.find(e => e.trigger === EffectTrigger.ON_BLOOD_MOON);
      if (bloodMoonEffect) {
        this.applyEffect(game, player, player, bloodMoonEffect, card);
      }
    }
  }

  // Apply power boost
  private applyPowerBoost(game: Game, player: Player, boostAmount: number): void {
    player.stats.powerBoost += boostAmount;
  }

  // Apply crystal charge
  private applyCrystalCharge(game: Game, player: Player, chargeAmount: number): void {
    player.stats.crystals += chargeAmount;
  }

  // Apply void shield
  private applyVoidShield(game: Game, player: Player, duration: number): void {
    player.stats.voidShieldDuration = duration;
  }

  // Apply reality warp
  private applyRealityWarp(game: Game, duration: number): void {
    game.state.realityWarpDuration = duration;
    // Randomly shuffle or change the phase order for a duration
    const phases = [...game.phaseOrder];
    for (let i = phases.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [phases[i], phases[j]] = [phases[j], phases[i]];
    }
    
    // Store original phase order if not already stored
    if (!game.state.originalPhaseOrder) {
      game.state.originalPhaseOrder = [...game.phaseOrder];
    }
    
    // Apply shuffled phase order
    game.phaseOrder = phases;
  }

  // Restore reality (end reality warp)
  restoreReality(game: Game): void {
    if (game.state.originalPhaseOrder) {
      game.phaseOrder = [...game.state.originalPhaseOrder];
      game.state.originalPhaseOrder = undefined;
    }
    game.state.realityWarpDuration = undefined;
  }

  // Apply copy effect
  private applyCopyEffect(game: Game, sourcePlayer: Player, targetPlayer: Player): void {
    if (targetPlayer.state.lastPlayedCard) {
      const lastCard = targetPlayer.state.lastPlayedCard;
      // Find the actual card in the player's hand or discard pile
      const copiedCard = [...targetPlayer.hand, ...targetPlayer.discardPile]
        .find(card => card.id === lastCard.id);
      if (copiedCard) {
        this.applyEffect(game, sourcePlayer, targetPlayer, copiedCard.effects[0], copiedCard);
      }
    }
  }

  // Record effect in game history
  private recordEffect(game: Game, sourcePlayer: Player, targetPlayer: Player, effect: Effect, sourceCard: Card): void {
    game.history.turns[game.history.turns.length - 1].actions.push({
      type: 'EFFECT_TRIGGER',
      cardId: sourceCard.id,
      effects: [effect],
      timestamp: Date.now()
    });
  }

  // Get phase-specific power for a card
  getPhasePower(card: Card, currentPhase: Phase): { attackBonus: number; healthBonus: number; costReduction: number } {
    const phasePower = card.stats.phasePower?.[currentPhase] || {};
    return {
      attackBonus: phasePower.attackBonus || 0,
      healthBonus: phasePower.healthBonus || 0,
      costReduction: phasePower.costReduction || 0
    };
  }

  // New Dark Fantasy Effect Handlers
  private applyVoidDamage(game: Game, targetPlayer: Player, damage: number): void {
    // Void damage ignores shields and is increased during blood moon
    const multiplier = targetPlayer.state.isInBloodMoon ? 1.5 : 1;
    const finalDamage = Math.floor(damage * multiplier);
    targetPlayer.stats.health -= finalDamage;

    if (targetPlayer.stats.health <= 0) {
      game.isGameOver = true;
      game.winner = game.players.find(p => p.id !== targetPlayer.id);
    }
  }

  private applyBloodDrain(game: Game, sourcePlayer: Player, targetPlayer: Player, amount: number): void {
    // Deal damage and heal the source player
    this.applyDamage(game, targetPlayer, amount);
    this.applyHealing(game, sourcePlayer, amount);
    
    // Increase blood moon charge
    sourcePlayer.state.bloodMoonCharge = (sourcePlayer.state.bloodMoonCharge || 0) + 1;
  }

  private applyShadowStep(game: Game, player: Player, value: number): void {
    // Grant temporary evasion and attack boost
    player.stats.temporaryAttackBoost = (player.stats.temporaryAttackBoost || 0) + value;
    player.state.hasEvasion = true;
    player.state.evasionDuration = 1; // Lasts until next turn
  }

  private applyNetherEmpower(game: Game, player: Player, value: number): void {
    // Empower all void cards in hand and on field
    const voidCards = [...player.hand, ...player.battlefield || []].filter(card => card.type === 'VOID');
    for (const card of voidCards) {
      card.currentAttack += value;
      card.currentHealth += value;
    }
  }

  private applySoulHarvest(game: Game, player: Player, value: number): void {
    // Gain blood moon charge for each dead enemy
    const deadEnemies = player.state.enemiesKilledThisTurn || 0;
    player.state.bloodMoonCharge = (player.state.bloodMoonCharge || 0) + (deadEnemies * value);
  }

  // Blood Moon Activation Check
  private checkBloodMoonActivation(game: Game, player: Player): void {
    const BLOOD_MOON_THRESHOLD = 5; // Activate blood moon at 5 charges
    
    if ((player.state.bloodMoonCharge || 0) >= BLOOD_MOON_THRESHOLD && !player.state.isInBloodMoon) {
      // Activate blood moon
      player.state.isInBloodMoon = true;
      player.state.bloodMoonTurnsLeft = 3; // Blood moon lasts 3 turns
      player.state.bloodMoonCharge = 0; // Reset charge

      // Transform all eligible cards
      this.transformCards(game, player);
    }
  }

  // Transform cards when blood moon activates
  private transformCards(game: Game, player: Player): void {
    const transformableCards = [...player.hand, ...player.battlefield || []];
    for (const card of transformableCards) {
      if (card.bloodMoonEffects && !card.isTransformed) {
        card.isTransformed = true;
        // Apply transformation effects
        for (const effect of card.bloodMoonEffects) {
          this.applyEffect(game, player, player, effect, card);
        }
      }
    }
  }
} 