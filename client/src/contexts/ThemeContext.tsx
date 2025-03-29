import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useGame } from './GameContext'
import { Phase } from '../types/gameTypes'

type ThemeContextType = {
  currentPhase: Phase
  setCurrentPhase: (phase: Phase) => void
  isTransitioning: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Use a try-catch to handle the case where GameProvider might not be available
  let gameState;
  try {
    const { gameState: gs } = useGame();
    gameState = gs;
  } catch (error) {
    console.warn("GameProvider not available, using default phase");
    gameState = null;
  }
  
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.DAY)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [lastPhaseUpdate, setLastPhaseUpdate] = useState<number>(Date.now())

  // Update phase when game state changes
  useEffect(() => {
    if (!gameState) return
    
    const now = Date.now()
    const timeSinceLastUpdate = now - lastPhaseUpdate
    
    // Only update if it's been at least 3 seconds since the last update
    // This prevents rapid phase transitions
    if (timeSinceLastUpdate < 3000) {
      console.log(`[THEME] Ignoring phase update, too soon (${timeSinceLastUpdate}ms since last update)`)
      return
    }
    
    if (gameState.currentPhase !== currentPhase) {
      console.log(`[THEME] Phase changing from ${currentPhase} to ${gameState.currentPhase}`)
      setIsTransitioning(true)
      
      // Set a timeout to update the phase after the transition animation
      setTimeout(() => {
        setCurrentPhase(gameState.currentPhase)
        setIsTransitioning(false)
        setLastPhaseUpdate(Date.now())
        console.log(`[THEME] Phase transition complete: ${gameState.currentPhase}`)
      }, 1500) // Match this with your transition animation duration
    }
  }, [gameState, currentPhase, lastPhaseUpdate])

  return (
    <ThemeContext.Provider
      value={{
        currentPhase,
        setCurrentPhase,
        isTransitioning
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 