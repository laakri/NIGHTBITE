import { useGame } from '../contexts/GameContext'
import { useTheme } from '../contexts/ThemeContext'
import Card from './Card'
import PlayerInfo from './PlayerInfo'
import PhaseIndicator from './PhaseIndicator'

// Import card images
import cardsunImage from '../assets/cards/card_sun.png'
import cardeclipseImage from '../assets/cards/card_eclipse.png'

const GameBoard = () => {
  const { gameState, playCard, leaveRoom } = useGame()
  const { currentPhase } = useTheme()

  if (!gameState) return null

  const handlePlayCard = (cardId: string) => {
    if (gameState.isYourTurn) {
      playCard(cardId)
    }
  }

  return (
    <div className="flex flex-col w-full h-full p-4">
      {/* Game Header */}
      <div className="flex items-center justify-between mb-4">
        <PhaseIndicator phase={currentPhase} turnCount={gameState.turnCount} />
        
        <button 
          onClick={leaveRoom}
          className="px-4 py-2 text-sm font-bold text-white transition-all bg-red-900 rounded-lg hover:bg-red-800 hover:shadow-[0_0_10px_rgba(220,38,38,0.5)]"
        >
          Forfeit
        </button>
      </div>

      {/* Opponent Area */}
      <div className="flex flex-col items-center mb-4">
        <PlayerInfo
          player={gameState.opponent}
          isOpponent={true}
          isCurrentTurn={!gameState.isYourTurn}
        />
        
        <div className="flex justify-center mt-4 -space-x-10">
          {Array(gameState.opponent.handSize).fill(0).map((_, index) => (
            <div 
              key={index} 
              className="w-[120px] h-[160px] rounded-xl bg-gray-900 border border-gray-800 transform scale-75 rotate-180"
              style={{ transformOrigin: 'center' }}
            >
              <div 
                className="w-full h-full rounded-xl bg-cover bg-center opacity-70"
                style={{ backgroundImage: `url(${cardsunImage})` }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* Board Center */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="flex items-center gap-10">
          {/* Deck */}
          <div className="relative">
            <div className="w-[180px] h-[250px] rounded-xl bg-gray-900 border border-gray-800 transform rotate-3">
              <div 
                className="w-full h-full rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${cardeclipseImage})` }}
              ></div>
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-1 text-xs font-bold text-white bg-black/60 rounded-md">
              {gameState.player.deckSize}
            </div>
          </div>
          
          {/* Discard Pile */}
          <div className="relative">
            <div className="w-[180px] h-[250px] rounded-xl bg-gray-900/30 border border-gray-800/50 flex items-center justify-center">
              <div className="text-2xl text-gray-600">🗑️</div>
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-1 text-xs font-bold text-white bg-black/60 rounded-md">
              {gameState.player.discardPileSize}
            </div>
          </div>
        </div>
        
        {/* Game Over Overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 sundrop-blur-sm z-20">
            <div className="p-10 text-center bg-gray-900/90 border border-gray-800 rounded-2xl shadow-2xl">
              <h2 className="mb-4 text-4xl font-bold neon-eclipse">Game Over!</h2>
              <p className="mb-8 text-2xl text-white">{gameState.winner?.username} wins!</p>
              <button 
                onClick={leaveRoom}
                className="px-6 py-3 font-bold text-white transition-all rounded-lg bg-gradient-to-r from-eclipse-primary to-eclipse-secondary hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:-translate-y-1"
              >
                Return to Lobby
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Player Area */}
      <div className="flex flex-col items-center mt-4">
        <div className="flex justify-center -space-x-10 mb-4">
          {gameState.player.hand.map((card) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handlePlayCard(card.id)}
              isPlayable={gameState.isYourTurn}
              currentPhase={currentPhase}
            />
          ))}
        </div>
        
        <PlayerInfo
          player={gameState.player}
          isOpponent={false}
          isCurrentTurn={gameState.isYourTurn}
        />
      </div>
    </div>
  )
}

export default GameBoard 