import React from 'react';
import { Card as CardType } from '../types/gameTypes';
import VOID from "../assets/cards/VOID_1.jpg"


interface CardProps {
  card: CardType;
  isSelected: boolean;
  canPlay: boolean;
  onPlay: () => void;
}

const Card: React.FC<CardProps> = ({ card, isSelected, canPlay, onPlay }) => {
  // Determine border color based on card stats
  const getBorderColor = () => {
    const { attack, health, cost } = card.stats;
    const power = attack + health;
    
    if (power >= 8) return 'border-purple-500 shadow-purple-500/50';
    if (power >= 6) return 'border-red-500 shadow-red-500/50';
    if (power >= 4) return 'border-white-500 shadow-white-500/50';
    return 'border-gray-500 shadow-gray-500/50';
  };

  // Get card type color
  const getTypeColor = () => {
    switch (card.type) {
      case 'BLOOD':
        return 'bg-red-900/50 text-red-300';
      case 'VOID':
        return 'bg-purple-900/50 text-purple-300';
      case 'NETHER':
        return 'bg-white-900/50 text-white-300';
      default:
        return 'bg-gray-800/50 text-gray-300';
    }
  };

  return (
    <div
      className={`relative w-56 h-80 rounded-lg overflow-hidden transform transition-all duration-300 ${
        isSelected ? 'scale-105 shadow-xl' : 'hover:scale-105'
      } ${canPlay ? 'cursor-pointer' : 'opacity-70'}`}
    >
      {/* Card background with image */}
      <div className="absolute inset-0">
        <img 
          src={VOID} 
          alt={card.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
      </div>
      
      {/* Dynamic border */}
      <div className={`absolute inset-0 rounded-lg border-2 ${getBorderColor()}`} />
      
      {/* Card content */}
      <div className="relative h-full p-4 flex flex-col">
        {/* Card header */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white font-bold text-base truncate text-shadow max-w-[70%]">
            {card.name}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-red-400 font-bold text-lg text-shadow">{card.stats.cost}</span>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
        </div>
        
        {/* Card type indicator */}
        <div className="mb-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor()}`}>
            {card.type}
          </span>
        </div>
        
        {/* Card stats */}
        <div className="flex justify-between mt-auto mb-2">
          <div className="text-center">
            <div className="text-red-400 font-bold text-xl text-shadow">{card.stats.attack}</div>
            <div className="text-xs text-white text-shadow">Attack</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-bold text-xl text-shadow">{card.stats.health}</div>
            <div className="text-xs text-white text-shadow">Health</div>
          </div>
        </div>
        
        {/* Card description - moved to bottom */}
        <div className="text-sm text-white text-shadow line-clamp-2 bg-black/50 p-1 rounded">
          {card.description}
        </div>
        
        {/* Play button */}
        {isSelected && canPlay && (
          <button
            onClick={onPlay}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2
                     px-4 py-1 bg-gradient-to-r from-red-900 to-red-700 text-white 
                     rounded-md text-sm font-medium shadow-lg
                     hover:from-red-800 hover:to-red-600 transition-all duration-200"
          >
            Summon
          </button>
        )}
      </div>
    </div>
  );
};

export default Card; 