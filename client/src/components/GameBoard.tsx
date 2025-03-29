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

  // Get card type colors
  const getCardTypeStyles = (type: CardTypeEnum) => {
    switch (type) {
      case CardTypeEnum.SUN:
        return {
          gradient: 'from-[#E9B145] to-[#D4A43E]',
          shadow: 'shadow-[0_0_15px_rgba(233,177,69,0.4)]',
          text: 'text-[#E9B145]',
          border: 'border-[#E9B145]/50',
          icon: '☀️'
        };
      case CardTypeEnum.MOON:
        return {
          gradient: 'from-[#6E8AE9] to-[#5A76D1]',
          shadow: 'shadow-[0_0_15px_rgba(110,138,233,0.4)]',
          text: 'text-[#6E8AE9]',
          border: 'border-[#6E8AE9]/50',
          icon: '🌙'
        };
      case CardTypeEnum.ECLIPSE:
        return {
          gradient: 'from-[#9C4ED6] to-[#7E3EB0]',
          shadow: 'shadow-[0_0_15px_rgba(156,78,214,0.4)]',
          text: 'text-[#9C4ED6]',
          border: 'border-[#9C4ED6]/50',
          icon: '🌓'
        };
      default:
        return {
          gradient: 'from-[#E9B145] to-[#D4A43E]',
          shadow: 'shadow-[0_0_15px_rgba(233,177,69,0.4)]',
          text: 'text-[#E9B145]',
          border: 'border-[#E9B145]/50',
          icon: '☀️'
        };
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-between w-full h-full p-4">
      {/* Game elements */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full">
        {/* Phase and momentum indicators */}
        <div className="flex items-center justify-between w-full px-8 py-4 absolute">
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
          
          {/* Battlefield - Enhanced UI with increased height */}
          <div className="flex items-center justify-center w-full my-6 h-[250px] min-h-[250px]">
            <div className="relative w-full max-w-4xl h-full rounded-xl   overflow-hidden">
              {/* Battlefield decorative elements */}
              <div className="absolute inset-0 pointer-events-none">
                
                {/* Phase-based ambient glow */}
                <div className={`absolute inset-0 opacity-20 ${
                  gameState.currentPhase === 'DAY' 
                    ? 'bg-gradient-radial from-amber-500/10 to-transparent' 
                    : 'bg-gradient-radial from-blue-500/10 to-transparent'
                }`}></div>
              </div>
              
              {/* Last played cards visualization - Enhanced UI */}
              <div className="absolute inset-0 flex items-center justify-center">
                {gameState.lastPlayedCards && gameState.lastPlayedCards.length > 0 ? (
                  <div className="flex items-center gap-20">
                    {gameState.lastPlayedCards.slice(-2).map((playedCard, index) => {
                      const isPlayerCard = playedCard.playerId === gameState.player.id;
                      const cardStyles = getCardTypeStyles(playedCard.cardType);
                      
                      return (
                        <div key={index} className="transition-all duration-300 group relative">
                          <div className={`relative w-40 h-56 rounded-xl overflow-hidden ${cardStyles.shadow} `}>
                            {/* Card outer frame with gradient border */}
                            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${cardStyles.gradient} p-[2px]`}>
                              {/* Card inner frame */}
                              <div className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-b from-[#0A0A10] to-black">
                                {/* Card background image with overlay */}
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getCardBackImage(playedCard.cardType)})` }}>
                                  <div className="absolute inset-0 bg-black/70"></div>
                                </div>
                                
                                {/* Card content */}
                                <div className="absolute inset-0 flex flex-col items-center p-3">
                                  {/* Player indicator at the top */}
                                  <div className={`absolute top-1 left-0 right-0 text-center ${
                                    isPlayerCard ? 'bg-green-900/60' : 'bg-red-900/60'
                                  } mx-2 py-0.5 rounded-sm text-[10px] font-bold ${
                                    isPlayerCard ? 'text-green-300' : 'text-red-300'
                                  }`}>
                                    {isPlayerCard ? 'YOU' : 'OPPONENT'}
                                  </div>
                                  
                                  {/* Card type icon */}
                                  <div className={`mt-6 mb-1 text-xl ${cardStyles.text}`}>
                                    {cardStyles.icon}
                                  </div>
                                  
                                  {/* Card name */}
                                  <div className={`text-sm font-bold text-white mb-2 px-3 py-1 rounded-md bg-[#0A0A10]/80 ${cardStyles.border} w-full text-center`}>
                                    {playedCard.cardName}
                                  </div>
                                  
                                  {/* Card stats with elegant styling */}
                                  <div className="flex items-center justify-center gap-3 mt-1">
                                    <div className="flex items-center bg-[#1A1A20]/80 px-2 py-1 rounded-md border border-gray-700/30">
                                      <span className="text-xs text-yellow-400 font-bold">{playedCard.cardCost}</span>
                                      <span className="text-xs text-yellow-400 ml-1">⚡</span>
                                    </div>
                                    
                                    {playedCard.cardDamage > 0 && (
                                      <div className="flex items-center bg-[#1A1A20]/80 px-2 py-1 rounded-md border border-red-700/30">
                                        <span className="text-xs text-red-400 font-bold">{playedCard.cardDamage}</span>
                                        <span className="text-xs text-red-400 ml-1">⚔️</span>
                                      </div>
                                    )}
                                    
                                    {playedCard.cardHealing > 0 && (
                                      <div className="flex items-center bg-[#1A1A20]/80 px-2 py-1 rounded-md border border-green-700/30">
                                        <span className="text-xs text-green-400 font-bold">{playedCard.cardHealing}</span>
                                        <span className="text-xs text-green-400 ml-1">❤️</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Turn info at bottom */}
                                  <div className="absolute bottom-1 left-0 right-0 text-center">
                                    <div className="text-[10px] text-gray-400 bg-[#0A0A10]/80 mx-2 py-0.5 rounded-sm">
                                      Turn {playedCard.turnPlayed}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Description tooltip on hover */}
                          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 bg-[#0A0A10]/95 backdrop-blur-sm text-white text-xs rounded-md shadow-xl border border-gray-700">
                            <div className="font-bold text-center mb-1">{playedCard.cardName}</div>
                            <div className="text-gray-300">{playedCard.cardDescription}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 p-4">
                    <div className="text-lg mb-2">Battlefield Awaits</div>
                    <div className="text-sm">Play a card to begin the duel</div>
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
                ? 'bg-gradient-to-r from-[#9C4ED6] to-[#7E3EB0] text-white hover:shadow-[0_0_15px_rgba(156,78,214,0.3)] hover:-translate-y-1'
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