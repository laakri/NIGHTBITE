import { useGame } from '../contexts/GameContext'
import { CardType } from '../types/gameTypes'

const MomentumIndicator = () => {
  const { momentum } = useGame()
  
  const momentumTypes = [
    { type: CardType.SUN, icon: '☀️', count: momentum.sun, color: 'from-sun-primary to-sun-secondary', effect: 'Burn damage' },
    { type: CardType.MOON, icon: '🌙', count: momentum.moon, color: 'from-moon-primary to-moon-secondary', effect: 'Double heal + shield' },
    { type: CardType.ECLIPSE, icon: '🌓', count: momentum.eclipse, color: 'from-eclipse-primary to-eclipse-secondary', effect: 'Steal 1 Energy' }
  ]

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      {momentumTypes.map(item => (
        <div key={item.type} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-lg`}>
            {item.icon}
          </div>
          
          <div className="flex items-center">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full mx-0.5 ${
                  i < item.count 
                    ? `bg-gradient-to-br ${item.color}` 
                    : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
          
          {item.count === 3 && (
            <div className="px-2 py-1 text-xs text-white bg-gray-800 rounded-md animate-pulse">
              {item.effect} ready!
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default MomentumIndicator 