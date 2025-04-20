import { useEffect, useState } from 'react'
import { useGame } from './contexts/GameContext'
import { useTheme } from './contexts/ThemeContext'
import { Phase } from './types/gameTypes'
import Login from './lobby-components/Login'
import Lobby from './lobby-components/Lobby'
import GameBoard from './components/GameBoard'
import ErrorMessage from './global-components/ErrorMessage'

function App() {
  const { gameState, currentRoom, error,  heroPower } = useGame()
  const { currentPhase, setCurrentPhase } = useTheme()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Simulate loading assets
    setTimeout(() => setLoaded(true), 800)
    
    if (gameState?.currentPhase) {
      setCurrentPhase(gameState.currentPhase)
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
      
      {/* Dynamic background */}
      <div className="absolute inset-0 z-0">
        {/* Deep space background */}
        <div className="absolute inset-0 bg-dark-bg"></div>
        
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
        
        {/* Blood/Void ambient light */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            currentPhase === Phase.PHASE_ONE ? 'opacity-30' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle at 70% 30%, rgba(139, 0, 0, 0.08), transparent 70%)'
          }}
        />
        
        <div 
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            currentPhase === Phase.PHASE_TWO ? 'opacity-30' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle at 30% 70%, rgba(0, 0, 139, 0.08), transparent 70%)'
          }}
        />
        
        {/* Subtle celestial body */}
        <div 
          className={`absolute transition-all duration-1500 ease-in-out ${
            currentPhase === Phase.PHASE_ONE
              ? 'top-[8%] right-[12%]'
              : 'top-[12%] left-[12%]'
          }`}
        >
          <div className={`relative rounded-full ${
            currentPhase === Phase.PHASE_ONE
              ? 'w-[120px] h-[120px] bg-gradient-radial from-blood-primary/60 to-blood-primary/10 shadow-[0_0_60px_rgba(139,0,0,0.2)]'
              : 'w-[100px] h-[100px] bg-gradient-radial from-void-primary/50 to-void-primary/10 shadow-[0_0_50px_rgba(0,0,139,0.2)]'
          }`}>
          </div>
        </div>
      </div>

      {/* Main content */}
      {loaded && (
        <div className={`relative w-full h-full transition-colors duration-1000 ${
          currentPhase === Phase.PHASE_ONE ? 'bg-gradient-to-b from-blood-primary/20 to-dark-bg' :
          currentPhase === Phase.PHASE_TWO ? 'bg-gradient-to-b from-void-primary/20 to-dark-bg' :
          'bg-gradient-to-b from-eclipse-primary/20 to-dark-bg'
        }`}>
          {/* Error message */}
          {error && <ErrorMessage message={error} />}



          {/* Game content */}
          {!currentRoom ? (
            <Login />
          ) : !gameState ? (
            <Lobby />
          ) : (
            <GameBoard />
          )}
        </div>
      )}
      
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
