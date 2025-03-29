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
  const { gameState, playCard, playSecretCard, endTurn } = useGame()
  const { currentPhase, setCurrentPhase } = useTheme()
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)
  
  useEffect(() => {
    // Reset selected card when turn changes
    setSelectedCard(null)
    
    // Update theme phase when game phase changes
    if (gameState?.currentPhase) {
      setCurrentPhase(gameState.currentPhase)
    }
    console.log('gameState phase:', gameState?.currentPhase, 'theme phase:', currentPhase)
  }, [gameState?.isYourTurn, gameState?.currentPhase, setCurrentPhase])
  
  if (!gameState) return null
  
  const handleCardClick = (card: CardType) => {
    if (!gameState.isYourTurn) {
      console.log("Not your turn");
      return;
    }
    
    // Calculate if card is playable
    let effectiveCost = card.cost;
    if (gameState.player.inOverdrive) {
      effectiveCost = Math.max(0, card.cost - 1);
    }
    
    if (gameState.player.energy < effectiveCost) {
      console.log(`Not enough energy: need ${effectiveCost}, have ${gameState.player.energy}`);
      return;
    }
    
    console.log("Playing card:", card.name);
    setSelectedCard(card)
    playCard(card.id)
  }
  
  const handleSecretCardPlay = (card: CardType) => {
    if (!gameState.isYourTurn) {
      console.log("Not your turn");
      return;
    }
    
    // Calculate if card is playable
    let effectiveCost = card.cost;
    if (gameState.player.inOverdrive) {
      effectiveCost = Math.max(0, card.cost - 1);
    }
    
    if (gameState.player.energy < effectiveCost) {
      console.log(`Not enough energy: need ${effectiveCost}, have ${gameState.player.energy}`);
      return;
    }
    
    console.log("Playing secret card:", card.name);
    setSelectedCard(card)
    playSecretCard(card.id)
  }
  
  const handleEndTurn = () => {
    if (gameState.isYourTurn) {
      console.log("Ending turn");
      endTurn()
    }
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

  return (
    <div className="relative flex flex-col items-center justify-between w-full h-full p-4">
      {/* Game elements */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full">
        {/* Top bar with phase and momentum indicators */}
        <div className="flex items-center justify-between w-full px-8 py-4">
          <PhaseIndicator phase={gameState.currentPhase} turnCount={gameState.turnCount} />
          <MomentumIndicator />
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
          {gameState.secretCards && (
            <SecretCardDisplay />
          )}
          
          {/* Battlefield */}
          <div className="flex items-center justify-center w-full my-6 h-1/3 min-h-[150px]">
            <div className="relative w-full max-w-3xl h-full rounded-xl bg-black/30 backdrop-blur-sm border border-gray-800/50 overflow-hidden">
              {/* Last played cards visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                {gameState.lastPlayedCards && gameState.lastPlayedCards.length > 0 && (
                  <div className="flex items-center gap-8">
                    {gameState.lastPlayedCards.slice(-2).map((playedCard, index) => {
                      const isPlayerCard = playedCard.playerId === gameState.player.id;
                      
                      return (
                        <div key={index} className={`transform ${isPlayerCard ? '' : 'rotate-180'} transition-all duration-300`}>
                          <div className="relative w-24 h-32 rounded-md overflow-hidden border border-gray-700 shadow-lg">
                            <img 
                              src={getCardBackImage(playedCard.cardType)} 
                              alt="Card" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2">
                              <div className="text-xs font-bold text-white mb-1">
                                {playedCard.cardName}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-yellow-400">{playedCard.cardCost}⚡</span>
                                {playedCard.cardDamage > 0 && (
                                  <span className="text-xs text-red-400">{playedCard.cardDamage}🔥</span>
                                )}
                                {playedCard.cardHealing > 0 && (
                                  <span className="text-xs text-green-400">{playedCard.cardHealing}💚</span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {isPlayerCard ? 'You' : 'Opponent'} • Turn {playedCard.turnPlayed}
                              </div>
                            </div>
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
          
          <button 
            onClick={handleEndTurn}
            disabled={!gameState.isYourTurn}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              gameState.isYourTurn 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 cursor-pointer'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            End Turn
          </button>
          
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
                    if (isPlayable) {
                      handleCardClick(card);
                    }
                  }}
                >
                  <Card
                    card={card}
                    onClick={() => {
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
                    currentPhase={gameState.currentPhase}
                    effectiveCost={effectiveCost}
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