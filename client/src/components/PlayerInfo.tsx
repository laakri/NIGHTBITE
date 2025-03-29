import { Player, Opponent } from '../types/gameTypes'

interface PlayerInfoProps {
  player: Player | Opponent
  isOpponent: boolean
  isCurrentTurn: boolean
}

const PlayerInfo = ({ player, isOpponent, isCurrentTurn }: PlayerInfoProps) => {
  const healthPercentage = (player.hp / 20) * 100
  
  return (
    <div className={`flex items-center p-3 rounded-xl bg-black/40 backdrop-blur-sm border ${
      isCurrentTurn 
        ? isOpponent 
          ? 'border-moon-primary shadow-[0_0_15px_rgba(129,140,248,0.3)]' 
          : 'border-sun-primary shadow-[0_0_15px_rgba(245,158,11,0.3)]'
        : 'border-gray-800'
    }`}>
      {/* Avatar */}
      <div className="relative mr-4">
        <div className={`w-12 h-12 rounded-full ${
          isOpponent 
            ? 'bg-gradient-to-br from-moon-primary to-moon-secondary' 
            : 'bg-gradient-to-br from-sun-primary to-sun-secondary'
        }`}>
          <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
            {player.username.charAt(0).toUpperCase()}
          </div>
        </div>
        
        {isCurrentTurn && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-black animate-pulse"></div>
        )}
      </div>
      
      {/* Player Details */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-bold text-white">{player.username}</div>
          <div className="text-sm font-mono text-gray-400">{player.hp}/20 HP</div>
        </div>
        
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              healthPercentage < 30 
                ? 'bg-red-600' 
                : healthPercentage < 60 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default PlayerInfo 