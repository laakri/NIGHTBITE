import { Phase } from '../types/gameTypes'

interface PhaseIndicatorProps {
  phase: Phase
  turnCount: number
}

const PhaseIndicator = ({ phase, turnCount }: PhaseIndicatorProps) => {
  const isDay = phase === Phase.DAY
  
  return (
    <div className="flex items-center p-2 pr-4 bg-black/40 backdrop-blur-sm rounded-full border border-gray-800">
      <div className={`relative w-10 h-10 mr-3 rounded-full ${
        isDay 
          ? 'bg-gradient-to-br from-sun-primary to-sun-secondary shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
          : 'bg-gradient-to-br from-moon-primary to-moon-secondary shadow-[0_0_15px_rgba(129,140,248,0.5)]'
      } animate-pulse-slow`}>
        <div className="absolute inset-0 flex items-center justify-center text-lg">
          {isDay ? '☀️' : '🌙'}
        </div>
      </div>
      
      <div>
        <div className="text-sm font-bold text-white">
          {isDay ? 'Day' : 'Night'} Phase
        </div>
        <div className="text-xs text-gray-400">
          Turn {turnCount}
        </div>
      </div>
    </div>
  )
}

export default PhaseIndicator 