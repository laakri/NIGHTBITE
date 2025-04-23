import { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'

const Login = () => {
  const { username, setUsername, joinRoom, getRooms, availableRooms } = useGame()
  const [showRooms, setShowRooms] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [activeTab, setActiveTab] = useState('create')
  const [roomCode, setRoomCode] = useState('')

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setAnimateIn(true), 300)
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

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Elegant intro */}
      <div className={`transition-all duration-1000 ease-out transform ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="relative mb-16">
          {/* Elegant logo */}
          <div className="relative w-48 h-48 mx-auto">
            <div className="absolute w-full h-full">
              {/* Blood moon circle */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-void-primary to-eclipse-secondary shadow-[0_0_20px_rgba(138,43,226,0.3)]"></div>
              {/* Void circle */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-b from-green-800 to-green-700 shadow-[0_0_20px_rgba(139,50,50,0.3)]"></div>
            </div>
            
            {/* Center element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-b from-blood-primary to-blood-secondary shadow-[0_0_20px_rgba(139,0,0,0.3)] "></div>
          </div>
          
          {/* Game title */}
          <h1 className="mt-6 text-4xl font-bold text-center text-white">
            NIGHTBITE
          </h1>
          <p className="mt-2 text-center text-gray-400">The Eternal Battle Between Blood and Void</p>
        </div>
        
        {/* Username input */}
        <div className="mb-8">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-5 py-3 text-white bg-[#0A0A10]/80 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9C4ED6]/50"
            minLength={3}
          />
        </div>
        
        {/* Tabs */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'create'
                ? 'border-blood-primary text-blood-primary'
                : 'border-gray-700 text-gray-400 hover:text-gray-300'
            }`}
          >
            Create Game
          </button>
          <button
            onClick={handleShowRooms}
            disabled={username.trim().length < 3}
            className={`flex-1 py-2 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'join'
                ? 'border-void-primary text-void-primary'
                : 'border-gray-700 text-gray-400 hover:text-gray-300'
            } ${username.trim().length < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Join Game
          </button>
        </div>
        
        {/* Create game panel */}
        <div className={`transition-all duration-300 ${activeTab === 'create' ? 'block' : 'hidden'}`}>
          <button 
            onClick={handleCreateRoom}
            disabled={username.trim().length < 3}
            className="w-full px-5 py-3 text-base font-medium text-white transition-all rounded-md bg-gradient-to-r from-blood-primary to-blood-secondary hover:shadow-[0_0_15px_rgba(139,0,0,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
          >
            Create New Game
          </button>
        </div>
        
        {/* Join game panel */}
        <div className={`transition-all duration-300 ${activeTab === 'join' ? 'block' : 'hidden'}`}>
          {/* Join by code section */}
          <div className="mb-6 p-4 bg-[#0A0A10]/80 rounded-md">
            <p className="mb-2 text-sm text-gray-400">Have a room code?</p>
            <div className="flex">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                className="flex-1 px-4 py-2 mr-2 text-white bg-[#1A1A20]/80 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6E8AE9]/50"
              />
              <button
                onClick={handleJoinByCode}
                disabled={username.trim().length < 3 || !roomCode.trim()}
                className="px-4 py-2 text-white transition-all rounded-md bg-gradient-to-r from-void-primary to-void-secondary hover:shadow-[0_0_15px_rgba(0,0,139,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join
              </button>
            </div>
          </div>
          
          {/* Available rooms list */}
          {availableRooms.length === 0 ? (
            <div className="p-8 text-center bg-[#0A0A10]/80 rounded-md">
              <p className="text-base text-gray-400">No active games found</p>
              <p className="mt-2 text-sm text-gray-500">Create a new game to begin</p>
            </div>
          ) : (
            <div className="overflow-hidden bg-[#0A0A10]/80 rounded-md">
              <div className="max-h-[250px] overflow-y-auto">
                {availableRooms.map((room) => (
                  <div 
                    key={room.id} 
                    onClick={() => handleJoinRoom(room.id)}
                    className="p-4 transition-all cursor-pointer hover:bg-[#1A1A20]/50 border-b border-gray-800/30 last:border-0"
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-base">{room.name || 'Game Room'}</span>
                          <span className="px-2 py-1 text-xs text-gray-300 bg-[#1A1A20]/80 rounded-md">
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