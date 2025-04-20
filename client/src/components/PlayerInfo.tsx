import { PlayerStats } from '../types/gameTypes';

interface PlayerInfoProps {
  username: string;
  stats: PlayerStats;
  isOpponent?: boolean;
  handSize?: number;
  deckSize?: number;
  discardPileSize?: number;
  isYourTurn?: boolean;
  onEndTurn?: () => void;
}

const PlayerInfo = ({
  username,
  stats,
  isOpponent = false,
  handSize,
  deckSize,
  discardPileSize,
  isYourTurn = false,
  onEndTurn
}: PlayerInfoProps) => {
  return (
    <div className={`flex items-center justify-between px-6 py-3 max-w-[60rem] m-auto`}>
      {/* Player avatar and basic info */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white text-xl font-bold shadow-lg border-2 border-gray-700">
            {username.charAt(0).toUpperCase()}
          </div>
          {isYourTurn && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blood-primary animate-pulse" />
          )}
        </div>
        <div className="space-y-2">
          <div className="text-white font-bold text-lg">{username}</div>
          <div className="flex items-center space-x-4">
            {/* Health */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center">
                <span className="text-white font-bold">{stats.health}</span>
              </div>
              <div className="text-white/80 text-sm">
                <div className="font-medium">Health</div>
                <div className="text-xs">{stats.health}/{stats.maxHealth}</div>
              </div>
            </div>
            
            {/* Energy */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold">{stats.energy}</span>
              </div>
              <div className="text-white/80 text-sm">
                <div className="font-medium">Energy</div>
                <div className="text-xs">{stats.energy}/{stats.maxEnergy}</div>
              </div>
            </div>
          </div>
          
          {/* Additional stats */}
          <div className="flex items-center space-x-3">
            {(stats.shields ?? 0) > 0 && (
              <div className="flex items-center space-x-1 bg-gray-800/50 px-2 py-1 rounded">
                <span className="text-blue-400">🛡️</span>
                <span className="text-white text-sm">{stats.shields}</span>
              </div>
            )}
            {(stats.bloodMoonMeter ?? 0) > 0 && (
              <div className="flex items-center space-x-1 bg-red-900/30 px-2 py-1 rounded">
                <span className="text-blood-primary">🌑</span>
                <span className="text-white text-sm">{stats.bloodMoonMeter}%</span>
              </div>
            )}
            {(stats.crystals ?? 0) > 0 && (
              <div className="flex items-center space-x-1 bg-purple-900/30 px-2 py-1 rounded">
                <span className="text-purple-400">💎</span>
                <span className="text-white text-sm">{stats.crystals}</span>
              </div>
            )}
            {stats.inOverdrive && (
              <div className="flex items-center space-x-1 bg-yellow-900/30 px-2 py-1 rounded animate-pulse">
                <span className="text-yellow-400">⚡</span>
                <span className="text-white text-sm">Overdrive</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side content - deck stats or end turn button */}
      {isOpponent ? (
        <div className="flex space-x-6">
          <div className="text-center bg-gray-800/50 px-3 py-2 rounded">
            <div className="text-gray-400 text-xs">Hand</div>
            <div className="text-white font-medium">{handSize || 0}</div>
          </div>
          <div className="text-center bg-gray-800/50 px-3 py-2 rounded">
            <div className="text-gray-400 text-xs">Deck</div>
            <div className="text-white font-medium">{deckSize || 0}</div>
          </div>
          <div className="text-center bg-gray-800/50 px-3 py-2 rounded">
            <div className="text-gray-400 text-xs">Discard</div>
            <div className="text-white font-medium">{discardPileSize || 0}</div>
          </div>
        </div>
      ) : (
        <button
          className={`px-6 py-2 rounded-md transition-all duration-300 ${
            isYourTurn
              ? 'bg-gradient-to-r from-blood-primary to-red-700 hover:from-red-700 hover:to-blood-primary text-white shadow-lg shadow-red-900/50'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          onClick={onEndTurn}
          disabled={!isYourTurn}
        >
          End Turn
        </button>
      )}
    </div>
  );
};

export default PlayerInfo; 