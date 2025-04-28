import React, { useState } from 'react';
import { Card as CardType, Phase } from '../types/gameTypes';
import Card from './Card';

interface BattlefieldProps {
  currentPhase: Phase;
  playerCards: CardType[];
  opponentCards: CardType[];
  lastPlayedCard?: {
    cardId: string;
    playerId: string;
    effects: any[];
  } | any;
  lastPlayedCards?: {
    cardId: string;
    playerId: string;
    effects: any[];
    turnNumber?: number;
  }[] | any[];
  lastPlayedCardsForTurn?: {
    cardId: string;
    playerId: string;
    effects: any[];
    turnNumber?: number;
  }[] | any[];
  playerId: string;
  activeEffects: {
    id: string;
    type: string;
    value: number;
    duration: number;
    source?: string;
  }[];
  bloodMoonActive: boolean;
  turnCount: number;
  isYourTurn: boolean;
  onViewCardDetails: (card: any) => void;
  onSelectCard: (card: CardType) => void;
  selectedCard: CardType | null;
  showCardDetails: (card: CardType) => void;
}

const Battlefield: React.FC<BattlefieldProps> = ({
  currentPhase,
  playerCards,
  opponentCards,
  lastPlayedCard,
  lastPlayedCards,
  lastPlayedCardsForTurn,
  playerId,
  activeEffects,
  bloodMoonActive,
}) => {
  const [viewingCurrentTurn, setViewingCurrentTurn] = useState(true);

  // Determine background color based on current phase
  let phaseColor;
  switch (currentPhase) {
    case Phase.Normal:
      phaseColor = 'bg-green-900/20';
      break;
    case Phase.BloodMoon:
      phaseColor = 'bg-red-900/20';
      break;
    case Phase.Void:
      phaseColor = 'bg-purple-900/20';
      break;
    default:
      phaseColor = 'bg-gray-900/20';
  }

  // Get cards to display based on which turn we're viewing
  const getRecentPlayedCards = () => {
    const cards: { card: CardType; isPlayer: boolean; index: number }[] = [];
    
    // Choose which set of cards to display
    const cardsToCheck = viewingCurrentTurn 
      ? lastPlayedCards || []
      : lastPlayedCardsForTurn || [];
    
    if (cardsToCheck.length > 0) {
      cardsToCheck.forEach((playedCard, index) => {
        const cardId = playedCard.cardId || playedCard.id;
        if (!cardId) return;
        
        const card = playerCards.find(c => c.id === cardId) || 
                     opponentCards.find(c => c.id === cardId);
        
        if (card) {
          cards.push({
            card,
            isPlayer: playedCard.playerId === playerId,
            index
          });
        }
      });
    } else if (viewingCurrentTurn && lastPlayedCard) {
      const cardId = lastPlayedCard.cardId || lastPlayedCard.id;
      if (cardId) {
        const card = playerCards.find(c => c.id === cardId) || 
                    opponentCards.find(c => c.id === cardId);
        
        if (card) {
          cards.push({
            card,
            isPlayer: lastPlayedCard.playerId === playerId,
            index: 0
          });
        }
      }
    }
    
    return cards;
  };

  const playedCards = getRecentPlayedCards();
  const totalCards = playerCards.length + opponentCards.length;
  
  const toggleViewTurn = () => {
    setViewingCurrentTurn(!viewingCurrentTurn);
  };
  
  const hasCurrentTurnCards = (lastPlayedCards && lastPlayedCards.length > 0) || lastPlayedCard;
  const hasLastTurnCards = lastPlayedCardsForTurn && lastPlayedCardsForTurn.length > 0;

  return (
    <div className="flex-grow flex flex-col items-center justify-center">
      <div className={`w-full max-w-2xl h-[200px] rounded-lg mb-2 relative `}>
        {/* Central board with played card and pile */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-6">
            {/* Card pile */}
            <div className="relative w-24 h-36">
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-lg">
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                  {totalCards}
                </div>
              </div>
            </div>

            {/* Played cards display */}
            {playedCards.length > 0 ? (
              <div className="relative">
                <div className="flex items-center">
                  {playedCards.map((cardData, index) => (
                    <div 
                      key={`${cardData.card.id}-${index}`}
                      style={{
                        marginLeft: index === 0 ? '0' : '-70px',
                        zIndex: 10 - index,
                        transform: `rotate(${(index - (playedCards.length - 1) / 2) * 5}deg)`
                      }}
                    >
                      <Card 
                        card={cardData.card}
                        isSelected={false}
                        canPlay={false}
                        onPlay={() => {}}
                      />
                      <div className="text-xs text-center mt-1 text-gray-300">
                        {cardData.isPlayer ? 'Your card' : 'Opponent\'s card'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm">
                No cards played {viewingCurrentTurn ? 'this turn' : 'last turn'}
              </div>
            )}
          </div>
        </div>

        {/* Turn toggle button */}
        {(hasCurrentTurnCards || hasLastTurnCards) && (
          <div className="absolute top-2 right-2">
            <button 
              onClick={toggleViewTurn}
              className="px-3 py-1 bg-gray-800/70 text-white text-xs rounded-lg hover:bg-gray-700/70"
            >
              View {viewingCurrentTurn ? 'Last' : 'Current'} Turn
            </button>
          </div>
        )}

        {/* Turn indicator */}
        <div className="absolute top-2 left-2 bg-gray-900/70 px-2 py-1 rounded-lg text-xs text-white">
          {viewingCurrentTurn ? 'Current' : 'Last'} Turn
          {playedCards.length > 0 && ` • ${playedCards.length} cards`}
        </div>

        {/* Phase effects */}
        {activeEffects && activeEffects.length > 0 && (
          <div className="absolute bottom-2 left-2 flex space-x-1">
            {activeEffects.map((effect, index) => (
              <div 
                key={`${effect.id}-${index}`}
                className="bg-gray-900/70 px-2 py-1 rounded-lg text-xs text-white"
                title={`${effect.type}: ${effect.value}`}
              >
                {effect.type}
              </div>
            ))}
          </div>
        )}

        {/* Blood Moon indicator */}
        {bloodMoonActive && (
          <div className="absolute bottom-2 right-2 bg-blood-primary/70 text-xs text-white px-1.5 py-0.5 rounded">
            Blood Moon Active
          </div>
        )}
      </div>
    </div>
  );
};

export default Battlefield; 