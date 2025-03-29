import { Player, Opponent } from '../types/gameTypes'

interface PlayerInfoProps {
  player: Player | Opponent
  isOpponent: boolean
  isCurrentTurn: boolean
}

const PlayerInfo = ({ player, isOpponent, isCurrentTurn }: PlayerInfoProps) => {
  const healthPercentage = (player.hp / 20) * 100
  
  return (
    <div className={`relative flex items-center p-4 rounded-lg ${
      isCurrentTurn 
        ? isOpponent 
          ? 'bg-gradient-to-r from-moon-primary/20 to-transparent border-l-2 border-moon-primary' 
          : 'bg-gradient-to-r from-sun-primary/20 to-transparent border-l-2 border-sun-primary'
        : 'bg-black/40 border-l-2 border-gray-700'
    } transition-all duration-300 backdrop-blur-sm w-full`}>
      {/* Avatar */}
      <div className="relative mr-4">
        <div className={`w-12 h-12 rounded-full ${
          isOpponent 
            ? 'bg-gradient-to-br from-moon-primary to-moon-secondary' 
            : 'bg-gradient-to-br from-sun-primary to-sun-secondary'
        } shadow-lg flex items-center justify-center`}>
          <span className="text-xl font-bold text-white">{player.username.charAt(0).toUpperCase()}</span>
        </div>
        
        {isCurrentTurn && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border border-black animate-pulse"></div>
        )}
      </div>
      
      {/* Player Details */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="text-base font-bold text-white">{player.username}</div>
          <div className="flex items-center space-x-3">
            {/* Status indicators */}
            <div className="flex space-x-2">
              {player.shields > 0 && (
                <div className="flex items-center px-2 py-1 bg-blue-900/60 rounded-md text-sm font-medium text-blue-300">
                  <span className="mr-1">🛡️</span>{player.shields}
                </div>
              )}
              
              {player.burnDamage > 0 && (
                <div className="flex items-center px-2 py-1 bg-red-900/60 rounded-md text-sm font-medium text-red-300">
                  <span className="mr-1">🔥</span>{player.burnDamage}
                </div>
              )}
              
              {player.inOverdrive && (
                <div className="flex items-center px-2 py-1 bg-purple-900/60 rounded-md text-sm font-medium text-purple-300 animate-pulse">
                  <span className="mr-1">⚡</span>OD
                </div>
              )}
            </div>
            
            <div className="text-base font-bold text-white">{player.hp}<span className="text-sm text-gray-400">/20</span></div>
          </div>
        </div>
        
        {/* Health bar */}
        <div className="relative h-3 bg-gray-900/60 rounded-full overflow-hidden border border-gray-800">
          <div 
            className={`h-full transition-all duration-500 ${
              healthPercentage < 30 
                ? 'bg-gradient-to-r from-red-700 to-red-500' 
                : healthPercentage < 60 
                  ? 'bg-gradient-to-r from-yellow-700 to-yellow-500' 
                  : 'bg-gradient-to-r from-green-700 to-green-500'
            }`}
            style={{ width: `${healthPercentage}%` }}
          ></div>
          
          {/* Health bar glow effect */}
          <div 
            className={`absolute bottom-0 left-0 h-full opacity-30 ${
              healthPercentage < 30 
                ? 'bg-red-500' 
                : healthPercentage < 60 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            } blur-sm`}
            style={{ width: `${healthPercentage}%` }}
          ></div>
        </div>
        
        {/* Hero power indicator - only show if exists */}
        {player.heroPower && (
          <div className="mt-1 text-sm text-gray-300">
            <span className="text-purple-400 font-bold">Hero Power:</span> {player.heroPower}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerInfo 