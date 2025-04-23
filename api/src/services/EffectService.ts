import type { Game } from '../models/Game';
import type { EffectResult } from '../models/FrontendGameState';
import type { Card } from '../models/Card';
import { Phase, CardType } from '../models/Card';
import type { Effect } from '../models/Effect';
import { EffectType, EffectTrigger } from '../models/Effect';
import type { Player } from '../models/Player';

export class EffectService {
  // Apply a single effect to the game
  applyEffect(game: Game, sourcePlayer: Player, targetPlayer: Player, effect: Effect, sourceCard: Card): void {
    // Check if effect condition is met
    if (effect.trigger !== EffectTrigger.ON_PLAY && effect.trigger !== EffectTrigger.AURA) {
      return;
    }

    // Apply effect based on type
    switch (effect.type) {
      // Basic Effects
      case EffectType.DIRECT_DAMAGE:
        this.applyDamage(game, targetPlayer, effect.value || 0);
        break;
      case EffectType.AREA_DAMAGE:
        this.applyDamage(game, targetPlayer, effect.value || 0);
        break;
      case EffectType.HEALING:
        this.applyHealing(game, targetPlayer, effect.value || 0);
        break;
      case EffectType.DRAW:
        this.applyDraw(game, sourcePlayer, effect.value || 1);
        break;

      // Blood Moon Energy Effects
      case EffectType.GAIN_ENERGY:
        this.applyGainEnergy(game, sourcePlayer, effect.value || 1);
        break;
      case EffectType.STEAL_ENERGY:
        this.applyStealEnergy(game, sourcePlayer, targetPlayer, effect.value || 1);
        break;
      case EffectType.ATTACK_TO_ENERGY:
        this.applyAttackToEnergy(game, sourcePlayer, sourceCard);
        break;
      case EffectType.HEALTH_TO_ENERGY:
        this.applyHealthToEnergy(game, sourcePlayer, sourceCard);
        break;

      // Void Phase Effects
      case EffectType.VOID_DAMAGE:
        this.applyVoidDamage(game, targetPlayer, effect.value || 0);
        break;
      case EffectType.VOID_SHIELD:
        this.applyVoidShield(game, targetPlayer, effect.value || 0);
        break;
      case EffectType.VOID_LEECH:
        this.applyVoidLeech(game, sourcePlayer, targetPlayer, effect.value || 0);
        break;
      case EffectType.VOID_BLAST:
        this.applyVoidBlast(game, targetPlayer, effect.value || 0);
        break;
      case EffectType.VOID_NOVA:
        this.applyVoidNova(game, sourcePlayer, effect.value || 0);
        break;
      case EffectType.VOID_TELEPORT:
        this.applyVoidTeleport(game, sourceCard);
        break;
      case EffectType.VOID_MIRROR:
        this.applyVoidMirror(game, sourceCard);
        break;
      case EffectType.VOID_VOID:
        this.applyVoidVoid(game, sourceCard);
        break;
      case EffectType.VOID_ERUPTION:
        this.applyVoidEruption(game, sourcePlayer, effect.value || 0);
        break;
      case EffectType.VOID_ABYSS:
        this.applyVoidAbyss(game, targetPlayer);
        break;
      case EffectType.VOID_CORRUPTION:
        this.applyVoidCorruption(game, targetPlayer);
        break;
      case EffectType.VOID_ANNIHILATION:
        this.applyVoidAnnihilation(game, targetPlayer);
        break;
      case EffectType.VOID_ASCENSION:
        this.applyVoidAscension(game, sourceCard);
        break;
      case EffectType.VOID_OMEGA:
        this.applyVoidOmega(game, sourcePlayer);
        break;

      // Blood Moon Effects
      case EffectType.BLOOD_DRAIN:
        this.applyBloodDrain(game, sourcePlayer, targetPlayer, effect.value || 0);
        break;
      case EffectType.SOUL_HARVEST:
        this.applySoulHarvest(game, sourcePlayer, effect.value || 0);
        break;

      // Utility Effects
      case EffectType.SHADOW_STEP:
        this.applyShadowStep(game, sourcePlayer, effect.value || 0);
        break;
      case EffectType.NETHER_EMPOWER:
        this.applyNetherEmpower(game, sourcePlayer, effect.value || 0);
        break;
      case EffectType.CONSUME:
        this.applyConsume(game, sourcePlayer, sourceCard);
        break;
      case EffectType.PIERCE:
        this.applyPierce(game, targetPlayer, effect.value || 0);
        break;
      case EffectType.CLONE:
        this.applyClone(game, sourcePlayer, sourceCard);
        break;
      case EffectType.MIND_CONTROL:
        this.applyMindControl(game, sourcePlayer, targetPlayer, sourceCard);
        break;
      case EffectType.REALITY_SHIFT:
        this.applyRealityShift(game);
        break;
      case EffectType.PHASE_LOCK:
        this.applyPhaseLock(game, effect.value || 0);
        break;
      case EffectType.CLONE_SELF:
        this.applyCloneSelf(game, sourcePlayer, sourceCard);
        break;
      case EffectType.AURA_WEAKEN:
        this.applyAuraWeaken(game, targetPlayer, effect.value || 0);
        break;
      case EffectType.MASS_TRANSFORM:
        this.applyMassTransform(game, sourcePlayer, sourceCard.type);
        break;
      case EffectType.MASS_DESTROY:
        this.applyMassDestroy(game, card => card.type === sourceCard.type);
        break;
      case EffectType.COST_REDUCTION:
        this.applyCostReduction(game, sourcePlayer, effect.value || 0);
        break;
      case EffectType.VOID_SCALING:
        this.applyVoidScaling(game, sourcePlayer, sourceCard);
        break;
      case EffectType.APOCALYPSE:
        this.applyApocalypse(game, effect.value || 0);
        break;
      case EffectType.HASTE:
        this.applyHaste(game, sourceCard);
        break;
      case EffectType.EMPOWER:
        this.applyEmpower(game, sourceCard, effect.value || 0);
        break;
      case EffectType.TRANSFORM:
        this.applyTransform(game, sourceCard, CardType.VOID);
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

  // Blood Moon Energy Effects

  // Gain blood energy
  private applyGainEnergy(game: Game, player: Player, amount: number): void {
    player.stats.bloodEnergy += amount;
    // Cap at max blood energy
    if (player.stats.bloodEnergy > player.stats.maxBloodEnergy) {
      player.stats.bloodEnergy = player.stats.maxBloodEnergy;
    }
  }

  // Steal blood energy from opponent
  private applyStealEnergy(game: Game, sourcePlayer: Player, targetPlayer: Player, amount: number): void {
    // Only steal what the target has
    const stealAmount = Math.min(targetPlayer.stats.bloodEnergy, amount);
    targetPlayer.stats.bloodEnergy -= stealAmount;
    sourcePlayer.stats.bloodEnergy += stealAmount;
    
    // Cap at max blood energy
    if (sourcePlayer.stats.bloodEnergy > sourcePlayer.stats.maxBloodEnergy) {
      sourcePlayer.stats.bloodEnergy = sourcePlayer.stats.maxBloodEnergy;
    }
  }

  // Convert card's attack into blood energy
  private applyAttackToEnergy(game: Game, player: Player, card: Card): void {
    const energyGain = Math.ceil(card.currentAttack / 2); // Half of attack, rounded up
    player.stats.bloodEnergy += energyGain;
    
    // Cap at max blood energy
    if (player.stats.bloodEnergy > player.stats.maxBloodEnergy) {
      player.stats.bloodEnergy = player.stats.maxBloodEnergy;
    }
  }

  // Convert card's health into blood energy
  private applyHealthToEnergy(game: Game, player: Player, card: Card): void {
    const energyGain = Math.ceil(card.currentHealth / 3); // One third of health, rounded up
    player.stats.bloodEnergy += energyGain;
    
    // Cap at max blood energy
    if (player.stats.bloodEnergy > player.stats.maxBloodEnergy) {
      player.stats.bloodEnergy = player.stats.maxBloodEnergy;
    }
    
    // Decrease the card's health
    card.currentHealth = Math.max(1, card.currentHealth - energyGain);
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

  // Apply damage considering shields
  private applyDamage(game: Game, targetPlayer: Player, damage: number): void {
    if (targetPlayer.stats.shields > 0) {
      const absorbedDamage = Math.min(targetPlayer.stats.shields, damage);
      damage -= absorbedDamage;
      targetPlayer.stats.shields -= absorbedDamage;
    }

    if (damage > 0) {
      targetPlayer.stats.health -= damage;

      if (targetPlayer.stats.health <= 0) {
        game.isGameOver = true;
        const winner = game.players.find(p => p.id !== targetPlayer.id);
        if (winner) {
          game.winner = winner;
        }
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
    if (targetPlayer.state.lastPlayedCards && targetPlayer.state.lastPlayedCards.length > 0) {
      const lastCard = targetPlayer.state.lastPlayedCards[0];
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

  // Get phase-specific effects for a card
  getPhasePower(card: Card, currentPhase: Phase): { attackBonus: number; healthBonus: number } {
    const phaseEffects = card.stats.phaseEffects?.[currentPhase];
    return {
      attackBonus: phaseEffects?.attackBonus || 0,
      healthBonus: phaseEffects?.healthBonus || 0
    };
  }

  // Dark Fantasy Effect Handlers
  private applyVoidDamage(game: Game, targetPlayer: Player, damage: number): void {
    // Void damage ignores shields and is increased during blood moon
    const multiplier = targetPlayer.state.isInBloodMoon ? 1.5 : 1;
    const finalDamage = Math.floor(damage * multiplier);
    targetPlayer.stats.health -= finalDamage;

    if (targetPlayer.stats.health <= 0) {
      game.isGameOver = true;
      const winner = game.players.find(p => p.id !== targetPlayer.id);
      if (winner) {
        game.winner = winner;
      }
    }
  }

  private applyBloodDrain(game: Game, sourcePlayer: Player, targetPlayer: Player, amount: number): void {
    // Deal damage and heal the source player
    this.applyDamage(game, targetPlayer, amount);
    this.applyHealing(game, sourcePlayer, amount);
    
    // Increase blood moon meter
    sourcePlayer.stats.bloodMoonMeter++;

    // Also gain 1 blood energy
    sourcePlayer.stats.bloodEnergy = Math.min(sourcePlayer.stats.maxBloodEnergy, sourcePlayer.stats.bloodEnergy + 1);
  }

  private applyShadowStep(game: Game, player: Player, value: number): void {
    // Grant temporary evasion
    player.state.isEvading = true;
  }

  private applyNetherEmpower(game: Game, player: Player, value: number): void {
    // Empower all void cards in hand and on field
    const voidCards = [...player.hand, ...player.battlefield || []].filter(card => card.type === CardType.VOID);
    for (const card of voidCards) {
      card.currentAttack += value;
      card.currentHealth += value;
    }
  }

  private applySoulHarvest(game: Game, player: Player, value: number): void {
    // Increase blood moon meter based on value
    player.stats.bloodMoonMeter += value;
    
    // Also gain 1 blood energy when harvesting souls
    player.stats.bloodEnergy = Math.min(player.stats.maxBloodEnergy, player.stats.bloodEnergy + 1);
  }

  // Blood Moon Activation Check
  private checkBloodMoonActivation(game: Game, player: Player): void {
    if (player.stats.bloodMoonMeter >= game.bloodMoonThreshold && !player.state.isInBloodMoon) {
      // Activate blood moon
      player.state.isInBloodMoon = true;
      player.state.bloodMoonTurnsLeft = 3; // Blood moon lasts 3 turns
      player.stats.bloodMoonMeter = 0; // Reset meter
      
      // Gain 3 blood energy when blood moon activates
      player.stats.bloodEnergy = Math.min(player.stats.maxBloodEnergy, player.stats.bloodEnergy + 3);
    }
  }

  // Apply consume effect - consume a friendly minion to gain its stats
  private applyConsume(game: Game, sourcePlayer: Player, targetCard: Card): void {
    const sourceCard = sourcePlayer.battlefield.find(card => card.id === targetCard.id);
    if (!sourceCard) return;

    // Add stats to the consuming card
    sourceCard.currentAttack += targetCard.currentAttack;
    sourceCard.currentHealth += targetCard.currentHealth;

    // Remove the consumed card
    const index = sourcePlayer.battlefield.indexOf(targetCard);
    if (index > -1) {
      sourcePlayer.battlefield.splice(index, 1);
    }
  }

  // Apply pierce effect - ignore shields and deal direct damage
  private applyPierce(game: Game, targetPlayer: Player, damage: number): void {
    targetPlayer.stats.health -= damage;
    if (targetPlayer.stats.health <= 0) {
      game.isGameOver = true;
      const winner = game.players.find(p => p.id !== targetPlayer.id);
      if (winner) {
        game.winner = winner;
      }
    }
  }

  // Apply clone effect - create a copy of a card
  private applyClone(game: Game, sourcePlayer: Player, targetCard: Card): void {
    const clone = { ...targetCard };
    clone.id = crypto.randomUUID(); // Generate new ID for the clone
    sourcePlayer.battlefield.push(clone);
  }

  // Apply mind control effect - take control of an enemy minion
  private applyMindControl(game: Game, sourcePlayer: Player, targetPlayer: Player, targetCard: Card): void {
    const index = targetPlayer.battlefield.indexOf(targetCard);
    if (index > -1) {
      targetPlayer.battlefield.splice(index, 1);
      sourcePlayer.battlefield.push(targetCard);
    }
  }

  // Apply reality shift effect - swap positions of all minions
  private applyRealityShift(game: Game): void {
    game.players.forEach(player => {
      const tempField = [...player.battlefield];
      player.battlefield = tempField.reverse();
    });
  }

  // Apply phase lock effect - lock the current phase
  private applyPhaseLock(game: Game, duration: number): void {
    game.state.phaseLockDuration = duration;
    game.state.phaseLocked = true;
  }

  // Apply clone self effect - create a copy of self
  private applyCloneSelf(game: Game, sourcePlayer: Player, sourceCard: Card): void {
    const clone = { ...sourceCard };
    clone.id = crypto.randomUUID();
    sourcePlayer.battlefield.push(clone);
  }

  // Apply aura weaken effect - reduce stats of enemy minions
  private applyAuraWeaken(game: Game, targetPlayer: Player, value: number): void {
    targetPlayer.battlefield.forEach(card => {
      card.currentAttack = Math.max(0, card.currentAttack - value);
      card.currentHealth = Math.max(0, card.currentHealth - value);
    });
  }

  // Apply mass transform effect - transform all minions of a type
  private applyMassTransform(game: Game, sourcePlayer: Player, targetType: CardType): void {
    const transformCard = (card: Card) => {
      if (card.type === targetType) {
        card.type = CardType.VOID;
        card.currentAttack = Math.floor(card.currentAttack * 1.5);
        card.currentHealth = Math.floor(card.currentHealth * 1.5);
      }
    };

    game.players.forEach(player => {
      player.battlefield.forEach(transformCard);
    });
  }

  // Apply mass destroy effect - destroy all minions meeting criteria
  private applyMassDestroy(game: Game, criteria: (card: Card) => boolean): void {
    game.players.forEach(player => {
      player.battlefield = player.battlefield.filter(card => !criteria(card));
    });
  }

  // Apply cost reduction effect - reduce energy cost of cards
  private applyCostReduction(game: Game, player: Player, amount: number): void {
    player.hand.forEach(card => {
      if (card.stats.bloodMoonCost) {
        card.stats.bloodMoonCost = Math.max(0, card.stats.bloodMoonCost - amount);
      }
    });
  }

  // Apply void scaling effect - scale stats based on void cards played
  private applyVoidScaling(game: Game, player: Player, card: Card): void {
    const voidCardsPlayed = game.history.turns.reduce((count, turn) => {
      return count + turn.actions.filter(action => 
        action.type === 'PLAY_CARD' && action.cardId && 
        game.players.some(p => p.hand.find(c => c.id === action.cardId)?.type === CardType.VOID)
      ).length;
    }, 0);

    card.currentAttack += voidCardsPlayed;
    card.currentHealth += voidCardsPlayed;
  }

  // Apply apocalypse effect - destroy all minions and deal damage
  private applyApocalypse(game: Game, damage: number): void {
    game.players.forEach(player => {
      player.battlefield = [];
      this.applyDamage(game, player, damage);
    });
  }

  // Apply haste effect - allow immediate attack
  private applyHaste(game: Game, card: Card): void {
    card.currentAttack = Math.floor(card.currentAttack * 1.2);
  }

  // Apply empower effect - increase stats
  private applyEmpower(game: Game, card: Card, value: number): void {
    card.currentAttack += value;
    card.currentHealth += value;
  }

  // Apply transform effect - change card type and stats
  private applyTransform(game: Game, card: Card, newType: CardType): void {
    card.type = newType;
    card.currentAttack = Math.floor(card.currentAttack * 1.2);
    card.currentHealth = Math.floor(card.currentHealth * 1.2);
  }

  // Void Phase Specific Effects
  private applyVoidShield(game: Game, targetPlayer: Player, value: number): void {
    targetPlayer.stats.shields += value;
  }

  private applyVoidLeech(game: Game, sourcePlayer: Player, targetPlayer: Player, value: number): void {
    this.applyDamage(game, targetPlayer, value);
    this.applyHealing(game, sourcePlayer, value);
  }

  private applyVoidBlast(game: Game, targetPlayer: Player, value: number): void {
    this.applyDamage(game, targetPlayer, value);
  }

  private applyVoidNova(game: Game, sourcePlayer: Player, value: number): void {
    game.players.forEach(player => {
      if (player.id !== sourcePlayer.id) {
        this.applyDamage(game, player, value);
      }
    });
  }

  private applyVoidTeleport(game: Game, card: Card): void {
    // Teleport card to random position
    const randomIndex = Math.floor(Math.random() * game.players.length);
    const targetPlayer = game.players[randomIndex];
    const sourcePlayer = game.players.find(p => p.battlefield.includes(card));
    if (sourcePlayer) {
      const cardIndex = sourcePlayer.battlefield.indexOf(card);
      if (cardIndex > -1) {
        sourcePlayer.battlefield.splice(cardIndex, 1);
        targetPlayer.battlefield.push(card);
      }
    }
  }

  private applyVoidMirror(game: Game, card: Card): void {
    // Create a mirror image of the card
    const mirror = { ...card };
    mirror.id = crypto.randomUUID();
    const player = game.players.find(p => p.battlefield.includes(card));
    if (player) {
      player.battlefield.push(mirror);
    }
  }

  private applyVoidVoid(game: Game, card: Card): void {
    // Transform card into a void entity
    card.type = CardType.VOID;
    card.currentAttack *= 1.5;
    card.currentHealth *= 1.5;
  }

  private applyVoidEruption(game: Game, sourcePlayer: Player, value: number): void {
    // Deal damage to all enemies
    game.players.forEach(player => {
      if (player.id !== sourcePlayer.id) {
        this.applyDamage(game, player, value);
      }
    });
  }

  private applyVoidAbyss(game: Game, targetPlayer: Player): void {
    // Remove all shields and reduce health
    targetPlayer.stats.shields = 0;
    targetPlayer.stats.health = Math.floor(targetPlayer.stats.health * 0.8);
  }

  private applyVoidCorruption(game: Game, targetPlayer: Player): void {
    // Transform all cards to void type
    targetPlayer.battlefield.forEach(card => {
      card.type = CardType.VOID;
      card.currentAttack *= 1.2;
      card.currentHealth *= 1.2;
    });
  }

  private applyVoidAnnihilation(game: Game, targetPlayer: Player): void {
    // Destroy all cards and deal damage
    targetPlayer.battlefield = [];
    this.applyDamage(game, targetPlayer, 5);
  }

  private applyVoidAscension(game: Game, card: Card): void {
    // Transform card into a powerful void entity
    card.type = CardType.VOID;
    card.currentAttack *= 2;
    card.currentHealth *= 2;
  }

  private applyVoidOmega(game: Game, sourcePlayer: Player): void {
    // Ultimate void effect - transform all cards to void and empower them
    game.players.forEach(player => {
      player.battlefield.forEach(card => {
        card.type = CardType.VOID;
        card.currentAttack *= 1.5;
        card.currentHealth *= 1.5;
      });
    });
  }

  // Add a new method to handle applying blood moon energy from cards
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
      game.state.energyGenerated = { ...energyGenerated, [player.id]: playerEnergy };
      game.state.energyGenerated[player.id] += energyGain;
    }
  }
} 