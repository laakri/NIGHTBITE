import React from 'react';

interface GameControlsProps {
  onEndTurn: () => void;
  onViewHistory: () => void;
  onToggleSettings: () => void;
  onSurrender: () => void;
  isYourTurn: boolean;
  currentPhase: string;
  turnNumber: number;
}

const GameControls: React.FC<GameControlsProps> = ({
  onEndTurn,
  onViewHistory,
  onToggleSettings,
  onSurrender,
  isYourTurn,
  currentPhase,
  turnNumber
}) => {
  // Get appropriate colors based on phase
  const getPhaseColors = () => {
    switch(currentPhase) {
      case 'BLOOD':
        return {
          border: 'border-blood-primary',
          text: 'text-blood-primary',
          bg: 'from-blood-primary/20 to-transparent'
        };
      case 'VOID':
        return {
          border: 'border-void-primary',
          text: 'text-void-primary',
          bg: 'from-void-primary/20 to-transparent'
        };
      case 'NETHER':
        return {
          border: 'border-eclipse-primary',
          text: 'text-eclipse-primary',
          bg: 'from-eclipse-primary/20 to-transparent'
        };
      default:
        return {
          border: 'border-gray-700',
          text: 'text-gray-400',
          bg: 'from-gray-700/20 to-transparent'
        };
    }
  };

  const phaseColors = getPhaseColors();

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-black/50 border-t border-gray-800 backdrop-blur-sm">
      {/* Turn/Phase info */}
      <div className="flex items-center space-x-3">
        <div className={`px-3 py-1 rounded-md border ${phaseColors.border} ${phaseColors.text} bg-gradient-to-r ${phaseColors.bg}`}>
          {currentPhase} Phase
        </div>
        <div className="text-gray-400 text-sm">
          Turn <span className="text-white font-semibold">{turnNumber}</span>
        </div>
      </div>
      
      {/* Game controls */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={onViewHistory}
          className="px-2 py-1 rounded text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
        >
          History
        </button>
        
        <button 
          onClick={onToggleSettings}
          className="px-2 py-1 rounded text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
        >
          Settings
        </button>
        
        <button 
          onClick={onSurrender}
          className="px-2 py-1 rounded text-xs bg-red-900/50 hover:bg-red-800/50 text-gray-300 transition-colors"
        >
          Surrender
        </button>
        
        <button 
          onClick={onEndTurn}
          disabled={!isYourTurn}
          className={`px-4 py-1 rounded flex items-center justify-center min-w-[120px] transition-all duration-300 ${
            isYourTurn 
              ? `${phaseColors.border} ${phaseColors.text} bg-gradient-to-r ${phaseColors.bg} hover:bg-black/30` 
              : 'bg-gray-900 text-gray-600 cursor-not-allowed'
          }`}
        >
          {isYourTurn ? 'End Turn' : 'Opponent\'s Turn'}
        </button>
      </div>
    </div>
  );
};

export default GameControls; 