import { useEffect, useState } from 'react'
import { useGame } from './contexts/GameContext'
import { useTheme } from './contexts/ThemeContext'
import { Phase } from './types/gameTypes'
import Login from './lobby-components/Login'
import Lobby from './lobby-components/Lobby'
import GameBoard from './components/GameBoard'
import ErrorMessage from './global-components/ErrorMessage'
import DynamicBackground from './components/DynamicBackground'
import './styles/CardEffects.css'
import './styles/animations.css'

function App() {
  const { gameState, currentRoom, error, heroPower } = useGame()
  const { currentPhase, setCurrentPhase } = useTheme()
  const [loaded, setLoaded] = useState(false)
  
  // Initialize phase and simulate loading
  useEffect(() => {
    // Simulate loading assets
    setTimeout(() => setLoaded(true), 800)
    
    if (gameState?.currentPhase) {
      setCurrentPhase(gameState.currentPhase)
    } else {
      // Set default phase to Normal when not in a game
      setCurrentPhase(Phase.BloodMoon)
    }
  }, [gameState, setCurrentPhase, heroPower])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dark-bg">
      {/* Initial loading screen */}
      {!loaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="w-20 h-20 mb-6">
            <div className="w-full h-full rounded-full border-2 border-gray-800 border-t-blood-primary border-r-void-primary animate-spin"></div>
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-white">
            NIGHTBITE
          </h1>
        </div>
      )}
      
      {/* Dynamic background using the new component */}
      <DynamicBackground intensity={0.6} interactive={true} />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Show error message if there is one */}
        {error && <ErrorMessage message={error} />}
        
        {!currentRoom && <Login />}
        {currentRoom && !gameState && <Lobby />}
        {currentRoom && gameState && <GameBoard />}
      </div>
    </div>
  );
}

export default App;