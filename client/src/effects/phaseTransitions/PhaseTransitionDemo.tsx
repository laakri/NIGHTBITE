import React from 'react';
import { Phase } from '../../types/gameTypes';
import { usePhaseTransition } from './PhaseTransitionProvider';

/**
 * Demo component to showcase phase transitions
 */
const PhaseTransitionDemo: React.FC = () => {
  const {
    currentPhase,
    setPhase,
    isTransitioning,
    getPrimaryColor,
    getThemeClass
  } = usePhaseTransition();
  
  // Helper to generate button styles based on phase
  const getButtonStyle = (phase: Phase) => {
    const isActive = currentPhase === phase;
    
    let baseClasses = "px-4 py-2 rounded-md font-medium transition-all duration-300 ";
    
    // Add phase-specific styles
    switch (phase) {
      case Phase.BloodMoon:
        baseClasses += isActive 
          ? "bg-red-600 text-white border-2 border-red-400 phase-shadow-blood" 
          : "bg-red-900/70 text-red-200 border border-red-800 hover:bg-red-800";
        break;
      case Phase.Void:
        baseClasses += isActive 
          ? "bg-purple-600 text-white border-2 border-purple-400 phase-shadow-void" 
          : "bg-purple-900/70 text-purple-200 border border-purple-800 hover:bg-purple-800";
        break;
      case Phase.Normal:
      default:
        baseClasses += isActive 
          ? "bg-emerald-600 text-white border-2 border-emerald-400 phase-shadow-normal" 
          : "bg-emerald-900/70 text-emerald-200 border border-emerald-800 hover:bg-emerald-800";
    }
    
    // Add glow animation if button is active
    if (isActive) {
      baseClasses += " animate-glow";
    }
    
    return baseClasses;
  };
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-phase ${getThemeClass()}`}>
      <div className="max-w-2xl w-full bg-black/50 rounded-xl backdrop-blur-sm p-8 border border-white/10">
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: getPrimaryColor() }}>
          Phase Transition Demo
        </h1>
        
        <div className="mb-8">
          <div className="text-white text-lg mb-2">Current Phase:</div>
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: getPrimaryColor() }}
            ></div>
            <div className="text-xl font-semibold text-white">
              {currentPhase}
              {isTransitioning && <span className="ml-2 text-sm opacity-70">(Transitioning...)</span>}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setPhase(Phase.Normal)}
            className={getButtonStyle(Phase.Normal)}
            disabled={isTransitioning || currentPhase === Phase.Normal}
          >
            Normal Phase
          </button>
          
          <button
            onClick={() => setPhase(Phase.BloodMoon)}
            className={getButtonStyle(Phase.BloodMoon)}
            disabled={isTransitioning || currentPhase === Phase.BloodMoon}
          >
            Blood Moon Phase
          </button>
          
          <button
            onClick={() => setPhase(Phase.Void)}
            className={getButtonStyle(Phase.Void)}
            disabled={isTransitioning || currentPhase === Phase.Void}
          >
            Void Phase
          </button>
        </div>
        
        <div className="mt-12 bg-black/30 p-4 rounded-lg border border-white/5">
          <h2 className="text-xl font-semibold mb-3 text-white">
            Phase Effects
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80 text-sm">
            <div className="bg-emerald-950/40 p-3 rounded border border-emerald-800/30">
              <div className="font-bold text-emerald-400 mb-1">Normal Phase</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Balanced gameplay</li>
                <li>Standard card effects</li>
                <li>Basic energy regeneration</li>
              </ul>
            </div>
            
            <div className="bg-red-950/40 p-3 rounded border border-red-800/30">
              <div className="font-bold text-red-400 mb-1">Blood Moon Phase</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Blood energy available</li>
                <li>Sacrifice mechanics</li>
                <li>Amplified damage effects</li>
              </ul>
            </div>
            
            <div className="bg-purple-950/40 p-3 rounded border border-purple-800/30">
              <div className="font-bold text-purple-400 mb-1">Void Phase</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Reality distortion</li>
                <li>Unpredictable outcomes</li>
                <li>Powerful void cards</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseTransitionDemo; 