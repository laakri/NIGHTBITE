import { useEffect, useState } from 'react'
import { useGame } from './contexts/GameContext'
import { useTheme } from './contexts/ThemeContext'
import Login from './components/Login'
import Lobby from './components/Lobby'
import GameBoard from './components/GameBoard'
import PhaseTransition from './components/PhaseTransition'
import ErrorMessage from './components/ErrorMessage'

function App() {
  const { gameState, currentRoom, error } = useGame()
  const { currentPhase, setCurrentPhase, isTransitioning } = useTheme()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Simulate loading assets
    setTimeout(() => setLoaded(true), 800)
    
    if (gameState?.currentPhase) {
      setCurrentPhase(gameState.currentPhase)
    }
  }, [gameState?.currentPhase, setCurrentPhase])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030305]">
      {/* Initial loading screen */}
      {!loaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="w-20 h-20 mb-6">
            <div className="w-full h-full rounded-full border-2 border-gray-800 border-t-[#E9B145] border-r-[#6E8AE9] animate-spin"></div>
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-white">
            NIGHTBITE
          </h1>
        </div>
      )}
      
      {/* Dynamic background */}
      <div className="absolute inset-0 z-0">
        {/* Deep space background */}
        <div className="absolute inset-0 bg-[#030305]"></div>
        
        {/* Subtle star field */}
        <div className="absolute w-full h-full">
          {Array(100).fill(0).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 1.5 + 0.5}px`,
                height: `${Math.random() * 1.5 + 0.5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            />
          ))}
        </div>
        
        {/* Phase-specific ambient light */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            currentPhase === 'day' ? 'opacity-30' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle at 70% 30%, rgba(233, 177, 69, 0.08), transparent 70%)'
          }}
        />
        
        <div 
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            currentPhase === 'night' ? 'opacity-30' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle at 30% 70%, rgba(110, 138, 233, 0.08), transparent 70%)'
          }}
        />
        
        {/* Subtle celestial body */}
        <div 
          className={`absolute transition-all duration-1500 ease-in-out ${
            currentPhase === 'day'
              ? 'top-[8%] right-[12%]'
              : 'top-[12%] left-[12%]'
          }`}
        >
          <div className={`relative rounded-full ${
            currentPhase === 'day'
              ? 'w-[120px] h-[120px] bg-gradient-radial from-[#E9B145]/60 to-[#E9B145]/10 shadow-[0_0_60px_rgba(233,177,69,0.2)]'
              : 'w-[100px] h-[100px] bg-gradient-radial from-[#6E8AE9]/50 to-[#6E8AE9]/10 shadow-[0_0_50px_rgba(110,138,233,0.2)]'
          }`}>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full h-full">
        {isTransitioning && <PhaseTransition targetPhase={currentPhase} />}
        
        {error && <ErrorMessage message={error} />}
        
        {!currentRoom && <Login />}
        
        {currentRoom && !gameState && <Lobby />}
        
        {currentRoom && gameState && <GameBoard />}
      </div>
      
      {/* Game logo - always visible */}
      {/* <div className="fixed top-6 left-6 z-50">
        <h1 className="text-2xl font-bold tracking-widest text-white">
          NIGHTBITE
        </h1>
      </div> */}
    </div>
  )
}

export default App
