import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useGame } from './GameContext'
import { Phase } from '../types/gameTypes'

interface ThemeContextType {
  currentPhase: Phase
  setCurrentPhase: (phase: Phase) => void
  isTransitioning: boolean
  phaseChangeCount: number
  getPhaseColor: (phase: Phase) => string
  getPhaseGradient: (phase: Phase) => string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const PHASE_COLORS = {
  [Phase.PHASE_ONE]: 'amber',
  [Phase.PHASE_TWO]: 'blue',
  [Phase.PHASE_THREE]: 'purple'
} as const

const PHASE_GRADIENTS = {
  [Phase.PHASE_ONE]: 'from-amber-900 to-amber-800',
  [Phase.PHASE_TWO]: 'from-blue-900 to-blue-800',
  [Phase.PHASE_THREE]: 'from-purple-900 to-purple-800'
} as const

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state without depending on GameProvider
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.PHASE_ONE)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [lastPhaseUpdate, setLastPhaseUpdate] = useState<number>(Date.now())
  const [phaseChangeCount, setPhaseChangeCount] = useState(0)

  // Try to get game state if available
  let gameState = null
  let gamePhaseChanging = false
  try {
    const game = useGame()
    gameState = game.gameState
    gamePhaseChanging = game.isPhaseChanging
  } catch (error) {
    // GameProvider not available, use local state only
    console.log('[THEME] GameProvider not available, using local state')
  }

  // Update phase when game state changes
  useEffect(() => {
    if (!gameState) return
    
    const now = Date.now()
    const timeSinceLastUpdate = now - lastPhaseUpdate
    
    // Prevent rapid phase transitions
    if (timeSinceLastUpdate < 3000) {
      console.log(`[THEME] Ignoring phase update, too soon (${timeSinceLastUpdate}ms since last update)`)
      return
    }
    
    if (gameState.currentPhase !== currentPhase) {
      console.log(`[THEME] Phase changing from ${currentPhase} to ${gameState.currentPhase}`)
      handlePhaseTransition(gameState.currentPhase)
    }
  }, [gameState, currentPhase, lastPhaseUpdate])
  
  // Handle phase change events from the game
  useEffect(() => {
    if (gamePhaseChanging && !isTransitioning) {
      handlePhaseTransition(gameState?.currentPhase || currentPhase)
    }
  }, [gamePhaseChanging, isTransitioning, gameState?.currentPhase, currentPhase])

  const handlePhaseTransition = (newPhase: Phase) => {
    setIsTransitioning(true)
    setPhaseChangeCount(prev => prev + 1)
    
    // Update phase after transition animation
    setTimeout(() => {
      setCurrentPhase(newPhase)
      setIsTransitioning(false)
      setLastPhaseUpdate(Date.now())
      console.log(`[THEME] Phase transition complete: ${newPhase}`)
    }, 1500) // Match this with your transition animation duration
  }

  const getPhaseColor = (phase: Phase): string => {
    return PHASE_COLORS[phase]
  }

  const getPhaseGradient = (phase: Phase): string => {
    return PHASE_GRADIENTS[phase]
  }

  return (
    <ThemeContext.Provider
      value={{
        currentPhase,
        setCurrentPhase,
        isTransitioning,
        phaseChangeCount,
        getPhaseColor,
        getPhaseGradient
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