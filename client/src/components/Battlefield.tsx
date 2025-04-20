import React from 'react';
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
  };
  playerId: string;
  activeEffects: {
    id: string;
    type: string;
    value: number;
    duration: number;
    source?: string;
  }[];
  bloodMoonActive: boolean;
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
  playerId,
  activeEffects,
  bloodMoonActive,
}) => {
  // Determine background color based on current phase
  let phaseColor;
  switch (currentPhase) {
    case Phase.PHASE_ONE:
      phaseColor = 'bg-blood-primary/5';
      break;
    case Phase.PHASE_TWO:
      phaseColor = 'bg-void-primary/5';
      break;
    case Phase.PHASE_THREE:
      phaseColor = 'bg-eclipse-primary/5';
      break;
    default:
      phaseColor = 'bg-gray-900/20';
  }

  // Get the last played card details
  const getLastPlayedCardDetails = () => {
    if (!lastPlayedCard) return null;
    
    const card = playerCards.find(c => c.id === lastPlayedCard.cardId) || 
                opponentCards.find(c => c.id === lastPlayedCard.cardId);
    
    return {
      card,
      isPlayer: lastPlayedCard.playerId === playerId
    };
  };

  const lastPlayedDetails = getLastPlayedCardDetails();
  const totalCards = playerCards.length + opponentCards.length;

  return (
    <div className="flex-grow flex flex-col items-center justify-center">
      <div className={`w-full max-w-2xl h-[200px] rounded-lg mb-2 relative ${phaseColor}`}>
        {/* Central board with last played card and pile */}
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

            {/* Last played card */}
            {lastPlayedDetails?.card && (
              <div className="transform hover:scale-105 transition-transform duration-300">
                <Card 
                  card={lastPlayedDetails.card}
                  isSelected={false}
                  canPlay={false}
                  onPlay={() => {}}
                />
              </div>
            )}
          </div>
        </div>

        {/* Phase effects */}
        {activeEffects && activeEffects.length > 0 && (
          <div className="absolute top-1 left-1 flex flex-col space-y-0.5">
            {activeEffects.map((effect, index) => (
              <div key={index} className="bg-gray-900/70 text-xs text-white px-1.5 py-0.5 rounded">
                {effect.type} ({effect.duration})
              </div>
            ))}
          </div>
        )}

        {/* Blood Moon indicator */}
        {bloodMoonActive && (
          <div className="absolute top-1 right-1 bg-blood-primary/70 text-xs text-white px-1.5 py-0.5 rounded">
            Blood Moon Active
          </div>
        )}
      </div>
    </div>
  );
};

export default Battlefield; 