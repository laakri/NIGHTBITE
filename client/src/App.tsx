import { useEffect, useState, useRef } from 'react'
import { useGame } from './contexts/GameContext'
import { useTheme } from './contexts/ThemeContext'
import { Phase } from './types/gameTypes'
import Login from './lobby-components/Login'
import Lobby from './lobby-components/Lobby'
import GameBoard from './components/GameBoard'
import ErrorMessage from './global-components/ErrorMessage'
import './styles/CardEffects.css'

function App() {
  const { gameState, currentRoom, error, heroPower } = useGame()
  const { currentPhase, setCurrentPhase, isTransitioning } = useTheme()
  const [loaded, setLoaded] = useState(false)
  const starsRef = useRef<HTMLDivElement>(null)
  const nebulasRef = useRef<HTMLDivElement>(null)
  
  // Generate stars on component mount
  useEffect(() => {
    if (starsRef.current) {
      const starContainer = starsRef.current
      starContainer.innerHTML = ''
      
      // Generate different sizes of stars
      const starSizes = [
        { count: 150, size: [0.5, 1.5], opacity: [0.3, 0.7], animationDelay: [0, 10] },
        { count: 80, size: [1.5, 2.5], opacity: [0.5, 0.9], animationDelay: [3, 15] },
        { count: 30, size: [2.5, 3.5], opacity: [0.6, 1], animationDelay: [5, 20] }
      ]
      
      starSizes.forEach(({ count, size, opacity, animationDelay }) => {
        for (let i = 0; i < count; i++) {
          const star = document.createElement('div')
          const starSize = Math.random() * (size[1] - size[0]) + size[0]
          const starOpacity = Math.random() * (opacity[1] - opacity[0]) + opacity[0]
          const blinkDelay = Math.random() * (animationDelay[1] - animationDelay[0]) + animationDelay[0]
          
          star.className = 'absolute rounded-full bg-white'
          star.style.width = `${starSize}px`
          star.style.height = `${starSize}px`
          star.style.top = `${Math.random() * 100}%`
          star.style.left = `${Math.random() * 100}%`
          star.style.opacity = `${starOpacity}`
          star.style.animation = `twinkle ${Math.random() * 3 + 2}s ease-in-out ${blinkDelay}s infinite alternate`
          
          starContainer.appendChild(star)
        }
      })
    }
    
    // Generate nebula effects
    if (nebulasRef.current) {
      const nebulaContainer = nebulasRef.current
      nebulaContainer.innerHTML = ''
      
      // Create different nebulas based on size and position
      const nebulasConfig = [
        { x: '20%', y: '30%', size: '50%', color1: 'rgba(139, 0, 139, 0.07)', color2: 'rgba(0, 139, 139, 0.05)' },
        { x: '70%', y: '70%', size: '60%', color1: 'rgba(139, 0, 0, 0.06)', color2: 'rgba(0, 0, 139, 0.04)' },
        { x: '85%', y: '20%', size: '40%', color1: 'rgba(0, 139, 0, 0.05)', color2: 'rgba(139, 139, 0, 0.03)' }
      ]
      
      nebulasConfig.forEach(({ x, y, size, color1, color2 }) => {
        const nebula = document.createElement('div')
        nebula.className = 'absolute rounded-full blur-3xl'
        nebula.style.left = x
        nebula.style.top = y
        nebula.style.width = size
        nebula.style.height = size
        nebula.style.background = `radial-gradient(circle, ${color1}, ${color2}, transparent 70%)`
        nebula.style.opacity = '0.8'
        nebula.style.transform = 'translate(-50%, -50%)'
        nebula.style.animation = `float ${Math.random() * 20 + 30}s ease-in-out infinite alternate`
        
        nebulaContainer.appendChild(nebula)
      })
    }
    
    // Create style for star animations if not already present
    if (!document.getElementById('star-animations')) {
      const style = document.createElement('style')
      style.id = 'star-animations'
      style.innerHTML = `
        @keyframes twinkle {
          0% { opacity: 0.1; }
          100% { opacity: 1; }
        }
        @keyframes float {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-45%, -55%) scale(1.1); }
          100% { transform: translate(-55%, -45%) scale(0.9); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(0) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(0) rotate(-360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 0.4; transform: scale(1); }
        }
      `
      document.head.appendChild(style)
    }
    
    // Simulate loading assets
    setTimeout(() => setLoaded(true), 800)
    
    if (gameState?.currentPhase) {
      setCurrentPhase(gameState.currentPhase)
    } else {
      // Set default phase to Normal when not in a game
      setCurrentPhase(Phase.BloodMoon)
    }
  }, [gameState, setCurrentPhase, heroPower])

  // Get phase-specific styles
  const getPhaseSpecificStyles = () => {
    switch (currentPhase) {
      case Phase.BloodMoon:
        return {
          celestialPosition: 'top-[8%] right-[12%]',
          celestialSize: 'w-[120px] h-[120px]',
          celestialStyle: 'bg-gradient-radial from-blood-primary/60 to-blood-primary/10 shadow-[0_0_60px_rgba(139,0,0,0.3)]',
          backgroundGradient: 'bg-gradient-to-b from-blood-primary/20 via-dark-bg/90 to-dark-bg',
          ambientLight: 'radial-gradient(circle at 70% 30%, rgba(139, 0, 0, 0.12), transparent 70%)'
        }
      case Phase.Void:
        return {
          celestialPosition: 'top-[12%] left-[12%]',
          celestialSize: 'w-[100px] h-[100px]',
          celestialStyle: 'bg-gradient-radial from-void-primary/50 to-void-primary/10 shadow-[0_0_50px_rgba(0,0,139,0.3)]',
          backgroundGradient: 'bg-gradient-to-b from-void-primary/20 via-dark-bg/90 to-dark-bg',
          ambientLight: 'radial-gradient(circle at 30% 70%, rgba(0, 0, 139, 0.12), transparent 70%)'
        }
      default:
        return {
          celestialPosition: 'top-[10%] left-[10%]',
          celestialSize: 'w-[110px] h-[110px]',
          celestialStyle: 'bg-gradient-radial from-green-600/50 to-green-600/10 shadow-[0_0_55px_rgba(0,139,0,0.2)]',
          backgroundGradient: 'bg-gradient-to-b from-green-900/20 via-dark-bg/90 to-dark-bg',
          ambientLight: 'radial-gradient(circle at 50% 50%, rgba(0, 139, 0, 0.08), transparent 70%)'
        }
    }
  }
  
  const phaseStyles = getPhaseSpecificStyles()

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
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Deep space background */}
        <div className="absolute inset-0 bg-dark-bg"></div>
        
        {/* Nebula effects - blurred colored clouds */}
        <div 
          ref={nebulasRef}
          className="absolute w-full h-full"
        />
        
        {/* Dynamic star field */}
        <div 
          ref={starsRef}
          className="absolute w-full h-full"
        />
        
        {/* Phase-specific ambient light with subtle animation */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            background: phaseStyles.ambientLight,
            animation: 'pulse 15s infinite ease-in-out'
          }}
        />
        
        {/* Subtle celestial body with glow effect */}
        <div 
          className={`absolute transition-all duration-1500 ease-in-out ${phaseStyles.celestialPosition}`}
        >
          <div className={`relative rounded-full ${phaseStyles.celestialSize} ${phaseStyles.celestialStyle}`}>
            {/* Celestial body surface details */}
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-40">
              {Array(8).fill(0).map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full bg-white/5"
                  style={{
                    width: `${Math.random() * 40 + 10}%`,
                    height: `${Math.random() * 40 + 10}%`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>
            
            {/* Orbital particles */}
            {currentPhase === Phase.BloodMoon && (
              <div className="absolute inset-0">
                {Array(5).fill(0).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500/70 rounded-full"
                    style={{
                      transformOrigin: 'center',
                      animation: `orbit ${10 + i * 5}s linear infinite`
                    }}
                  />
                ))}
              </div>
            )}
            
            {currentPhase === Phase.Void && (
              <div className="absolute inset-0">
                {Array(3).fill(0).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-500/70 rounded-full blur-sm"
                    style={{
                      transformOrigin: 'center', 
                      animation: `orbit ${8 + i * 4}s linear infinite reverse`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Glow effect */}
          <div 
            className={`absolute inset-0 rounded-full ${phaseStyles.celestialStyle} blur-xl opacity-40`}
            style={{ animation: 'pulse 4s infinite ease-in-out' }}
          />
        </div>
        
        {/* Secondary celestial body (smaller) */}
        {currentPhase === Phase.Void && (
          <div className="absolute bottom-[15%] right-[18%] transition-all duration-1500 ease-in-out">
            <div className="relative w-[50px] h-[50px] rounded-full bg-gradient-radial from-violet-500/30 to-violet-900/10 shadow-[0_0_25px_rgba(139,0,139,0.2)]">
              <div className="absolute inset-0 rounded-full overflow-hidden opacity-50">
                {Array(3).fill(0).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute rounded-full bg-white/10"
                    style={{
                      width: `${Math.random() * 20 + 5}%`,
                      height: `${Math.random() * 20 + 5}%`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      {loaded && (
        <div className={`relative w-full h-full transition-colors duration-1000 ${phaseStyles.backgroundGradient}`}>
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
      {/* Uncomment if needed
      <div className="fixed top-6 left-6 z-50">
        <h1 className="text-2xl font-bold tracking-widest text-white">
          NIGHTBITE
        </h1>
      </div>
      */}
    </div>
  )
}

export default App