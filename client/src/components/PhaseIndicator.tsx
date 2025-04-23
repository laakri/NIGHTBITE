import React from 'react';
import { Phase } from '../types/gameTypes';

interface PhaseIndicatorProps {
  currentPhase: Phase;
  phaseEndsIn: number;
}

const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({ currentPhase, phaseEndsIn }) => {
  return (
    <div className="flex items-center space-x-2 bg-black/30 px-3 py-1.5 rounded-md border border-gray-700/30">
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full ${
          currentPhase === Phase.Normal ? 'bg-green-500' : 'bg-gray-700'
        }`}></div>
        <div className="w-6 h-0.5 bg-gray-700"></div>
        <div className={`w-2 h-2 rounded-full ${
          currentPhase === Phase.BloodMoon ? 'bg-red-500' : 'bg-gray-700'
        }`}></div>
        <div className="w-6 h-0.5 bg-gray-700"></div>
        <div className={`w-2 h-2 rounded-full ${
          currentPhase === Phase.Void ? 'bg-purple-500' : 'bg-gray-700'
        }`}></div>
      </div>
      <div className="text-white text-xs">
        Phase change in {phaseEndsIn} turns
      </div>
    </div>
  );
};

export default PhaseIndicator; 