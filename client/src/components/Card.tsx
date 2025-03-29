import { useState } from 'react'
import { Card as CardType, CardType as CardTypeEnum, EffectType, Phase } from '../types/gameTypes'
import { useGame } from '../contexts/GameContext'

// Import card images
import cardSunImage from '../assets/cards/card_sun.png'
import cardMoonImage from '../assets/cards/card_moon.png'
import cardEclipseImage from '../assets/cards/card_eclipse.png'

interface CardProps {
  card: CardType
  onClick: () => void
  onSecretPlay?: () => void
  isPlayable: boolean
  currentPhase: string
  effectiveCost: number
}

const Card = ({ card, onClick, onSecretPlay, isPlayable, currentPhase, effectiveCost }: CardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showSecretOption, setShowSecretOption] = useState(false)
  const { gameState } = useGame()
  
  if (!gameState) return null
  
  // Safely access momentum with fallbacks
  const playerId = gameState.player?.id
  const momentum = playerId && gameState.playerMomentum ? 
    gameState.playerMomentum[playerId] || { sun: 0, moon: 0, eclipse: 0 } : 
    { sun: 0, moon: 0, eclipse: 0 }
  
  const isEnhanced = 
    (card.type === CardTypeEnum.SUN && currentPhase === 'day') ||
    (card.type === CardTypeEnum.MOON && currentPhase === 'night')
  
  const hasMomentum = 
    (card.type === CardTypeEnum.SUN && momentum?.sun > 0) ||
    (card.type === CardTypeEnum.MOON && momentum?.moon > 0) ||
    (card.type === CardTypeEnum.ECLIPSE && momentum?.eclipse > 0)

  // Card type specific styling
  const cardTypeStyles = {
    [CardTypeEnum.SUN]: {
      gradient: 'from-amber-500 to-amber-700',
      borderGradient: 'from-amber-400 via-amber-300 to-amber-500',
      textColor: 'text-amber-200',
      glow: isEnhanced ? 'shadow-[0_0_15px_rgba(245,158,11,0.6)]' : '',
      icon: '☀️',
      bgImage: `url(${cardSunImage})`,
      momentumCount: momentum?.sun || 0,
      cardBackImage: cardSunImage,
      statColor: 'bg-amber-600',
      statShadow: 'shadow-[0_0_8px_rgba(245,158,11,0.7)]',
      rarityColor: 'text-amber-400'
    },
    [CardTypeEnum.MOON]: {
      gradient: 'from-blue-500 to-indigo-700',
      borderGradient: 'from-blue-400 via-indigo-300 to-blue-500',
      textColor: 'text-blue-200',
      glow: isEnhanced ? 'shadow-[0_0_15px_rgba(59,130,246,0.6)]' : '',
      icon: '🌙',
      bgImage: `url(${cardMoonImage})`,
      momentumCount: momentum?.moon || 0,
      cardBackImage: cardMoonImage,
      statColor: 'bg-blue-600',
      statShadow: 'shadow-[0_0_8px_rgba(59,130,246,0.7)]',
      rarityColor: 'text-blue-400'
    },
    [CardTypeEnum.ECLIPSE]: {
      gradient: 'from-purple-500 to-purple-800',
      borderGradient: 'from-purple-400 via-fuchsia-300 to-purple-500',
      textColor: 'text-purple-200',
      glow: isEnhanced ? 'shadow-[0_0_15px_rgba(147,51,234,0.6)]' : '',
      icon: '🌓',
      bgImage: `url(${cardEclipseImage})`,
      momentumCount: momentum?.eclipse || 0,
      cardBackImage: cardEclipseImage,
      statColor: 'bg-purple-600',
      statShadow: 'shadow-[0_0_8px_rgba(147,51,234,0.7)]',
      rarityColor: 'text-purple-400'
    }
  }
  
  // Add a fallback in case card.type is not recognized
  const styles = cardTypeStyles[card.type] || cardTypeStyles[CardTypeEnum.SUN];
  
  // Check if card can be played as a secret
  const canBeSecret = card.isSecret || (card.effects && card.effects.some(effect => effect.type === EffectType.TRAP))

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayable && !showSecretOption) {
      onClick();
    }
  };
  // Inside the Card component, add this function to render effect icons
  const renderEffectIcons = (effects :any) => {
    if (!effects || effects.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {effects.map((effect: any, index:any) => {
          let icon = '✨'; // Default effect icon
          
          // Map effect types to appropriate icons
          switch(effect.type) {
            case 'DRAW': icon = '🃏'; break;
            case 'DISCARD': icon = '❌'; break;
            case 'SWITCH_PHASE': icon = '🔄'; break;
            case 'TRAP': icon = '⚠️'; break;
            // Add more effect types as needed
          }
          
          return (
            <div key={index} className="flex items-center bg-black/40 rounded px-1 text-[10px]">
              <span className="mr-1">{icon}</span>
              <span>{effect.type}{effect.value ? `: ${effect.value}` : ''}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`relative w-[180px] h-[250px] transition-all duration-300 ${
        isPlayable ? 'cursor-pointer hover:scale-105' : 'opacity-70 grayscale cursor-not-allowed'
      } ${styles.glow} transform perspective-800`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowSecretOption(false)
      }}
    >
      {/* Card outer frame with gradient border */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${styles.borderGradient} p-[2px]`}>
        {/* Card inner frame */}
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-b from-gray-900 to-black">
          {/* Card background image with overlay */}
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: styles.bgImage }}>
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          
          {/* Card content */}
          <div className="relative flex flex-col h-full">
            {/* Card header with name banner */}
            <div className={`p-2 bg-gradient-to-r ${styles.gradient} border-b-2 border-white/20`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="text-lg">{styles.icon}</div>
                  <h3 className="text-sm font-bold text-white tracking-wide">{card.name}</h3>
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-black/80 to-black flex items-center justify-center text-sm font-bold text-white border border-white/30">
                  {effectiveCost}
                </div>
              </div>
            </div>
            
            {/* Card type indicator */}
            <div className={`absolute top-[40px] left-0 ${styles.textColor} text-xs font-semibold px-2 py-0.5 bg-black/70 rounded-r-md`}>
              {card.type}
            </div>
            
            {/* Momentum indicator */}
            {hasMomentum && (
              <div className="absolute top-2 right-2 flex">
                {[...Array(styles.momentumCount)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full mx-0.5 bg-gradient-to-br ${styles.gradient} animate-pulse ${styles.statShadow}`}
                  />
                ))}
              </div>
            )}
            
            {/* Overdrive indicator */}
            {gameState.player.inOverdrive && card.cost > 0 && (
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-[10px] text-white font-bold shadow-[0_0_8px_rgba(239,68,68,0.7)]">
                  -1
                </div>
              </div>
            )}
            
            {/* Card Description */}
            <div className="p-3 mt-2 text-xs text-white border-t border-white/10 flex-grow bg-black/40 backdrop-blur-sm">
              <p className="leading-tight">{card.description}</p>
              
              {/* Show effect icons */}
              {renderEffectIcons(card.effects)}
              
              {/* Rarity indicator */}
              {card.rarity && card.rarity !== 'NORMAL' && (
                <div className={`mt-2 text-[10px] font-bold ${
                  card.rarity === 'EPIC' ? 'text-fuchsia-400' : 'text-amber-400'
                }`}>
                  {card.rarity.toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Card Stats */}
            <div className="flex items-center justify-around p-2 border-t border-white/20 bg-black/60">
              {card.damage > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-br from-red-900/70 to-red-700/50 border border-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  <div className="text-sm">⚔️</div>
                  <span className="text-sm font-bold text-white">
                    {isEnhanced && card.type !== CardTypeEnum.ECLIPSE ? Math.floor(card.damage * 1.5) : card.damage}
                  </span>
                </div>
              )}
              
              {card.healing > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-br from-green-900/70 to-green-700/50 border border-green-500/70 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                  <div className="text-sm">❤️</div>
                  <span className="text-sm font-bold text-white">
                    {isEnhanced && card.type !== CardTypeEnum.ECLIPSE ? Math.floor(card.healing * 1.5) : card.healing}
                  </span>
                </div>
              )}
              
              {/* If card has neither damage nor healing but has effects, show an effect indicator */}
              {card.damage === 0 && card.healing === 0 && card.effects && card.effects.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-br from-blue-900/70 to-blue-700/50 border border-blue-500/70 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                  <div className="text-sm">✨</div>
                  <span className="text-sm font-bold text-white">Effect</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Secret play option */}
      {isHovered && canBeSecret && isPlayable && (
        <div 
          className="absolute -bottom-10 left-0 right-0 bg-gradient-to-r from-indigo-800 to-purple-800 text-white text-center py-2 rounded-md cursor-pointer border border-indigo-400 shadow-lg"
          onClick={(e) => {
            e.stopPropagation()
            setShowSecretOption(true)
          }}
        >
          Play as Secret
        </div>
      )}
      
      {/* Secret confirmation */}
      {showSecretOption && (
        <div className="absolute inset-0 bg-black/90 rounded-lg flex flex-col items-center justify-center z-10 border-2 border-indigo-500/50">
          <p className="text-white text-center mb-4 font-bold">Play as face-down secret?</p>
          <div className="flex gap-4">
            <button 
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-md hover:from-indigo-500 hover:to-purple-600 shadow-md"
              onClick={(e) => {
                e.stopPropagation()
                if (onSecretPlay) {
                  onSecretPlay()
                }
                setShowSecretOption(false)
              }}
            >
              Yes
            </button>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-md hover:from-gray-600 hover:to-gray-700 shadow-md"
              onClick={(e) => {
                e.stopPropagation()
                setShowSecretOption(false)
              }}
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Card 