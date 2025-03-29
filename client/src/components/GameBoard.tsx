import { useEffect, useState } from 'react'
import { useGame } from '../contexts/GameContext'
import { useTheme } from '../contexts/ThemeContext'
import Card from './Card'
import PlayerInfo from './PlayerInfo'
import PhaseIndicator from './PhaseIndicator'
import MomentumIndicator from './MomentumIndicator'
import SecretCardDisplay from './SecretCardDisplay'
import { Card as CardType, CardType as CardTypeEnum } from '../types/gameTypes'

// Import card images
import cardSunImage from '../assets/cards/card_sun.png'
import cardMoonImage from '../assets/cards/card_moon.png'
import cardEclipseImage from '../assets/cards/card_eclipse.png'

const GameBoard = () => {
  const { gameState, playCard, playSecretCard } = useGame()
  const { currentPhase } = useTheme()
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  
  useEffect(() => {
    // Reset selected card when turn changes
    setSelectedCard(null)
  }, [gameState?.isYourTurn])
  
  if (!gameState) return null
  console.log("gameState", gameState)
  
  const handleCardClick = (card: CardType) => {
    console.log("Card clicked:", card.name);
    if (!gameState.isYourTurn) {
      console.log("Not your turn");
      return;
    }
    
    console.log("Playing card:", card.name);
    setSelectedCard(card)
    playCard(card.id)
  }
  
  const handleSecretCardPlay = (card: CardType) => {
    console.log("Secret card played:", card.name);
    if (!gameState.isYourTurn) {
      console.log("Not your turn");
      return;
    }
    
    setSelectedCard(card)
    playSecretCard(card.id)
  }

  // Get the appropriate card back image based on card type
  const getCardBackImage = (type: CardTypeEnum) => {
    switch (type) {
      case CardTypeEnum.SUN:
        return cardSunImage;
      case CardTypeEnum.MOON:
        return cardMoonImage;
      case CardTypeEnum.ECLIPSE:
        return cardEclipseImage;
      default:
        return cardSunImage;
    }
  };

  console.log("Is your turn:", gameState.isYourTurn);
  console.log("Player energy:", gameState.player.energy);

  return (
    <div className="relative flex flex-col items-center justify-between w-full h-full p-4 bg-gradient-to-b from-black/80 to-black/40">
      {/* Battlefield background */}
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30" 
           style={{ backgroundImage: `url(${currentPhase === 'day' ? '/backgrounds/day_battlefield.jpg' : '/backgrounds/night_battlefield.jpg'})` }}>
      </div>
      
      {/* Game elements */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full">
        {/* Top bar with phase and momentum indicators */}
        <div className="flex items-center justify-between w-full px-8 py-4">
          <PhaseIndicator phase={currentPhase} turnCount={gameState.turnCount} />
          <MomentumIndicator />
        </div>
        
        {/* Opponent hand */}
        <div className="flex justify-center mt-2 mb-4 perspective-1000">
          {Array.from({ length: gameState.opponent.handSize }).map((_, index) => {
            const totalCards = gameState.opponent.handSize;
            const middleIndex = Math.floor(totalCards / 2);
            const offset = index - middleIndex;
            const rotateY = offset * 5; // degrees of rotation
            const translateZ = Math.abs(offset) * -5; // push cards back slightly
            
            return (
              <div 
                key={index} 
                className="transform transition-all duration-200"
                style={{ 
                  transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px) rotate(180deg)`,
                  marginLeft: index > 0 ? '-100px' : '0'
                }}
              >
                <div className="relative w-[120px] h-[168px] rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={cardEclipseImage} 
                    alt="Card Back" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Center area with player info and battlefield */}
        <div className="flex flex-col items-center justify-center flex-1 w-full">
          {/* Opponent info */}
          <div className="w-full max-w-3xl px-4 mb-6">
            <PlayerInfo 
              player={gameState.opponent} 
              isOpponent={true} 
              isCurrentTurn={!gameState.isYourTurn} 
            />
          </div>
          
          {/* Secret cards area */}
          <SecretCardDisplay />
          
          {/* Battlefield */}
          <div className="flex items-center justify-center w-full my-6 h-1/3 min-h-[150px]">
            <div className="relative w-full max-w-3xl h-full rounded-xl bg-black/30 backdrop-blur-sm border border-gray-800/50 overflow-hidden">
              {/* Last played cards visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                {gameState.lastPlayedCards && gameState.lastPlayedCards.length > 0 && (
                  <div className="flex items-center gap-8">
                    {gameState.lastPlayedCards.slice(-2).map((playedCard, index) => {
                      const isPlayerCard = playedCard.playerId === gameState.player.id;
                      const card = gameState.player.hand.find(c => c.id === playedCard.cardId) || 
                                  { type: CardTypeEnum.ECLIPSE }; // Fallback
                      
                      return (
                        <div key={index} className={`transform ${isPlayerCard ? '' : 'rotate-180'} transition-all duration-300`}>
                          <div className="relative w-24 h-32 rounded-md overflow-hidden border border-gray-700 shadow-lg">
                            <img 
                              src={getCardBackImage(card.type)} 
                              alt="Card" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Player info */}
          <div className="w-full max-w-3xl px-4 mt-6">
            <PlayerInfo 
              player={gameState.player} 
              isOpponent={false} 
              isCurrentTurn={gameState.isYourTurn} 
            />
          </div>
        </div>
        
        {/* Energy and deck indicators */}
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto px-4 mt-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg">
              {gameState.player.energy}
            </div>
            <span className="text-sm text-yellow-400">Energy</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-400">Deck</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
              {gameState.player.deckSize}
            </div>
          </div>
        </div>
        
        {/* Player hand */}
        <div className="flex justify-center mt-4 gap-4 perspective-1000">
          {gameState.player.hand.map((card, index) => {
            const totalCards = gameState.player.hand.length;
            const middleIndex = Math.floor(totalCards / 2);
            const offset = index - middleIndex;
            const rotateY = offset * 5; // degrees of rotation
            const translateZ = Math.abs(offset) * -5; // push cards back slightly
            
            // Calculate if card is playable
            let effectiveCost = card.cost;
            if (gameState.player.inOverdrive) {
              effectiveCost = Math.max(0, card.cost - 1);
            }
            
            const isPlayable = gameState.isYourTurn && gameState.player.energy >= effectiveCost;
            
            console.log(`Card ${card.name} cost: ${card.cost}, effective cost: ${effectiveCost}, player energy: ${gameState.player.energy}, isPlayable: ${isPlayable}`);
            
            return (
              <div 
                key={card.id} 
                className={`transform transition-all duration-200 hover:z-10 ${isPlayable ? 'hover:-translate-y-4' : ''}`}
                style={{ 
                  transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
                  marginLeft: index > 0 ? '0' : '0' // No overlap
                }}
              >
                <div 
                  className={`${isPlayable ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    console.log("Card container clicked:", card.name);
                    if (isPlayable) {
                      handleCardClick(card);
                    }
                  }}
                >
                  <Card
                    card={card}
                    onClick={() => {
                      console.log("Card component clicked:", card.name);
                      if (isPlayable) {
                        handleCardClick(card);
                      }
                    }}
                    onSecretPlay={() => {
                      if (isPlayable) {
                        handleSecretCardPlay(card);
                      }
                    }}
                    isPlayable={isPlayable}
                    currentPhase={currentPhase}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Turn indicator */}
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full 
          ${gameState.isYourTurn 
            ? 'bg-gradient-to-r from-green-600 to-green-800 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]' 
            : 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
          } border border-white/20 backdrop-blur-sm`}>
          <span className="text-lg font-bold tracking-wider">
            {gameState.isYourTurn ? 'YOUR TURN' : 'OPPONENT\'S TURN'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default GameBoard 