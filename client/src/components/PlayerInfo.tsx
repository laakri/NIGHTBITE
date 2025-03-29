import { Player, Opponent } from '../types/gameTypes'

interface PlayerInfoProps {
  player: Player | Opponent
  isOpponent: boolean
  isCurrentTurn: boolean
}

const PlayerInfo = ({ player, isOpponent, isCurrentTurn }: PlayerInfoProps) => {
  // Calculate health percentage
  const healthPercentage = Math.max(0, Math.min(100, (player.hp / 20) * 100))
  
  // Determine if player is in overdrive
  const inOverdrive = player.hp <= 5
  
  // Get hero power icon
  const getHeroPowerIcon = (power: string) => {
    switch (power) {
      case 'Dawncaller': return '☀️';
      case 'Midnight Reaper': return '🌙';
      case 'Eclipse Wanderer': return '🌓';
      default: return '⚡';
    }
  }
  
  // Get hero power description
  const getHeroPowerDescription = (power: string) => {
    switch (power) {
      case 'Dawncaller': return 'First Sun card each turn costs 1 less Energy';
      case 'Midnight Reaper': return 'Deal 2 damage when you discard a card';
      case 'Eclipse Wanderer': return 'Draw a card whenever the phase changes';
      default: return '';
    }
  }
  
  return (
    <div className={`flex items-center ${isOpponent ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
      {/* Avatar */}
      <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 ${
        isCurrentTurn 
          ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
          : 'border-gray-700'
      }`}>
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <span className="text-2xl">{isOpponent ? '👤' : '👤'}</span>
        </div>
        
        {/* Overdrive indicator */}
        {inOverdrive && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-600 border border-red-400 flex items-center justify-center animate-pulse">
            <span className="text-xs text-white font-bold">OD</span>
          </div>
        )}
      </div>
      
      {/* Player info */}
      <div className={`flex flex-col ${isOpponent ? 'items-end' : 'items-start'} flex-grow`}>
        {/* Username */}
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white">{player.username}</h3>
          
          {/* Hero power indicator */}
          {player.heroPower && (
            <div className="px-2 py-1 text-xs bg-indigo-900/80 text-indigo-200 rounded-full flex items-center gap-1 group relative">
              <span>{getHeroPowerIcon(player.heroPower)}</span>
              <span>{player.heroPower}</span>
              
              {/* Tooltip */}
              <div className="hidden group-hover:block absolute z-20 top-full mt-1 p-2 bg-black/90 backdrop-blur-sm rounded border border-gray-700 text-xs text-white w-48">
                {getHeroPowerDescription(player.heroPower)}
              </div>
            </div>
          )}
        </div>
        
        {/* Health bar */}
        <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden mt-1 relative">
          <div 
            className={`h-full ${
              inOverdrive 
                ? 'bg-gradient-to-r from-red-600 to-red-800 animate-pulse' 
                : 'bg-gradient-to-r from-green-600 to-green-800'
            }`}
            style={{ width: `${healthPercentage}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{player.hp} / 20 HP</span>
          </div>
        </div>
        
        {/* Status effects and game info */}
        <div className="flex items-center gap-2 mt-1">
          {/* Shield indicator */}
          {player.shields > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-900/70 rounded-md">
              <span className="text-sm">🛡️</span>
              <span className="text-xs font-bold text-blue-200">{player.shields}</span>
            </div>
          )}
          
          {/* Burn damage indicator */}
          {player.burnDamage > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-900/70 rounded-md">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-bold text-red-200">{player.burnDamage}</span>
            </div>
          )}
          
          {/* Energy indicator */}
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-900/70 rounded-md">
            <span className="text-sm">⚡</span>
            <span className="text-xs font-bold text-yellow-200">{player.energy}</span>
          </div>
          
          {/* Deck size indicator */}
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-900/70 rounded-md">
            <span className="text-sm">🃏</span>
            <span className="text-xs font-bold text-blue-200">{player.deckSize}</span>
          </div>
          
          {/* Discard pile indicator */}
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-900/70 rounded-md">
            <span className="text-sm">🗑️</span>
            <span className="text-xs font-bold text-purple-200">{player.discardPileSize}</span>
          </div>
          
          {/* Hand size indicator (only for opponent) */}
          {isOpponent && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-900/70 rounded-md">
              <span className="text-sm">✋</span>
              <span className="text-xs font-bold text-green-200">{(player as Opponent).handSize}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayerInfo 