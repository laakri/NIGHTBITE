import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { GameState} from '../types/gameTypes'

type GameContextType = {
  socket: Socket | null
  gameState: GameState | null
  joinRoom: (roomId?: string, username?: string) => void
  playCard: (cardId: string) => void
  leaveRoom: () => void
  getRooms: () => void
  availableRooms: any[]
  username: string
  setUsername: (name: string) => void
  currentRoom: string | null
  error: string | null
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [username, setUsername] = useState<string>('')
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

    socket.on('gameOver', ({ winner }: { winner: { username: string } }) => {
      // Handle game over
      console.log(`Game Over! Winner: ${winner.username}`)
    })

    return () => {
      socket.off('gameState')
      socket.off('roomList')
      socket.off('roomJoined')
      socket.off('roomLeft')
      socket.off('error')
      socket.off('gameOver')
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

  const leaveRoom = () => {
    if (!socket || !currentRoom) return
    socket.emit('leaveRoom', { roomId: currentRoom })
  }

  const getRooms = () => {
    if (!socket) return
    socket.emit('getRooms')
  }

  return (
    <GameContext.Provider
      value={{
        socket,
        gameState,
        joinRoom,
        playCard,
        leaveRoom,
        getRooms,
        availableRooms,
        username,
        setUsername,
        currentRoom,
        error
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