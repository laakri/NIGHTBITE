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
    <div className="flex items-center justify-between px-6">
      {/* Player avatar and basic info */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white">
          {username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-white font-bold">{username}</div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className="text-red-500 text-sm">♥ {stats.health}/{stats.maxHealth}</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-500 text-sm">⚡ {stats.energy}/{stats.maxEnergy}</span>
            </div>
          </div>
          
          {/* Additional stats for expanded view */}
          <div className="flex items-center space-x-2 mt-1">
            {stats.shields && stats.shields > 0 && (
              <div className="flex items-center">
                <span className="text-gray-300 text-xs">🛡️ {stats.shields}</span>
              </div>
            )}
            {stats.bloodMoonMeter && stats.bloodMoonMeter > 0 && (
              <div className="flex items-center">
                <span className="text-blood-primary text-xs">🌑 {stats.bloodMoonMeter}</span>
              </div>
            )}
            {stats.crystals && stats.crystals > 0 && (
              <div className="flex items-center">
                <span className="text-void-primary text-xs">💎 {stats.crystals}</span>
              </div>
            )}
            {stats.inOverdrive && (
              <div className="flex items-center">
                <span className="text-yellow-500 text-xs">⚡ Overdrive</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side content - deck stats or end turn button */}
      {isOpponent ? (
        <div className="flex space-x-6">
          <div className="text-center">
            <div className="text-gray-400 text-xs">Hand</div>
            <div className="text-white">{handSize || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs">Deck</div>
            <div className="text-white">{deckSize || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs">Discard</div>
            <div className="text-white">{discardPileSize || 0}</div>
          </div>
        </div>
      ) : (
        <button
          className={`px-4 py-2 rounded-md transition ${
            isYourTurn
              ? 'bg-blood-primary hover:bg-blood-primary/80 text-white'
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