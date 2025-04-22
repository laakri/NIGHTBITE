import React from 'react';
import { Card } from '../types/gameTypes';
import CardComponent from './Card';

interface PlayerHandProps {
  cards: Card[];
  playerEnergy: number;
  canPlayCards: boolean;
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  onPlayCard: (cardId: string) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  playerEnergy,
  canPlayCards,
  selectedCardId,
  onSelectCard,
  onPlayCard,
}) => {
  const handleCardClick = (card: Card) => {
    if (!canPlayCards) {
      console.log('[HAND] Cannot play cards right now')
      return
    }
    
    if (card.stats.cost > playerEnergy) {
      console.log(`[HAND] Not enough energy to play ${card.name} (cost: ${card.stats.cost}, energy: ${playerEnergy})`)
      return
    }
    
    console.log(`[HAND] Selecting card: ${card.name}`)
    onSelectCard(card.id)
  }

  const handlePlayCard = (cardId: string) => {
    if (!canPlayCards) {
      console.log('[HAND] Cannot play cards right now')
      return
    }
    
    const card = cards.find(c => c.id === cardId)
    if (!card) {
      console.log(`[HAND] Card not found: ${cardId}`)
      return
    }
    
    if (card.stats.cost > playerEnergy) {
      console.log(`[HAND] Not enough energy to play ${card.name} (cost: ${card.stats.cost}, energy: ${playerEnergy})`)
      return
    }
    
    console.log(`[HAND] Playing card: ${card.name}`)
    onPlayCard(cardId)
  }

  return (
    <div className="relative w-full">
      {/* Blood moon background effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      
      {/* Hand container with blood moon theme */}
      <div className="relative flex flex-col items-center py-4 px-6">
        {/* Blood moon energy indicator */}
        <div className="mb-4 flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-900 to-red-600 shadow-lg shadow-red-900/50 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-400 shadow-inner shadow-red-900/50 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{playerEnergy}</span>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div className="text-white/80 text-sm">
            <div className="font-medium">Blood Energy</div>
            <div className="text-xs">Power your dark forces</div>
          </div>
        </div>

        {/* Cards container with blood moon glow */}
        <div className="relative w-full">
          {/* Blood moon glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent rounded-lg blur-xl" />
          
          {/* Cards */}
          <div className="relative flex justify-center items-end space-x-3 py-4">
            {cards.map((card, index) => {
              const isSelected = selectedCardId === card.id
              const canPlay = canPlayCards && card.stats.cost <= playerEnergy
              
              return (
                <div
                  key={card.id}
                  className={`relative transition-all duration-300 ease-in-out ${
                    isSelected 
                      ? 'transform -translate-y-8 scale-110 z-10 shadow-lg shadow-red-900/50' 
                      : 'hover:-translate-y-4 hover:scale-105 hover:shadow-md hover:shadow-red-900/30'
                  } ${!canPlay ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{
                    transform: `translateY(${isSelected ? '-2rem' : '0'})`,
                    zIndex: isSelected ? 100 : 10 + (cards.length - index),
                    transition: 'all 0.3s ease-in-out'
                  }}
                  onClick={() => canPlay && handleCardClick(card)}
                  onMouseEnter={() => {
                    if (canPlay) {
                      console.log(`[HAND] Hovering over card: ${card.name}`)
                    }
                  }}
                >
                  {/* Card content with solid background */}
                  <div className="relative overflow-hidden">
                    <CardComponent
                      card={card}
                      isSelected={isSelected}
                      canPlay={canPlay}
                      onPlay={() => handlePlayCard(card.id)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Play card button with blood moon theme */}
        {selectedCardId && (
          <button
            onClick={() => handlePlayCard(selectedCardId)}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-red-900 to-red-700 text-white rounded-lg 
                     shadow-lg shadow-red-900/50 hover:from-red-800 hover:to-red-600 
                     transform hover:scale-105 transition-all duration-200
                     border border-red-800/50"
          >
            <span className="font-medium">Summon Card</span>
            <span className="ml-2 text-red-200 text-sm">
              (Cost: {cards.find(c => c.id === selectedCardId)?.stats.cost})
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerHand; 