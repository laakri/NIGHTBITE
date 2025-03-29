import { useState } from 'react'
import { Card as CardType, CardType as CardTypeEnum, Phase } from '../types/gameTypes'

interface CardProps {
  card: CardType
  onClick: () => void
  isPlayable: boolean
  currentPhase: Phase
}

const Card = ({ card, onClick, isPlayable, currentPhase }: CardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const isEnhanced = 
    (card.type === CardTypeEnum.SUN && currentPhase === Phase.DAY) ||
    (card.type === CardTypeEnum.NIGHT && currentPhase === Phase.NIGHT)

  // Card type specific styling
  const cardTypeStyles = {
    [CardTypeEnum.SUN]: {
      gradient: 'from-sun-primary to-sun-secondary',
      border: 'border-sun-primary/50',
      glow: isEnhanced ? 'card-glow-sun' : '',
      icon: '☀️',
      bgPattern: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sun-primary/10 via-transparent to-transparent'
    },
    [CardTypeEnum.NIGHT]: {
      gradient: 'from-moon-primary to-moon-secondary',
      border: 'border-moon-primary/50',
      glow: isEnhanced ? 'card-glow-moon' : '',
      icon: '🌙',
      bgPattern: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-moon-primary/10 via-transparent to-transparent'
    },
    [CardTypeEnum.ECLIPSE]: {
      gradient: 'from-eclipse-primary to-eclipse-secondary',
      border: 'border-eclipse-primary/50',
      glow: isEnhanced ? 'card-glow-eclipse' : '',
      icon: '🌓',
      bgPattern: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-eclipse-primary/10 via-transparent to-transparent'
    }
  }
  
  const styles = cardTypeStyles[card.type]

  return (
    <div
      className={`relative w-[180px] h-[250px] transition-all duration-300 ${
        isPlayable ? 'cursor-pointer' : 'opacity-70 grayscale cursor-not-allowed'
      } ${styles.glow}`}
      onClick={() => isPlayable && onClick()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered && isPlayable ? 'translateY(-20px) scale(1.05)' : 'translateY(0) scale(1)',
        zIndex: isHovered ? 10 : 1
      }}
    >
      <div className={`absolute inset-0 rounded-xl bg-card-bg border ${styles.border} overflow-hidden`}>
        {/* Card Header */}
        <div className={`flex items-center justify-between p-3 border-b ${styles.border}`}>
          <h3 className="text-sm font-bold text-white">{card.name}</h3>
          <div className={`w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-br ${styles.gradient}`}>
            <span className="text-xs">{styles.icon}</span>
          </div>
        </div>
        
        {/* Card Art */}
        <div className={`h-[100px] ${styles.bgPattern} relative overflow-hidden`}>
          {isEnhanced && (
            <div className="absolute inset-0 animate-pulse-slow opacity-50 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
                 style={{animationDuration: '2s'}}></div>
          )}
        </div>
        
        {/* Card Description */}
        <div className="p-3 text-xs text-gray-300 border-t border-b border-gray-800">
          <p>{card.description}</p>
        </div>
        
        {/* Card Stats */}
        <div className="flex items-center justify-around p-3">
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
  )
}

export default Card 