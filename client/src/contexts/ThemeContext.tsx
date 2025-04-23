import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { useGame } from './GameContext'
import { Phase } from '../types/gameTypes'

// Enhanced theme types with more styling options
interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  text: string
  background: string
  cardBg: string
  buttonPrimary: string
  buttonSecondary: string
  border: string
}

interface ThemeStyles {
  colors: ThemeColors
  gradients: {
    primary: string
    secondary: string
    cardBg: string
    buttonBg: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    highlight: string
  }
  animations: {
    transition: string
    pulse: string
    glow: string
  }
}

interface ThemeContextType {
  currentPhase: Phase
  setCurrentPhase: (phase: Phase) => void
  isTransitioning: boolean
  phaseChangeCount: number
  getPhaseColor: (phase: Phase) => string
  getPhaseGradient: (phase: Phase) => string
  themeStyles: ThemeStyles
  isDarkMode: boolean
  toggleDarkMode: () => void
  applyTransitionEffect: (element: HTMLElement) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Phase color definitions
const PHASE_COLORS = {
  [Phase.Normal]: 'emerald',
  [Phase.BloodMoon]: 'red',
  [Phase.Void]: 'purple'
} as const

const PHASE_GRADIENTS = {
  [Phase.Normal]: 'from-emerald-900 to-emerald-800',
  [Phase.BloodMoon]: 'from-red-900 via-red-950 to-red-800',
  [Phase.Void]: 'from-purple-900 via-violet-950 to-indigo-900'
} as const

// Phase-specific theme settings
const getThemeForPhase = (phase: Phase, isDark: boolean): ThemeStyles => {
  // Base theme settings
  const baseTheme: ThemeStyles = {
    colors: {
      primary: 'text-slate-900',
      secondary: 'text-slate-700',
      accent: 'text-blue-600',
      text: isDark ? 'text-gray-100' : 'text-gray-900',
      background: isDark ? 'bg-gray-900' : 'bg-gray-100',
      cardBg: isDark ? 'bg-gray-800' : 'bg-white',
      buttonPrimary: 'bg-blue-600',
      buttonSecondary: 'bg-gray-500',
      border: isDark ? 'border-gray-700' : 'border-gray-300'
    },
    gradients: {
      primary: 'bg-gradient-to-br from-slate-700 to-slate-900',
      secondary: 'bg-gradient-to-br from-slate-200 to-slate-400',
      cardBg: 'bg-gradient-to-br from-gray-800 to-gray-900',
      buttonBg: 'bg-gradient-to-br from-blue-600 to-blue-700'
    },
    shadows: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      highlight: 'shadow-md shadow-blue-500/20'
    },
    animations: {
      transition: 'transition-all duration-300 ease-in-out',
      pulse: 'animate-pulse',
      glow: 'animate-glow'
    }
  }

  // Apply phase-specific overrides
  switch (phase) {
    case Phase.Normal:
      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: isDark ? 'text-emerald-400' : 'text-emerald-700',
          accent: isDark ? 'text-emerald-500' : 'text-emerald-600',
          buttonPrimary: isDark ? 'bg-emerald-600' : 'bg-emerald-500'
        },
        gradients: {
          ...baseTheme.gradients,
          primary: 'bg-gradient-to-br from-emerald-800 to-emerald-950',
          buttonBg: 'bg-gradient-to-br from-emerald-500 to-emerald-700'
        },
        shadows: {
          ...baseTheme.shadows,
          highlight: 'shadow-md shadow-emerald-500/20'
        }
      }
    case Phase.BloodMoon:
      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: isDark ? 'text-red-400' : 'text-red-700',
          accent: isDark ? 'text-red-500' : 'text-red-600',
          buttonPrimary: isDark ? 'bg-red-600' : 'bg-red-500'
        },
        gradients: {
          ...baseTheme.gradients,
          primary: 'bg-gradient-to-br from-red-800 to-red-950',
          buttonBg: 'bg-gradient-to-br from-red-500 to-red-700'
        },
        shadows: {
          ...baseTheme.shadows,
          highlight: 'shadow-md shadow-red-500/20'
        }
      }
    case Phase.Void:
      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: isDark ? 'text-purple-400' : 'text-purple-700',
          accent: isDark ? 'text-purple-500' : 'text-purple-600',
          buttonPrimary: isDark ? 'bg-purple-600' : 'bg-purple-500'
        },
        gradients: {
          ...baseTheme.gradients,
          primary: 'bg-gradient-to-br from-purple-800 to-purple-950',
          buttonBg: 'bg-gradient-to-br from-purple-500 to-purple-700'
        },
        shadows: {
          ...baseTheme.shadows,
          highlight: 'shadow-md shadow-purple-500/30'
        }
      }
    default:
      return baseTheme
  }
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state without depending on GameProvider
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.Normal)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [lastPhaseUpdate, setLastPhaseUpdate] = useState<number>(Date.now())
  const [phaseChangeCount, setPhaseChangeCount] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(true) // Default to dark mode for game UI
  const [transitionTimeoutId, setTransitionTimeoutId] = useState<NodeJS.Timeout | null>(null)

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

  // Generate theme styles based on current phase and dark mode
  const themeStyles = useMemo(() => {
    return getThemeForPhase(currentPhase, isDarkMode)
  }, [currentPhase, isDarkMode])

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

  // Cleanup transition timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutId) {
        clearTimeout(transitionTimeoutId)
      }
    }
  }, [transitionTimeoutId])

  const handlePhaseTransition = (newPhase: Phase) => {
    // Cancel any existing transition
    if (transitionTimeoutId) {
      clearTimeout(transitionTimeoutId)
    }
    
    setIsTransitioning(true)
    setPhaseChangeCount(prev => prev + 1)
    
    // Apply global transition class to body
    document.body.classList.add('phase-transition')
    
    // Update phase after transition animation
    const timeoutId = setTimeout(() => {
      setCurrentPhase(newPhase)
      setIsTransitioning(false)
      setLastPhaseUpdate(Date.now())
      document.body.classList.remove('phase-transition')
      console.log(`[THEME] Phase transition complete: ${newPhase}`)
    }, 1500) // Match this with your transition animation duration
    
    setTransitionTimeoutId(timeoutId)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  const getPhaseColor = (phase: Phase): string => {
    return PHASE_COLORS[phase] || 'gray'
  }

  const getPhaseGradient = (phase: Phase): string => {
    return PHASE_GRADIENTS[phase] || 'from-gray-900 to-gray-800'
  }

  // Function to apply transition effects to DOM elements
  const applyTransitionEffect = (element: HTMLElement) => {
    if (!element) return
    
    // Add animation class
    element.classList.add('phase-transition-element')
    
    // Remove after animation completes
    setTimeout(() => {
      element.classList.remove('phase-transition-element')
    }, 1500)
  }

  return (
    <ThemeContext.Provider
      value={{
        currentPhase,
        setCurrentPhase,
        isTransitioning,
        phaseChangeCount,
        getPhaseColor,
        getPhaseGradient,
        themeStyles,
        isDarkMode,
        toggleDarkMode,
        applyTransitionEffect
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