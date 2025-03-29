import { useEffect, useState } from 'react'
import { Phase } from '../types/gameTypes'

interface PhaseTransitionProps {
  targetPhase: Phase
}

const PhaseTransition = ({ targetPhase }: PhaseTransitionProps) => {
  const [animationStage, setAnimationStage] = useState<'start' | 'mid' | 'end'>('start')
  
  useEffect(() => {
    // Start animation sequence
    const midTimer = setTimeout(() => {
      setAnimationStage('mid')
    }, 500)
    
    const endTimer = setTimeout(() => {
      setAnimationStage('end')
    }, 1000)
    
    return () => {
      clearTimeout(midTimer)
      clearTimeout(endTimer)
    }
  }, [])

  const isDay = targetPhase === Phase.DAY
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Background flash */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          animationStage === 'start' ? 'opacity-0' : 
          animationStage === 'mid' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: isDay 
            ? 'radial-gradient(circle at center, rgba(233, 177, 69, 0.8), rgba(0, 0, 0, 0.8))' 
            : 'radial-gradient(circle at center, rgba(110, 138, 233, 0.8), rgba(0, 0, 0, 0.8))'
        }}
      />
      
      {/* Phase icon */}
      <div 
        className={`relative transition-all duration-500 ${
          animationStage === 'start' ? 'scale-0 opacity-0' : 
          animationStage === 'mid' ? 'scale-1.5 opacity-100' : 'scale-3 opacity-0'
        }`}
      >
        <div className={`w-32 h-32 rounded-full ${
          isDay 
            ? 'bg-gradient-radial from-[#E9B145] to-[#E9B145]/50 shadow-[0_0_60px_rgba(233,177,69,0.5)]' 
            : 'bg-gradient-radial from-[#6E8AE9] to-[#6E8AE9]/50 shadow-[0_0_60px_rgba(110,138,233,0.5)]'
        }`}>
          <div className="flex items-center justify-center w-full h-full text-6xl">
            {isDay ? '☀️' : '🌙'}
          </div>
        </div>
      </div>
      
      {/* Phase text */}
      <div 
        className={`absolute bottom-1/4 left-0 right-0 text-center transition-all duration-500 ${
          animationStage === 'start' ? 'opacity-0 translate-y-10' : 
          animationStage === 'mid' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-0'
        }`}
      >
        <h2 className={`text-4xl font-bold ${isDay ? 'text-[#E9B145]' : 'text-[#6E8AE9]'}`}>
          {isDay ? 'DAY PHASE' : 'NIGHT PHASE'}
        </h2>
      </div>
    </div>
  )
}

export default PhaseTransition 