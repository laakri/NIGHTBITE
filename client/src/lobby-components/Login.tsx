import { useState, useEffect, useRef } from 'react'
import { useGame } from '../contexts/GameContext'
import { useTheme } from '../contexts/ThemeContext'
import { Phase } from '../types/gameTypes'

const Login = () => {
  const { username, setUsername, joinRoom, getRooms, availableRooms } = useGame()
  const { currentPhase, themeStyles } = useTheme()
  const [showRooms, setShowRooms] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [activeTab, setActiveTab] = useState('create')
  const [roomCode, setRoomCode] = useState('')
  const [logoAnimated, setLogoAnimated] = useState(false)
  
  // Refs for animated elements
  const logoRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Trigger animations in sequence
    setTimeout(() => setAnimateIn(true), 300)
    setTimeout(() => setLogoAnimated(true), 800)
  }, [])

  const handleCreateRoom = () => {
    if (username.trim().length >= 3) {
      joinRoom()
    }
  }

  const handleShowRooms = () => {
    if (username.trim().length >= 3) {
      getRooms()
      setShowRooms(true)
      setActiveTab('join')
    }
  }

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId)
  }

  const handleJoinByCode = () => {
    if (username.trim().length >= 3 && roomCode.trim()) {
      joinRoom(roomCode.trim())
    }
  }
  
  // Get phase-specific styles
  const getPhaseAccentColor = () => {
    switch (currentPhase) {
      case Phase.BloodMoon: return 'from-red-600 to-red-900'
      case Phase.Void: return 'from-purple-600 to-purple-900'
      case Phase.Normal: default: return 'from-emerald-600 to-emerald-900'
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
  
  const getTabActiveStyle = (tab: string) => {
    if (activeTab !== tab) return 'border-gray-700 text-gray-400 hover:text-gray-300'
    
    switch (currentPhase) {
      case Phase.BloodMoon: return 'border-red-600 text-red-500'
      case Phase.Void: return 'border-purple-600 text-purple-500'
      case Phase.Normal: default: return 'border-emerald-600 text-emerald-500'
    }
  }
  
  const getCreateButtonStyle = () => {
    const isDisabled = username.trim().length < 3
    
    if (isDisabled) return 'opacity-50 cursor-not-allowed bg-gray-800'
    
    switch (currentPhase) {
      case Phase.BloodMoon: return 'bg-gradient-to-r from-red-800 to-red-900 hover:shadow-red-900/30'
      case Phase.Void: return 'bg-gradient-to-r from-purple-800 to-purple-900 hover:shadow-purple-900/30'
      case Phase.Normal: default: return 'bg-gradient-to-r from-emerald-800 to-emerald-900 hover:shadow-emerald-900/30'
    }
  }
  
  const getJoinButtonStyle = () => {
    const isDisabled = username.trim().length < 3 || !roomCode.trim()
    
    if (isDisabled) return 'opacity-50 cursor-not-allowed bg-gray-800'
    
    switch (currentPhase) {
      case Phase.BloodMoon: return 'bg-gradient-to-r from-orange-800 to-red-900 hover:shadow-red-900/30'
      case Phase.Void: return 'bg-gradient-to-r from-blue-800 to-purple-900 hover:shadow-purple-900/30'
      case Phase.Normal: default: return 'bg-gradient-to-r from-teal-800 to-emerald-900 hover:shadow-emerald-900/30'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full ">
      {/* Elegant animated intro */}
      <div 
        ref={formRef}
        className={`transition-all duration-1000 ease-out transform backdrop-blur-sm rounded-xl ${getCardGlow()} 
          ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          bg-gray-900/60 p-8 max-w-md w-full`}
      >
        <div className="relative mb-16">
          {/* Animated logo */}
          <div 
            ref={logoRef} 
            className={`relative w-48 h-48 mx-auto transition-all duration-1500 ${logoAnimated ? 'scale-100' : 'scale-90'}`}
          >
            <div className="absolute w-full h-full">
              {/* Orbiting elements */}
              <div className="absolute inset-0">
                <div 
                  className={`absolute w-4 h-4 rounded-full bg-gradient-to-br ${getPhaseAccentColor()} animate-orbit-slow`}
                  style={{left: '50%', top: '10%', transform: 'translateX(-50%)', filter: 'blur(1px)'}}
                />
                <div 
                  className={`absolute w-3 h-3 rounded-full bg-gradient-to-br ${getPhaseSecondaryAccent()} animate-orbit-medium`}
                  style={{left: '75%', top: '50%', transform: 'translateY(-50%)', filter: 'blur(1px)'}}
                />
                <div 
                  className={`absolute w-2 h-2 rounded-full bg-white/80 animate-orbit-fast`}
                  style={{left: '25%', top: '50%', transform: 'translateY(-50%)'}}
                />
              </div>
              
              {/* Main circles */}
              <div 
                className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full 
                  bg-gradient-to-br ${getPhaseAccentColor()} animate-pulse shadow-lg shadow-current`}
              />
              <div 
                className={`absolute bottom-1/4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full 
                  bg-gradient-to-b ${getPhaseSecondaryAccent()} animate-pulse shadow-lg shadow-current delay-300`}
              />
            </div>
            
            {/* Center element with glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div 
                className={`relative w-20 h-20 rounded-full 
                  bg-gradient-to-b ${getPhaseAccentColor()} animate-glow ${logoAnimated ? 'animate-float' : ''}`}
              >
                <div className="absolute inset-2 rounded-full bg-gray-900/40 backdrop-blur-sm"></div>
                <div className="absolute inset-0 rounded-full animate-pulse opacity-80"></div>
              </div>
              <div 
                className={`absolute inset-0 rounded-full blur-xl opacity-60 bg-gradient-to-b ${getPhaseAccentColor()}`}
              />
            </div>
          </div>
          
          {/* Game title with animated glow */}
          <div className={`mt-8 text-center transition-all duration-1000 ${logoAnimated ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="text-4xl font-bold text-white tracking-widest animate-text-glow">
              NIGHTBITE
            </h1>
            <p className="mt-2 text-gray-400">The Eternal Battle Between Blood and Void</p>
          </div>
        </div>
        
        {/* Username input with animated border */}
        <div className="mb-8 relative">
          <div className={`absolute inset-0 rounded-md blur-sm animate-pulse ${username.length >= 3 ? 'opacity-100' : 'opacity-0'} 
            bg-gradient-to-r ${getPhaseAccentColor()} transition-opacity duration-500`}>
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-5 py-3 text-white bg-gray-800/90 rounded-md focus:outline-none 
              focus:ring-2 transition-all duration-300 relative z-10"
            style={{ 
              boxShadow: username.length >= 3 ? `0 0 15px rgba(${currentPhase === Phase.BloodMoon ? '255,0,0' : 
              currentPhase === Phase.Void ? '138,43,226' : '0,255,127'},0.15)` : 'none' 
            }}
            minLength={3}
          />
          {username.length > 0 && username.length < 3 && (
            <p className="absolute text-xs text-red-500 mt-1 left-1">Username must be at least 3 characters</p>
          )}
        </div>
        
        {/* Tabs with dynamic styling */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 text-sm font-medium transition-all border-b-2 ${getTabActiveStyle('create')}`}
          >
            Create Game
          </button>
          <button
            onClick={handleShowRooms}
            disabled={username.trim().length < 3}
            className={`flex-1 py-2 text-sm font-medium transition-all border-b-2 ${getTabActiveStyle('join')} 
              ${username.trim().length < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Join Game
          </button>
        </div>
        
        {/* Create game panel with dynamic styling */}
        <div className={`transition-all duration-500 transform ${activeTab === 'create' ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 translate-y-4 h-0 overflow-hidden'}`}>
          <button 
            onClick={handleCreateRoom}
            disabled={username.trim().length < 3}
            className={`w-full px-5 py-3 text-base font-medium text-white transition-all duration-500 rounded-md 
              ${getCreateButtonStyle()}
              hover:shadow-xl hover:-translate-y-1`}
          >
            Create New Game
          </button>
        </div>
        
        {/* Join game panel with dynamic styling */}
        <div className={`transition-all duration-500 transform ${activeTab === 'join' ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 translate-y-4 h-0 overflow-hidden'}`}>
          {/* Join by code section */}
          <div className="mb-6 p-4 bg-gray-800/80 rounded-md backdrop-blur-sm">
            <p className="mb-2 text-sm text-gray-400">Have a room code?</p>
            <div className="flex">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                className="flex-1 px-4 py-2 mr-2 text-white bg-gray-900/80 rounded-md focus:outline-none 
                  focus:ring-1 transition-all duration-300"
                style={{ 
                  boxShadow: roomCode.trim() ? `0 0 10px rgba(${currentPhase === Phase.BloodMoon ? '255,0,0' : 
                  currentPhase === Phase.Void ? '138,43,226' : '0,255,127'},0.1)` : 'none' 
                }}
              />
              <button
                onClick={handleJoinByCode}
                disabled={username.trim().length < 3 || !roomCode.trim()}
                className={`px-4 py-2 text-white transition-all duration-500 rounded-md 
                  ${getJoinButtonStyle()} 
                  hover:shadow-xl hover:-translate-y-1`}
              >
                Join
              </button>
            </div>
          </div>
          
          {/* Available rooms list with enhanced styling */}
          {availableRooms.length === 0 ? (
            <div className="p-8 text-center bg-gray-800/80 rounded-md backdrop-blur-sm">
              <p className="text-base text-gray-400">No active games found</p>
              <p className="mt-2 text-sm text-gray-500">Create a new game to begin</p>
            </div>
          ) : (
            <div className="overflow-hidden bg-gray-800/80 rounded-md backdrop-blur-sm">
              <div className="max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                {availableRooms.map((room) => (
                  <div 
                    key={room.id} 
                    onClick={() => handleJoinRoom(room.id)}
                    className="p-4 transition-all cursor-pointer hover:bg-gray-700/50 border-b border-gray-800/30 last:border-0
                      hover:translate-x-1"
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-base">{room.name || 'Game Room'}</span>
                          <span className="px-2 py-1 text-xs text-gray-300 bg-gray-900/80 rounded-md">
                            {room.players}/{room.maxPlayers}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login 