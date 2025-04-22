import React, { useState, useEffect } from 'react';
import { Card as CardType, CardRarity } from '../types/gameTypes';
// Import a default card image
import defaultCardImage from "../assets/cards/default.jpg";

interface CardProps {
  card: CardType;
  isSelected: boolean;
  canPlay: boolean;
  onPlay: () => void;
}

const Card: React.FC<CardProps> = ({ card, isSelected, canPlay, onPlay }) => {
  // State to store the card image
  const [cardImage, setCardImage] = useState<string>(defaultCardImage);
  
  // Load the card image based on the card ID
  useEffect(() => {
    const loadCardImage = async () => {
      try {
        // Try to import the image based on the card ID
        const imageModule = await import(`../assets/cards/${card.id_name}.jpg`);
        setCardImage(imageModule.default);
      } catch (error) {
        // If the image import fails, use the default image
        console.warn(`Card image for ID ${card.id} not found, using default image`);
        setCardImage(defaultCardImage);
      }
    };
    
    loadCardImage();
  }, [card.id]);
  
  // Get border style based on card rarity
  const getBorderStyle = () => {
    switch (card.rarity) {
      case CardRarity.LEGENDARY:
        return 'ring-2 ring-amber-500/70';
      case CardRarity.EPIC:
        return 'ring-2 ring-purple-500/70';
      case CardRarity.RARE:
        return 'ring-2 ring-blue-500/70';
      case CardRarity.MYTHIC:
        return 'ring-2 ring-fuchsia-500/70';
      case CardRarity.COMMON:
      default:
        return 'ring-1 ring-gray-500/50';
    }
  };

  // Get card type color
  const getTypeColor = () => {
    switch (card.type) {
      case 'BLOOD':
        return 'bg-red-950 text-red-200';
      case 'VOID':
        return 'bg-purple-950 text-purple-200';
      case 'NETHER':
        return 'bg-emerald-950 text-emerald-200';
      default:
        return 'bg-gray-950 text-gray-200';
    }
  };

  return (
    <div
    className={`relative w-56 h-80 rounded-lg overflow-hidden transform transition-all duration-300 ${
      isSelected ? 'scale-105 shadow-xl' : 'hover:scale-105'
      } ${canPlay ? 'cursor-pointer' : 'opacity-70'} ${getBorderStyle()}`}
    >
      {/* Card background with image - full size */}
      <div className="absolute inset-0 z-0 bg-black">
        <img 
          src={cardImage} 
          alt={card.name}
          className="w-full h-full object-cover object-center"
          style={{ objectPosition: "center 30%" }}
        />
      </div>
      
      {/* Top badges - just type and rarity in top right */}
      <div className="relative flex justify-end p-2 gap-1 z-10">
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getTypeColor()} backdrop-blur-sm`}>
          {card.type}
        </span>
        <span className={`px-2 py-0.5 rounded text-xs font-bold backdrop-blur-sm
                    ${card.rarity === CardRarity.LEGENDARY ? 'bg-amber-950 text-amber-200' :
                       card.rarity === CardRarity.EPIC ? 'bg-purple-950 text-purple-200' :
                       card.rarity === CardRarity.RARE ? 'bg-blue-950 text-blue-200' :
                       card.rarity === CardRarity.MYTHIC ? 'bg-fuchsia-950 text-fuchsia-200' :
                       'bg-gray-950 text-gray-200'}`}>
          {card.rarity}
        </span>
      </div>
      
      {/* Energy cost - positioned in top left */}
      <div className="absolute top-2 left-2 z-10">
        <div className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm
              flex items-center justify-center border border-gray-700">
          <span className="text-gray-200 font-bold text-lg">
            {card.stats.cost}
          </span>
        </div>
      </div>
      
      {/* Card footer - semi-transparent with title at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-6 pb-2 px-2 z-10">
        {/* Card title - moved to bottom */}
        <h3 className="text-white font-bold text-base mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
          {card.name}
        </h3>
        
        {/* Card description */}
        <div className="text-sm text-white font-medium mb-2 line-clamp-2 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
          {card.description}
        </div>
        
        {/* Card stats */}
        <div className="flex justify-between">
          <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-sm border-l-2 border-red-800">
            <div className="text-red-400 font-bold text-lg">{card.stats.attack}</div>
            <div className="text-xs text-red-500 font-semibold">ATK</div>
          </div>
          
          <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-sm border-l-2 border-emerald-800">
            <div className="text-emerald-400 font-bold text-lg">{card.stats.health}</div>
            <div className="text-xs text-emerald-500 font-semibold">HP</div>
          </div>
        </div>
      </div>
      
      {/* Play button */}
      {isSelected && canPlay && (
        <button
          onClick={onPlay}
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20
                   px-4 py-1 bg-black/80 text-gray-300 
                   rounded text-sm font-medium border border-gray-700
                   hover:bg-gray-800 transition-all duration-200"
        >
          Summon
        </button>
      )}
    </div>
  );
};

export default Card; 