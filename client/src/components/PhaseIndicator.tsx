import React, { useEffect, useRef, useState } from 'react';
import { Phase } from '../types/gameTypes';

interface PhaseIndicatorProps {
  currentPhase: Phase;
  phaseEndsIn: number;
  phaseLocked?: boolean;
  phaseLockDuration?: number;
  phaseJustChanged?: boolean;
  phaseOrder?: Phase[];
}

const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  currentPhase,
  phaseEndsIn,
  phaseLocked = false,
  phaseLockDuration = 0,
  phaseJustChanged = false,
  phaseOrder = [Phase.Normal, Phase.BloodMoon, Phase.Void]
}) => {
  const [isPulsing, setIsPulsing] = useState(false);
  
  // Show pulse animation when phase changes or is about to change
  useEffect(() => {
    if (phaseJustChanged || phaseEndsIn <= 2) {
      setIsPulsing(true);
      
      const timer = setTimeout(() => {
        setIsPulsing(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [phaseJustChanged, phaseEndsIn]);
  
  // Get appropriate colors for each phase
  const getPhaseColors = (phase: Phase) => {
    switch (phase) {
      case Phase.BloodMoon:
        return {
          bg: 'from-red-900 to-red-950',
          border: 'border-red-700',
          text: 'text-red-300',
          glow: 'shadow-red-500/30',
          icon: '🔮'
        };
      case Phase.Void:
        return {
          bg: 'from-purple-900 to-purple-950',
          border: 'border-purple-700',
          text: 'text-purple-300',
          glow: 'shadow-purple-500/30',
          icon: '✧'
        };
      case Phase.Normal:
      default:
        return {
          bg: 'from-emerald-900 to-emerald-950',
          border: 'border-emerald-700',
          text: 'text-emerald-300',
          glow: 'shadow-emerald-500/30',
          icon: '☯'
        };
    }
  };
  
  // Get current phase colors
  const currentColors = getPhaseColors(currentPhase);
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className={`
          rounded-lg bg-gradient-to-r from-gray-900 to-black border border-gray-800
          p-4 shadow-lg ${phaseJustChanged ? 'animate-flash' : ''}
        `}
      >
        <div className="flex justify-between items-center">
          {/* Phase indicator and name */}
          <div className="flex items-center space-x-3">
            <div 
              className={`
                relative w-12 h-12 rounded-full flex items-center justify-center
                bg-gradient-to-br ${currentColors.bg} ${currentColors.border}
                ${isPulsing ? 'animate-pulse' : ''}
                shadow-lg ${currentColors.glow}
              `}
            >
              <span className="text-xl">{currentColors.icon}</span>
              {isPulsing && (
                <div className="absolute inset-0 rounded-full animate-ping opacity-50 bg-white/10"></div>
              )}
            </div>
            
            <div>
              <div className={`font-bold ${currentColors.text} text-lg uppercase tracking-wider`}>
                {currentPhase}
              </div>
              <div className="text-gray-400 text-xs">
                {phaseLocked ? 'LOCKED' : 'ACTIVE'} PHASE
              </div>
            </div>
          </div>
          
          {/* Phase timer */}
          <div className="flex flex-col items-center">
            <div className={`
              text-2xl font-bold ${phaseEndsIn <= 2 ? 'text-red-400 animate-pulse' : 'text-white'}
            `}>
              {phaseEndsIn}
            </div>
            <div className="text-gray-400 text-xs uppercase">turns left</div>
          </div>
        </div>
        
        {/* Phase orbs/progression */}
        <div className="mt-4 flex items-center justify-center">
          {phaseOrder.map((phase, index) => (
            <React.Fragment key={phase}>
              {/* Connection line */}
              {index > 0 && (
                <div 
                  className={`
                    w-12 h-1 ${currentPhase === phase ? 'bg-gray-500' : 'bg-gray-700'}
                  `}
                ></div>
              )}
              
              {/* Phase orb */}
              <div className="relative">
                <div 
                  className={`
                    w-8 h-8 rounded-full 
                    border-2 
                    ${phase === currentPhase 
                      ? `border-white ${getPhaseColors(phase).bg} ${getPhaseColors(phase).glow}` 
                      : 'border-gray-700 bg-gray-800'}
                    flex items-center justify-center
                  `}
                >
                  {phase === currentPhase && (
                    <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-white"></div>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
        
        {/* Lock indicator */}
        {phaseLocked && (
          <div className="mt-2 flex items-center justify-center text-amber-400 text-sm">
            <span className="mr-1">🔒</span> Phase locked for {phaseLockDuration} turns
          </div>
        )}
      </div>
    </div>
  );
};

export default PhaseIndicator; 