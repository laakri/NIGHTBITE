import React, { useEffect, useState } from 'react';
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
  // Determine the next phase based on current phase and phaseOrder
  const getNextPhase = (): Phase => {
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const nextIndex = (currentIndex + 1) % phaseOrder.length;
    return phaseOrder[nextIndex];
  };
  
  const nextPhase = getNextPhase();
  
  // Render the phase cycle in a horizontal bar
  return (
    <div className="flex items-center space-x-3 h-10 bg-black/40 rounded-lg px-3 backdrop-blur-sm border border-gray-800/50">
      {/* Current phase indicator */}
      <div className="flex items-center h-full">
        <div className={`w-3 h-3 rounded-full ${
          currentPhase === Phase.Normal ? 'bg-emerald-500 shadow-emerald-500/50' : 
          currentPhase === Phase.BloodMoon ? 'bg-red-500 shadow-red-500/50' :
          'bg-purple-500 shadow-purple-500/50'
        } shadow-lg ${phaseJustChanged ? 'animate-pulse' : ''}`}></div>
        
        <span className={`ml-2 font-bold text-sm uppercase ${
          currentPhase === Phase.Normal ? 'text-emerald-400' : 
          currentPhase === Phase.BloodMoon ? 'text-red-400' :
          'text-purple-400'
        }`}>
          {currentPhase}
        </span>
      </div>
      
      {/* Turns remaining indicator */}
      <div className="flex items-center border-l border-gray-700 pl-3 h-full">
        <div className="flex flex-col items-center px-2">
          <span className={`text-l font-bold ${phaseEndsIn <= 2 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {phaseEndsIn}
          </span>
          <span className="text-gray-400 text-xs">turns</span>
        </div>
      </div>
      
      {/* Next phase preview */}
      <div className="flex items-center border-l border-gray-700 pl-3 h-full">
        <span className="text-gray-400 text-xs uppercase mr-2">Next:</span>
        <div className={`w-2 h-2 rounded-full ${
          nextPhase === Phase.Normal ? 'bg-emerald-500/70' : 
          nextPhase === Phase.BloodMoon ? 'bg-red-500/70' :
          'bg-purple-500/70'
        }`}></div>
        <span className={`ml-2 text-md ${
          nextPhase === Phase.Normal ? 'text-emerald-400/70' : 
          nextPhase === Phase.BloodMoon ? 'text-red-200/70' :
          'text-purple-400/70'
        }`}>
          {nextPhase}
        </span>
      </div>
      
      {/* Phase lock indicator - only show when locked */}
      {phaseLocked && (
        <div className="flex items-center border-l border-gray-700 pl-3 text-amber-400 text-xs h-full">
          <span className="mr-1">🔒</span>
          <span>{phaseLockDuration}</span>
        </div>
      )}
    </div>
  );
};

export default PhaseIndicator; 