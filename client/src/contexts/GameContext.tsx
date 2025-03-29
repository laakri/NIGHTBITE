import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { GameState, CardType } from '../types/gameTypes'

type GameContextType = {
  socket: Socket | null
  gameState: GameState | null
  joinRoom: (roomId?: string, username?: string) => void
  playCard: (cardId: string) => void
  playSecretCard: (cardId: string) => void
  selectHeroPower: (power: string) => void
  endTurn: () => void
  leaveRoom: () => void
  getRooms: () => void
  availableRooms: any[]
  username: string
  setUsername: (name: string) => void
  currentRoom: string | null
  error: string | null
  heroPower: string
  setHeroPower: (power: string) => void
  isPhaseChanging: boolean
  phaseSurgeActive: boolean
  phaseSurgeType: CardType | null
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [username, setUsername] = useState<string>('')
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [heroPower, setHeroPower] = useState<string>('')
  const [isPhaseChanging, setIsPhaseChanging] = useState(false)
  const [phaseSurgeActive, setPhaseSurgeActive] = useState(false)
  const [phaseSurgeType, setPhaseSurgeType] = useState<CardType | null>(null)

  useEffect(() => {
    const newSocket = io('http://localhost:3000')
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on('gameState', (state: GameState) => {
      console.log('Received game state:', state)
      setGameState(state)
    })

    socket.on('roomList', ({ rooms }: { rooms: any[] }) => {
      setAvailableRooms(rooms)
    })

    socket.on('roomJoined', ({ room }: { room: { id: string } }) => {
      setCurrentRoom(room.id)
    })

    socket.on('roomLeft', () => {
      setCurrentRoom(null)
      setGameState(null)
    })

    socket.on('error', ({ message }: { message: string }) => {
      setError(message)
      setTimeout(() => setError(null), 3000)
    })

    socket.on('gameOver', ({ winner }) => {
      // Handle game over
      console.log(`Game Over! Winner: ${winner.username}`)
    })

    // Handle hero power selection
    socket.on('heroPowerOptions', ({ powers }: { powers: string[] }) => {
      // Show hero power selection UI
      console.log('Available hero powers:', powers)
    })

    // Handle secret card played
    socket.on('secretCardPlayed', ({ playerId, cardCount }) => {
      // Update UI to show a secret card was played
      console.log(`Player ${playerId} played a secret card. Total: ${cardCount}`)
    })

    // Handle phase surge
    socket.on('phaseSurge', ({ type }: { type: CardType }) => {
      // Show phase surge animation
      setPhaseSurgeActive(true)
      setPhaseSurgeType(type)
      
      // Reset after animation
      setTimeout(() => {
        setPhaseSurgeActive(false)
        setPhaseSurgeType(null)
      }, 3000)
    })
    
    // Handle phase change
    socket.on('phaseChanging', () => {
      setIsPhaseChanging(true)
      
      // Reset after animation
      setTimeout(() => {
        setIsPhaseChanging(false)
      }, 2000)
    })

    return () => {
      socket.off('gameState')
      socket.off('roomList')
      socket.off('roomJoined')
      socket.off('roomLeft')
      socket.off('error')
      socket.off('gameOver')
      socket.off('heroPowerOptions')
      socket.off('secretCardPlayed')
      socket.off('phaseSurge')
      socket.off('phaseChanging')
    }
  }, [socket])

  const joinRoom = (roomId?: string, name?: string) => {
    if (!socket) return
    const playerName = name || username
    if (!playerName) {
      setError('Please enter a username')
      return
    }
    socket.emit('joinRoom', { roomId, username: playerName })
  }

  const playCard = (cardId: string) => {
    if (!socket || !currentRoom) return
    socket.emit('playCard', { roomId: currentRoom, cardId })
  }
  
  const playSecretCard = (cardId: string) => {
    if (!socket || !currentRoom) return
    socket.emit('playSecretCard', { roomId: currentRoom, cardId })
  }

  const endTurn = () => {
    if (!socket || !currentRoom) return
    socket.emit('endTurn', { roomId: currentRoom })
  }

  const leaveRoom = () => {
    if (!socket || !currentRoom) return
    socket.emit('leaveRoom', { roomId: currentRoom })
  }

  const getRooms = () => {
    if (!socket) return
    socket.emit('getRooms')
  }

  const selectHeroPower = (power: string) => {
    if (!socket || !currentRoom) return
    socket.emit('selectHeroPower', { roomId: currentRoom, power })
    setHeroPower(power)
  }

  return (
    <GameContext.Provider
      value={{
        socket,
        gameState,
        joinRoom,
        playCard,
        playSecretCard,
        selectHeroPower,
        endTurn,
        leaveRoom,
        getRooms,
        availableRooms,
        username,
        setUsername,
        currentRoom,
        error,
        heroPower,
        setHeroPower,
        isPhaseChanging,
        phaseSurgeActive,
        phaseSurgeType
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
} 