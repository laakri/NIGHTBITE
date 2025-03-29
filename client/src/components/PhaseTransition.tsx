import { useEffect, useState } from 'react'
import { Phase } from '../types/gameTypes'

interface PhaseTransitionProps {
  targetPhase: Phase
}

const PhaseTransition = ({ targetPhase }: PhaseTransitionProps) => {
  const [animationClass, setAnimationClass] = useState('')
  const isDay = targetPhase === Phase.DAY

  useEffect(() => {
    setAnimationClass('animate-fade-in')
    
    const timer = setTimeout(() => {
      setAnimationClass('animate-fade-out')
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [targetPhase])

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${animationClass} ${
      isDay 
        ? 'bg-gradient-radial from-sun-primary/30 via-black/80 to-black' 
        : 'bg-gradient-radial from-moon-primary/20 via-black/80 to-black'
    }`}>
      <div className="text-center">
        <div className={`relative w-40 h-40 mx-auto mb-8 rounded-full ${
          isDay 
            ? 'bg-gradient-to-br from-sun-primary to-sun-secondary shadow-[0_0_50px_rgba(245,158,11,0.7)]' 
            : 'bg-gradient-to-br from-moon-primary to-moon-secondary shadow-[0_0_50px_rgba(129,140,248,0.5)]'
        } animate-float`}>
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {isDay ? '☀️' : '🌙'}
          </div>
        </div>
        
        <h2 className={`text-4xl font-bold ${
          isDay ? 'neon-sun' : 'neon-moon'
        }`}>
          {isDay ? 'Day Breaks' : 'Night Falls'}
        </h2>
      </div>
    </div>
  )
}

export default PhaseTransition 