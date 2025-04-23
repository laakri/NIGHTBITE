import { Phase } from '../../types/gameTypes';

/**
 * Configuration interface for phase transition effects
 */
export interface PhaseTransitionConfig {
  duration: number;  // Duration of the transition effect in ms
  intensity: number; // Effect intensity (0-1)
  soundEnabled: boolean; // Whether to play sound effects
  particleCount: number; // Number of particles to display (affects performance)
}

/**
 * Phase-specific themes and visual effects
 */
export interface PhaseTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  particleColor: string;
  glowIntensity: number;
  soundEffect?: string;
}

/**
 * Manager for handling phase transitions and their visual/audio effects
 */
export class ThemeTransitionManager {
  private static instance: ThemeTransitionManager;
  private activePhase: Phase = Phase.Normal;
  private previousPhase: Phase | null = null;
  private transitionActive: boolean = false;
  private config: PhaseTransitionConfig;
  private transitionListeners: ((from: Phase, to: Phase) => void)[] = [];
  private phaseThemes: Record<Phase, PhaseTheme> = {
    [Phase.Normal]: {
      primaryColor: '#22c55e', // emerald-500
      secondaryColor: '#059669', // emerald-700
      accentColor: '#10b981', // emerald-600
      backgroundGradient: 'linear-gradient(to bottom, #064e3b, #022c22)',
      particleColor: '#6ee7b7', // emerald-300
      glowIntensity: 0.3
    },
    [Phase.BloodMoon]: {
      primaryColor: '#ef4444', // red-500
      secondaryColor: '#b91c1c', // red-800
      accentColor: '#dc2626', // red-600
      backgroundGradient: 'linear-gradient(to bottom, #450a0a, #250a0a)',
      particleColor: '#fca5a5', // red-300
      glowIntensity: 0.6,
      soundEffect: 'bloodmoon_transition.mp3'
    },
    [Phase.Void]: {
      primaryColor: '#a855f7', // purple-500
      secondaryColor: '#7e22ce', // purple-800
      accentColor: '#9333ea', // purple-600
      backgroundGradient: 'linear-gradient(to bottom, #3b0764, #1e0a3d)',
      particleColor: '#d8b4fe', // purple-300
      glowIntensity: 0.8,
      soundEffect: 'void_transition.mp3'
    }
  };

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Default configuration
    this.config = {
      duration: 1500,
      intensity: 0.7,
      soundEnabled: true,
      particleCount: 150
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ThemeTransitionManager {
    if (!ThemeTransitionManager.instance) {
      ThemeTransitionManager.instance = new ThemeTransitionManager();
    }
    return ThemeTransitionManager.instance;
  }

  /**
   * Set the current game phase and trigger transition effects
   */
  public setPhase(phase: Phase, immediate: boolean = false): void {
    if (this.activePhase === phase) return;
    
    this.previousPhase = this.activePhase;
    this.activePhase = phase;
    
    if (!immediate) {
      this.triggerTransitionEffects(this.previousPhase, phase);
    }
    
    // Notify listeners about the phase change
    this.notifyTransitionListeners(this.previousPhase as Phase, phase);
  }

  /**
   * Get the current active phase
   */
  public getActivePhase(): Phase {
    return this.activePhase;
  }

  /**
   * Get the theme for a specific phase
   */
  public getPhaseTheme(phase: Phase): PhaseTheme {
    return this.phaseThemes[phase];
  }

  /**
   * Get the current active theme
   */
  public getCurrentTheme(): PhaseTheme {
    return this.phaseThemes[this.activePhase];
  }

  /**
   * Update the configuration for transitions
   */
  public updateConfig(config: Partial<PhaseTransitionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Register a listener for phase transitions
   */
  public addTransitionListener(listener: (fromPhase: Phase, toPhase: Phase) => void): void {
    this.transitionListeners.push(listener);
  }

  /**
   * Remove a transition listener
   */
  public removeTransitionListener(listener: (fromPhase: Phase, toPhase: Phase) => void): void {
    this.transitionListeners = this.transitionListeners.filter(l => l !== listener);
  }

  /**
   * Check if a transition is currently active
   */
  public isTransitionActive(): boolean {
    return this.transitionActive;
  }

  /**
   * Get the percentage of completion for the current transition (0-1)
   */
  public getTransitionProgress(): number {
    // Implementation would track the actual progress
    // This is a placeholder
    return 0;
  }

  /**
   * Trigger the visual and audio effects for a phase transition
   */
  private triggerTransitionEffects(fromPhase: Phase | null, toPhase: Phase): void {
    if (!fromPhase) return;
    
    this.transitionActive = true;
    
    // Play transition sound if enabled
    if (this.config.soundEnabled && this.phaseThemes[toPhase].soundEffect) {
      this.playTransitionSound(toPhase);
    }
    
    // Reset transition state after effect duration
    setTimeout(() => {
      this.transitionActive = false;
    }, this.config.duration);
    
    // The actual visual effects would be handled by React components
    // that listen for phase changes and render appropriate animations
  }

  /**
   * Play the appropriate sound effect for the phase transition
   */
  private playTransitionSound(phase: Phase): void {
    const soundEffect = this.phaseThemes[phase].soundEffect;
    if (!soundEffect) return;
    
    // Implementation would depend on your audio management system
    // This is a placeholder
    console.log(`Playing sound effect: ${soundEffect}`);
  }

  /**
   * Notify all registered listeners about a phase transition
   */
  private notifyTransitionListeners(fromPhase: Phase, toPhase: Phase): void {
    this.transitionListeners.forEach(listener => {
      try {
        listener(fromPhase, toPhase);
      } catch (error) {
        console.error('Error in phase transition listener:', error);
      }
    });
  }
}

export default ThemeTransitionManager; 