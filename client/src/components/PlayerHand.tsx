import React, { useState, useEffect } from 'react';
import { Card, CardType, Phase } from '../types/gameTypes';
import CardComponent from './Card';
import blood_energy_bg from "../assets/HUI/blood_energy_bg.png";

interface PlayerHandProps {
  cards: Card[];
  availableEnergy: number;
  canPlayCards: boolean;
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  onPlayCard: (cardId: string) => void;
  currentPhase: Phase;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  availableEnergy,
  canPlayCards,
  selectedCardId,
  onSelectCard,
  onPlayCard,
  currentPhase,
}) => {
  // State to track if we're in confirmation mode
  const [confirmingCardId, setConfirmingCardId] = useState<string | null>(null);

  // Reset confirmation state when canPlayCards changes (turn ends)
  useEffect(() => {
    if (!canPlayCards) {
      setConfirmingCardId(null);
    }
  }, [canPlayCards]);

  const handleCardClick = (card: Card) => {
    if (!canPlayCards) {
      console.log('[HAND] Cannot play cards right now')
      return
    }
    
    // Only check energy for Blood Moon cards
    if (card.type === CardType.BLOOD && card.stats.bloodMoonCost !== undefined && card.stats.bloodMoonCost > availableEnergy) {
      console.log(`[HAND] Not enough blood energy to play ${card.name} (cost: ${card.stats.bloodMoonCost}, energy: ${availableEnergy})`)
      return
    }
    
    // If clicking on the same card that's already selected, deselect it
    if (selectedCardId === card.id) {
      console.log(`[HAND] Deselecting card: ${card.name}`)
      // Reset confirmation state if it was in confirmation mode
      if (confirmingCardId === card.id) {
        setConfirmingCardId(null)
      }
      onSelectCard('')
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
    
    // Only check energy for Blood Moon cards
    if (card.type === CardType.BLOOD && card.stats.bloodMoonCost !== undefined && card.stats.bloodMoonCost > availableEnergy) {
      console.log(`[HAND] Not enough blood energy to play ${card.name} (cost: ${card.stats.bloodMoonCost}, energy: ${availableEnergy})`)
      return
    }
    
    // Set the card to confirmation mode instead of playing immediately
    setConfirmingCardId(cardId)
  }

  const handleConfirmPlay = (cardId: string) => {
    console.log(`[HAND] Confirming play for card: ${cardId}`)
    onPlayCard(cardId)
    setConfirmingCardId(null)
  }

  const handleCancelPlay = () => {
    console.log('[HAND] Canceling card play')
    setConfirmingCardId(null)
  }

  return (
    <div className="relative w-full overflow-visible">
      {/* Blood moon background effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      
      {/* Hand container with blood moon theme */}
      <div className="relative flex flex-col items-center py-4 px-6">
        {/* Blood moon energy indicator - only show if there are Blood Moon cards in hand */}
        {cards.some(card => card.type === CardType.BLOOD) && (
          <div className="mb-4 flex items-center space-x-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
          <img src={blood_energy_bg} alt="health" className="w-full h-full absolute inset-0" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="text-white font-bold text-lg drop-shadow-md">{availableEnergy || 0}</div>
            </div>
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="text-white/80 text-sm">
              <div className="font-medium">Blood Energy</div>
              <div className="text-xs">Power your blood moon cards</div>
            </div>
          </div>
        )}

        {/* Cards container with blood moon glow */}
        <div className="relative w-full">
          {/* Blood moon glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent rounded-lg blur-xl" />
          
          {/* Cards */}
          <div className="relative flex justify-center items-end space-x-3 py-4">
            {cards.map((card, index) => {
              const isSelected = selectedCardId === card.id
              const isConfirming = confirmingCardId === card.id
              // Only check energy for Blood Moon cards
              const canPlay = canPlayCards && (card.type !== CardType.BLOOD || (card.stats.bloodMoonCost !== undefined && card.stats.bloodMoonCost <= availableEnergy))
              
              return (
                <div
                  key={card.id}
                  className={`relative transition-all duration-500 ease-in-out ${
                    isConfirming 
                      ? 'transform -translate-y-16 scale-125 z-20 shadow-xl shadow-red-900/70' 
                      : isSelected 
                        ? 'transform -translate-y-8 scale-110 z-10 shadow-lg shadow-red-900/50' 
                        : 'hover:-translate-y-4 hover:scale-105 hover:shadow-md hover:shadow-red-900/30'
                  } ${!canPlay ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{
                    transform: `translateY(${
                      isConfirming ? '-4rem' : 
                      isSelected ? '-2rem' : '0'
                    })`,
                    zIndex: isConfirming ? 200 : (isSelected ? 100 : 10 + (cards.length - index)),
                    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                  onClick={() => canPlay && handleCardClick(card)}
                  onMouseEnter={() => {
                    if (canPlay) {
                      console.log(`[HAND] Hovering over card: ${card.name}`)
                    }
                  }}
                >
                  {/* Card content with solid background */}
                  <div className="relative overflow-visible">
                    <CardComponent
                      card={card}
                      isSelected={isSelected}
                      canPlay={canPlayCards}
                      onPlay={() => handlePlayCard(card.id)}
                      availableEnergy={availableEnergy}
                      currentPhase={currentPhase}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Confirmation buttons */}
        {confirmingCardId && (
          <div className="mt-6 flex space-x-4 z-30">
            <button
              onClick={() => handleConfirmPlay(confirmingCardId)}
              className="px-6 py-2 bg-gradient-to-r from-red-900 to-red-700 text-white rounded-lg 
                       shadow-lg shadow-red-900/50 hover:from-red-800 hover:to-red-600 
                       transform hover:scale-105 transition-all duration-200
                       border border-red-800/50"
            >
              <span className="font-medium">Confirm Summon</span>
              {cards.find(c => c.id === confirmingCardId)?.type === CardType.BLOOD && (
                <span className="ml-2 text-red-200 text-sm">
                  (Blood Cost: {cards.find(c => c.id === confirmingCardId)?.stats.bloodMoonCost})
                </span>
              )}
            </button>
            <button
              onClick={handleCancelPlay}
              className="px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-lg 
                       shadow-lg shadow-gray-900/50 hover:from-gray-700 hover:to-gray-600 
                       transform hover:scale-105 transition-all duration-200
                       border border-gray-700/50"
            >
              <span className="font-medium">Cancel</span>
            </button>
          </div>
        )}

        {/* Play card button with blood moon theme - only show when a card is selected but not confirming */}
        {selectedCardId && !confirmingCardId && (
          <button
            onClick={() => handlePlayCard(selectedCardId)}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-red-900 to-red-700 text-white rounded-lg 
                     shadow-lg shadow-red-900/50 hover:from-red-800 hover:to-red-600 
                     transform hover:scale-105 transition-all duration-200
                     border border-red-800/50"
          >
            <span className="font-medium">Summon Card</span>
            {cards.find(c => c.id === selectedCardId)?.type === CardType.BLOOD && (
              <span className="ml-2 text-red-200 text-sm">
                (Blood Cost: {cards.find(c => c.id === selectedCardId)?.stats.bloodMoonCost})
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerHand; 