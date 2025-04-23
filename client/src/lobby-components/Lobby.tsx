import { useEffect, useState, useRef } from 'react'
import { useGame } from '../contexts/GameContext'
import { useTheme } from '../contexts/ThemeContext'
import { Phase } from '../types/gameTypes'

const Lobby = () => {
  const { currentRoom, leaveRoom } = useGame()
  const { currentPhase } = useTheme()
  const [animateIn, setAnimateIn] = useState(false)
  const [pulseCode, setPulseCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const loadingRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Trigger animations in sequence
    setTimeout(() => setAnimateIn(true), 300)
    
    // Set a random time for the "waiting" timer (30-60 seconds)
    // This is just for visual effect while waiting
    setTimeLeft(Math.floor(Math.random() * 30) + 30)
    
    // Pulse the code every 5 seconds to draw attention to it
    const pulseCycle = setInterval(() => {
      setPulseCode(true)
      setTimeout(() => setPulseCode(false), 1000)
    }, 5000)
    
    // Set up countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      clearInterval(pulseCycle)
      clearInterval(timer)
    }
  }, [])
  
  const copyRoomCode = () => {
    navigator.clipboard.writeText(currentRoom || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  // Get phase-specific styles
  const getPhaseAccentColor = () => {
    switch (currentPhase) {
      case Phase.BloodMoon: return 'from-red-600 to-red-900'
      case Phase.Void: return 'from-purple-600 to-purple-900'
      case Phase.Normal: default: return 'from-emerald-600 to-emerald-900'
    }
  }
  
  const getPhaseAccentSolid = () => {
    switch (currentPhase) {
      case Phase.BloodMoon: return 'red-600'
      case Phase.Void: return 'purple-600'
      case Phase.Normal: default: return 'emerald-600'
    }
  }
  
  const getPhaseSecondaryAccent = () => {
    switch (currentPhase) {
      case Phase.BloodMoon: return 'from-orange-600 to-red-700'
      case Phase.Void: return 'from-blue-600 to-purple-800'
      case Phase.Normal: default: return 'from-cyan-600 to-emerald-800'
    }
  }
  
  const getCardGlow = () => {
    switch (currentPhase) {
      case Phase.BloodMoon: return 'shadow-lg shadow-red-900/30'
      case Phase.Void: return 'shadow-lg shadow-purple-900/30'
      case Phase.Normal: default: return 'shadow-lg shadow-emerald-900/30'
    }
  }
  
  const getCancelButtonStyle = () => {
    switch (currentPhase) {
      case Phase.BloodMoon: return 'hover:bg-red-900/60 hover:shadow-red-700/30'
      case Phase.Void: return 'hover:bg-purple-900/60 hover:shadow-purple-700/30'
      case Phase.Normal: default: return 'hover:bg-emerald-900/60 hover:shadow-emerald-700/30'
    }
  }
  
  // Get phase-specific animated orbits
  const renderOrbits = () => {
    switch (currentPhase) {
      case Phase.BloodMoon:
        return (
          <div className="absolute inset-0">
            <div className="absolute w-3 h-3 rounded-full bg-red-500/70 left-[20%] top-[50%]"
                style={{ animation: 'orbit 15s linear infinite' }} />
            <div className="absolute w-2 h-2 rounded-full bg-orange-400/70 left-[40%] top-[50%]"
                style={{ animation: 'orbit 10s linear infinite reverse' }} />
            <div className="absolute w-1 h-1 rounded-full bg-yellow-400/70 left-[70%] top-[50%]"
                style={{ animation: 'orbit 8s linear infinite' }} />
          </div>
        )
      case Phase.Void:
        return (
          <div className="absolute inset-0">
            <div className="absolute w-3 h-3 rounded-full bg-purple-500/70 blur-sm left-[30%] top-[50%]"
                style={{ animation: 'orbit 12s linear infinite reverse' }} />
            <div className="absolute w-2 h-2 rounded-full bg-blue-400/70 blur-sm left-[50%] top-[50%]"
                style={{ animation: 'orbit 18s linear infinite' }} />
            <div className="absolute w-4 h-4 rounded-full bg-indigo-400/40 blur-md left-[65%] top-[50%]"
                style={{ animation: 'orbit 20s linear infinite reverse' }} />
          </div>
        )
      case Phase.Normal:
      default:
        return (
          <div className="absolute inset-0">
            <div className="absolute w-2 h-2 rounded-full bg-emerald-500/70 left-[25%] top-[50%]"
                style={{ animation: 'orbit 14s linear infinite' }} />
            <div className="absolute w-3 h-3 rounded-full bg-teal-400/70 left-[45%] top-[50%]"
                style={{ animation: 'orbit 16s linear infinite reverse' }} />
            <div className="absolute w-1 h-1 rounded-full bg-green-400/70 left-[75%] top-[50%]"
                style={{ animation: 'orbit 11s linear infinite' }} />
          </div>
        )
    }
  }
  
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div 
        className={`w-[450px] transition-all duration-1000 ease-out transform bg-gray-900/70 backdrop-blur-sm rounded-xl p-8 ${getCardGlow()} 
          ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r animate-text-shimmer
            animate-text-glow">
            <span className={`bg-gradient-to-r ${getPhaseAccentColor()} bg-clip-text text-transparent`}>
              Waiting for opponent
            </span>
          </h2>
          <p className="mt-2 text-gray-400">
            Your game is ready • Estimated wait: {timeLeft}s
          </p>
        </div>
        
        {/* Elegant loading animation */}
        <div className="relative w-40 h-40 mx-auto my-10">
          {/* Large outer ring with gradient */}
          <div 
            ref={loadingRef}
            className={`absolute inset-0 rounded-full border-2 border-gray-700/20`}
          />
          
          {/* First spinning ring */}
          <div 
            className={`absolute inset-0 rounded-full border-2 border-gray-700/5 border-t-2 border-t-${getPhaseAccentSolid()}
              animate-spin-slow`}
          />
          
          {/* Second spinning ring (reverse) */}
          <div 
            className={`absolute inset-4 rounded-full border-2 border-gray-700/10 border-b-2 border-r-2 
              border-r-${getPhaseAccentSolid()} border-b-${getPhaseAccentSolid()}
              animate-spin-reverse-slow`}
          />
          
          {/* Inner central circle */}
          <div className={`absolute inset-0 m-auto w-20 h-20 rounded-full 
            bg-gradient-to-br ${getPhaseAccentColor()} shadow-lg animate-pulse`}
          >
            <div className="absolute inset-2 rounded-full bg-gray-900/40 backdrop-blur-sm" />
          </div>
          
          {/* Inner glow */}
          <div className={`absolute inset-0 m-auto w-20 h-20 rounded-full 
            bg-gradient-to-br ${getPhaseAccentColor()} blur-xl opacity-50 animate-pulse`}
          />
          
          {/* Animated orbiting elements */}
          {renderOrbits()}
        </div>
        
        <div className="flex flex-col items-center">
          {/* Room code with copy functionality */}
          <div 
            className={`relative px-5 py-3 mb-6 bg-gray-800/80 backdrop-blur-sm rounded-md cursor-pointer
              hover:bg-gray-800/90 transition-all duration-300 
              ${pulseCode ? 'scale-105 shadow-lg' : ''}`}
            onClick={copyRoomCode}
          >
            <p className="text-sm text-gray-400">Share this code with your opponent</p>
            <div className="flex items-center justify-center mt-1">
              <p className={`text-lg font-mono font-medium bg-gradient-to-r ${getPhaseAccentColor()} 
                bg-clip-text text-transparent`}>
                {currentRoom}
              </p>
              <span className="ml-2 text-xs text-gray-500">{copied ? 'Copied!' : 'Click to copy'}</span>
            </div>
            
            {/* Animated corner decoration */}
            <div className="absolute -top-1 -right-1 w-8 h-8">
              <div className={`absolute top-0 right-0 w-6 h-6 rounded-tr-md
                border-t-2 border-r-2 border-${getPhaseAccentSolid()} opacity-60`} />
            </div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8">
              <div className={`absolute bottom-0 left-0 w-6 h-6 rounded-bl-md
                border-b-2 border-l-2 border-${getPhaseAccentSolid()} opacity-60`} />
            </div>
          </div>
          
          {/* Cancel button with phase-specific hover effects */}
          <button 
            onClick={leaveRoom}
            className={`px-6 py-3 text-white transition-all rounded-md bg-gray-800/80 
              ${getCancelButtonStyle()}
              hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm`}
          >
            Cancel
          </button>
        </div>
        
        {/* Optional particle effects on the edges */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          {currentPhase === Phase.BloodMoon && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 opacity-30">
              <div className="w-40 h-40 rounded-full bg-red-900/20 blur-3xl animate-pulse" />
            </div>
          )}
          
          {currentPhase === Phase.Void && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 opacity-30">
              <div className="w-40 h-40 rounded-full bg-purple-900/20 blur-3xl animate-pulse" />
            </div>
          )}
          
          {currentPhase === Phase.Normal && (
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-30">
              <div className="w-40 h-40 rounded-full bg-emerald-900/20 blur-3xl animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Lobby 