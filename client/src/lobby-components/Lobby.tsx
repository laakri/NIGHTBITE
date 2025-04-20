import { useEffect, useState } from 'react'
import { useGame } from '../contexts/GameContext'

const Lobby = () => {
  const { currentRoom, leaveRoom } = useGame()
  const [animateIn, setAnimateIn] = useState(false)
  
  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setAnimateIn(true), 300)
  }, [])

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className={`w-[450px] transition-all duration-1000 ease-out transform ${
        animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white">
            Waiting for opponent
          </h2>
          <p className="mt-2 text-gray-400">Your game is ready</p>
        </div>
        
        {/* Elegant loading animation */}
        <div className="relative w-32 h-32 mx-auto my-10">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border border-gray-700/30"></div>
          
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-full border border-gray-700/30 border-t-[#E9B145] border-r-[#6E8AE9] animate-spin-slow"></div>
          
          {/* Inner ring */}
          <div className="absolute inset-4 rounded-full border border-gray-700/50"></div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="px-5 py-3 mb-6 bg-[#0A0A10]/80 rounded-md">
            <p className="text-sm text-gray-400">Share this code with your opponent</p>
            <p className="text-lg font-mono font-medium text-[#9C4ED6]">{currentRoom}</p>
          </div>
          
          <button 
            onClick={leaveRoom}
            className="px-5 py-3 text-white transition-all rounded-md bg-[#0A0A10]/80 hover:bg-red-900/60 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:-translate-y-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default Lobby 