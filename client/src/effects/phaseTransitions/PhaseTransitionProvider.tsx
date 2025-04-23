import React, { createContext, useContext, useEffect, useState } from 'react';
import { Phase } from '../../types/gameTypes';
import ThemeTransitionManager from './ThemeTransitionManager';
import PhaseTransitionEffect from './PhaseTransitionEffect';
import './transitionAnimations.css';

// Define context interface
interface PhaseTransitionContextType {
  currentPhase: Phase;
  setPhase: (phase: Phase, immediate?: boolean) => void;
  isTransitioning: boolean;
  getPrimaryColor: () => string;
  getSecondaryColor: () => string;
  getAccentColor: () => string;
  getBackgroundGradient: () => string;
  getThemeClass: () => string;
}

// Create context with default values
const PhaseTransitionContext = createContext<PhaseTransitionContextType>({
  currentPhase: Phase.Normal,
  setPhase: () => {},
  isTransitioning: false,
  getPrimaryColor: () => '#22c55e',
  getSecondaryColor: () => '#059669',
  getAccentColor: () => '#10b981',
  getBackgroundGradient: () => 'linear-gradient(to bottom, #064e3b, #022c22)',
  getThemeClass: () => 'normal-background'
});

// Props for provider component
interface PhaseTransitionProviderProps {
  children: React.ReactNode;
  initialPhase?: Phase;
}

/**
 * Provider component for phase transition functionality
 */
export const PhaseTransitionProvider: React.FC<PhaseTransitionProviderProps> = ({
  children,
  initialPhase = Phase.Normal
}) => {
  // Get singleton transition manager
  const transitionManager = ThemeTransitionManager.getInstance();
  
  // Local state
  const [currentPhase, setCurrentPhase] = useState<Phase>(initialPhase);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [phaseJustChanged, setPhaseJustChanged] = useState<boolean>(false);
  
  // Initialize manager with initial phase
  useEffect(() => {
    transitionManager.setPhase(initialPhase, true);
  }, [initialPhase]);
  
  // Set phase and trigger transition effects
  const setPhase = (phase: Phase, immediate: boolean = false) => {
    if (currentPhase === phase) return;
    
    // Update transition states
    setIsTransitioning(true);
    setPhaseJustChanged(true);
    
    // Update manager state
    transitionManager.setPhase(phase, immediate);
    
    // Update local state
    setCurrentPhase(phase);
    
    // Reset phaseJustChanged after a brief delay
    setTimeout(() => {
      setPhaseJustChanged(false);
    }, 100);
    
    // Reset transition state after effect duration
    setTimeout(() => {
      setIsTransitioning(false);
    }, 2000);
  };
  
  // Theme helper functions
  const getPrimaryColor = () => transitionManager.getPhaseTheme(currentPhase).primaryColor;
  const getSecondaryColor = () => transitionManager.getPhaseTheme(currentPhase).secondaryColor;
  const getAccentColor = () => transitionManager.getPhaseTheme(currentPhase).accentColor;
  const getBackgroundGradient = () => transitionManager.getPhaseTheme(currentPhase).backgroundGradient;
  
  // Get theme CSS class based on current phase
  const getThemeClass = () => {
    switch (currentPhase) {
      case Phase.BloodMoon:
        return 'blood-moon-background';
      case Phase.Void:
        return 'void-background';
      case Phase.Normal:
      default:
        return 'normal-background';
    }
  };
  
  // Context value
  const contextValue: PhaseTransitionContextType = {
    currentPhase,
    setPhase,
    isTransitioning,
    getPrimaryColor,
    getSecondaryColor,
    getAccentColor,
    getBackgroundGradient,
    getThemeClass
  };
  
  return (
    <PhaseTransitionContext.Provider value={contextValue}>
      {children}
      <PhaseTransitionEffect
        phase={currentPhase}
        phaseJustChanged={phaseJustChanged}
      />
    </PhaseTransitionContext.Provider>
  );
};

/**
 * Custom hook to use phase transition functionality
 */
export const usePhaseTransition = () => useContext(PhaseTransitionContext);

export default PhaseTransitionProvider; 