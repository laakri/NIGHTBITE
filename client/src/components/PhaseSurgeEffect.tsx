import { useEffect, useState } from 'react'
import { CardType } from '../types/gameTypes'

interface PhaseSurgeEffectProps {
  type: CardType
}

const PhaseSurgeEffect = ({ type }: PhaseSurgeEffectProps) => {
  const [animationClass, setAnimationClass] = useState('')
  
  useEffect(() => {
    setAnimationClass('animate-fade-in')
    
    const timer = setTimeout(() => {
      setAnimationClass('animate-fade-out')
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [type])

  // Define colors based on card type
  const colors = {
    [CardType.SUN]: {
      text: 'text-sun-primary',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.7)]',
      bg: 'from-sun-primary to-sun-secondary'
    },
    [CardType.MOON]: {
      text: 'text-moon-primary',
      glow: 'shadow-[0_0_30px_rgba(129,140,248,0.7)]',
      bg: 'from-moon-primary to-moon-secondary'
    },
    [CardType.ECLIPSE]: {
      text: 'text-eclipse-primary',
      glow: 'shadow-[0_0_30px_rgba(156,78,214,0.7)]',
      bg: 'from-eclipse-primary to-eclipse-secondary'
    }
  }
  
  const typeColors = colors[type]
  const typeIcon = type === CardType.SUN ? '☀️' : type === CardType.MOON ? '🌙' : '🌓'
  const typeName = type === CardType.SUN ? 'Sun' : type === CardType.MOON ? 'Moon' : 'Eclipse'

  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center ${animationClass} bg-black/70`}>
      <div className="text-center">
        <div className={`relative w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br ${typeColors.bg} ${typeColors.glow} animate-pulse-slow`}>
          <div className="absolute inset-0 flex items-center justify-center text-5xl">
            {typeIcon}
          </div>
        </div>
        
        <h2 className={`text-3xl font-bold ${typeColors.text}`}>
          {typeName} Surge!
        </h2>
        
        <p className="mt-2 text-white">
          {type === CardType.SUN && '+2 Damage'}
          {type === CardType.MOON && '+2 Shields'}
          {type === CardType.ECLIPSE && 'Draw a card'}
        </p>
      </div>
    </div>
  )
}

export default PhaseSurgeEffect 