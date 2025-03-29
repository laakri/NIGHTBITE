import { useGame } from '../contexts/GameContext'
import cardEclipseImage from '../assets/cards/card_eclipse.png'

const SecretCardDisplay = () => {
  const { gameState } = useGame()
  
  if (!gameState || !gameState.secretCards) return null
  
  const playerSecrets = gameState.secretCards.filter(card => card.playerId === gameState.player.id)
  const opponentSecrets = gameState.secretCards.filter(card => card.playerId === gameState.opponent.id)

  return (
    <div className="flex justify-between w-full px-8 my-2">
      {/* Opponent secrets */}
      <div className="flex -space-x-4">
        {opponentSecrets.map((secret, index) => (
          <div 
            key={index}
            className="w-16 h-24 rounded-md overflow-hidden border border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.3)] transform rotate-180 transition-all hover:translate-y-2"
          >
            <img 
              src={cardEclipseImage} 
              alt="Secret Card" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-2xl">🌑</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Player secrets */}
      <div className="flex -space-x-4">
        {playerSecrets.map((secret, index) => (
          <div 
            key={index}
            className="w-16 h-24 rounded-md overflow-hidden border border-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all hover:-translate-y-2"
          >
            <img 
              src={cardEclipseImage} 
              alt="Secret Card" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-2xl">🌑</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SecretCardDisplay 