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
  currentPhase: Phase
}

const Card = ({ card, onClick, onSecretPlay, isPlayable, currentPhase }: CardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showSecretOption, setShowSecretOption] = useState(false)
  const { momentum, inOverdrive } = useGame()
  
  const isEnhanced = 
    (card.type === CardTypeEnum.SUN && currentPhase === Phase.DAY) ||
    (card.type === CardTypeEnum.MOON && currentPhase === Phase.NIGHT)
  
  const hasMomentum = 
    (card.type === CardTypeEnum.SUN && momentum?.sun > 0) ||
    (card.type === CardTypeEnum.MOON && momentum?.moon > 0) ||
    (card.type === CardTypeEnum.ECLIPSE && momentum?.eclipse > 0)

  // Card type specific styling
  const cardTypeStyles = {
    [CardTypeEnum.SUN]: {
      gradient: 'from-sun-primary to-sun-secondary',
      border: 'border-sun-primary/50',
      glow: isEnhanced ? 'card-glow-sun' : '',
      icon: '☀️',
      bgPattern: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sun-primary/10 via-transparent to-transparent',
      momentumCount: momentum?.sun || 0,
      cardBackImage: cardSunImage
    },
    [CardTypeEnum.MOON]: {
      gradient: 'from-moon-primary to-moon-secondary',
      border: 'border-moon-primary/50',
      glow: isEnhanced ? 'card-glow-moon' : '',
      icon: '🌙',
      bgPattern: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-moon-primary/10 via-transparent to-transparent',
      momentumCount: momentum?.moon || 0,
      cardBackImage: cardMoonImage
    },
    [CardTypeEnum.ECLIPSE]: {
      gradient: 'from-eclipse-primary to-eclipse-secondary',
      border: 'border-eclipse-primary/50',
      glow: isEnhanced ? 'card-glow-eclipse' : '',
      icon: '🌓',
      bgPattern: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-eclipse-primary/10 via-transparent to-transparent',
      momentumCount: momentum?.eclipse || 0,
      cardBackImage: cardEclipseImage
    }
  }
  
  // Add a fallback in case card.type is not recognized
  const styles = cardTypeStyles[card.type] || cardTypeStyles[CardTypeEnum.SUN];
  
  // Check if card can be played as a secret
  const canBeSecret = card.isSecret || (card.effects && card.effects.some(effect => effect.type === EffectType.TRAP))
  
  // Calculate cost with Overdrive
  const displayCost = inOverdrive ? Math.max(0, card.cost - 1) : card.cost

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Card clicked directly, isPlayable:", isPlayable);
    if (isPlayable && !showSecretOption) {
      onClick();
    }
  };

  return (
    <div
      className={`relative w-[180px] h-[250px] transition-all duration-300 ${
        isPlayable ? 'cursor-pointer hover:shadow-xl' : 'opacity-70 grayscale cursor-not-allowed'
      } ${styles.glow || ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowSecretOption(false)
      }}
    >
      {/* Card frame */}
      <div className={`absolute inset-0 rounded-lg overflow-hidden border-2 ${styles.border} shadow-lg`}>
        {/* Card background image */}
        <img 
          src={styles.cardBackImage} 
          alt="Card Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Card content overlay */}
        <div className="absolute inset-0 bg-black/60">
          {/* Card pattern */}
          <div className={`absolute inset-0 ${styles.bgPattern}`}></div>
        </div>
        
        {/* Card content */}
        <div className="relative flex flex-col h-full">
          {/* Card header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <div className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${styles.gradient} flex items-center justify-center text-sm`}>
                {styles.icon}
              </div>
              <span className="text-xs font-bold text-white">{card.name}</span>
            </div>
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${styles.gradient} flex items-center justify-center text-xs font-bold text-white`}>
              {displayCost}
            </div>
          </div>
          
          {/* Momentum indicator */}
          {hasMomentum && (
            <div className="absolute top-2 right-8 flex items-center gap-1">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${styles.gradient} flex items-center justify-center text-[10px] text-white font-bold`}>
                {styles.momentumCount}
              </div>
            </div>
          )}
          
          {/* Overdrive cost reduction indicator */}
          {inOverdrive && card.cost > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] text-white font-bold">
                -1
              </div>
            </div>
          )}
          
          {/* Card Description */}
          <div className="p-3 text-xs text-gray-300 border-t border-gray-800 flex-grow">
            <p>{card.description}</p>
            
            {/* Rarity indicator */}
            {card.rarity && card.rarity !== 'normal' && (
              <div className={`mt-1 text-[10px] font-bold ${
                card.rarity === 'epic' ? 'text-purple-400' : 'text-yellow-400'
              }`}>
                {card.rarity.toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Card Stats */}
          <div className="flex items-center justify-around p-3 border-t border-gray-800">
            {card.damage > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.7)]"></div>
                <span className="text-sm font-bold text-white">
                  {isEnhanced && card.type !== CardTypeEnum.ECLIPSE ? Math.floor(card.damage * 1.5) : card.damage}
                </span>
              </div>
            )}
            
            {card.healing > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.7)]"></div>
                <span className="text-sm font-bold text-white">
                  {isEnhanced && card.type !== CardTypeEnum.ECLIPSE ? Math.floor(card.healing * 1.5) : card.healing}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Secret play option */}
      {isHovered && canBeSecret && isPlayable && (
        <div 
          className="absolute -bottom-10 left-0 right-0 bg-purple-900/90 text-white text-center py-2 rounded-md cursor-pointer border border-purple-500 shadow-lg"
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
        <div className="absolute inset-0 bg-black/80 rounded-lg flex flex-col items-center justify-center z-10">
          <p className="text-white text-center mb-4">Play as face-down secret?</p>
          <div className="flex gap-4">
            <button 
              className="px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-600"
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
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
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