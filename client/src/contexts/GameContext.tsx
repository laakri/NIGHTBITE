import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { GameState, CardType, Phase } from '../types/gameTypes'

interface Room {
  id: string
  name: string
  players: number
  maxPlayers: number
  status: 'waiting' | 'playing' | 'finished'
}

interface GameContextType {
  socket: Socket | null
  gameState: GameState | null
  joinRoom: (roomId?: string, username?: string) => void
  playCard: (cardId: string) => void
  playSecretCard: (cardId: string) => void
  selectHeroPower: (power: string) => void
  endTurn: () => void
  leaveRoom: () => void
  getRooms: () => void
  availableRooms: Room[]
  username: string
  setUsername: (name: string) => void
  currentRoom: string | null
  error: string | null
  heroPower: string
  setHeroPower: (power: string) => void
  isPhaseChanging: boolean
  phaseSurgeActive: boolean
  phaseSurgeType: CardType | null
  currentPhase: Phase
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [username, setUsername] = useState<string>('')
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [heroPower, setHeroPower] = useState<string>('')
  const [isPhaseChanging, setIsPhaseChanging] = useState(false)
  const [phaseSurgeActive, setPhaseSurgeActive] = useState(false)
  const [phaseSurgeType, setPhaseSurgeType] = useState<CardType | null>(null)
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.PHASE_ONE)

  useEffect(() => {
    const newSocket = io('http://localhost:3000')
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleGameState = (state: GameState) => {
      console.log('[GAME] State update:', state)
      setGameState(state)
      if (state.currentPhase !== currentPhase) {
        setCurrentPhase(state.currentPhase)
      }
    }

    const handleRoomList = ({ rooms }: { rooms: any[] }) => {
      const convertedRooms = rooms.map(room => ({
        ...room,
        players: Array.isArray(room.players) ? room.players.length : room.players
      }));
      setAvailableRooms(convertedRooms);
    }

    const handleRoomJoined = ({ room }: { room: { id: string } }) => {
      setCurrentRoom(room.id)
      setError(null)
    }

    const handleRoomLeft = () => {
      setCurrentRoom(null)
      setGameState(null)
      setHeroPower('')
    }

    const handleError = ({ message }: { message: string }) => {
      console.error('[GAME] Error:', message)
      setError(message)
      setTimeout(() => setError(null), 3000)
    }

    const handleGameOver = ({ winner }: { winner: { username: string } }) => {
      console.log(`[GAME] Game Over! Winner: ${winner.username}`)
      setError(`Game Over! ${winner.username} wins!`)
    }

    const handleHeroPowerOptions = ({ powers }: { powers: string[] }) => {
      console.log('[GAME] Available hero powers:', powers)
    }

    const handleSecretCardPlayed = ({ playerId, cardCount }: { playerId: string; cardCount: number }) => {
      console.log(`[GAME] Player ${playerId} played a secret card. Total: ${cardCount}`)
    }

    const handlePhaseSurge = ({ type }: { type: CardType }) => {
      console.log(`[GAME] Phase surge: ${type}`)
      setPhaseSurgeActive(true)
      setPhaseSurgeType(type)
      
      setTimeout(() => {
        setPhaseSurgeActive(false)
        setPhaseSurgeType(null)
      }, 3000)
    }
    
    const handlePhaseChanging = () => {
      console.log('[GAME] Phase changing...')
      setIsPhaseChanging(true)
      
      setTimeout(() => {
        setIsPhaseChanging(false)
      }, 2000)
    }

    socket.on('gameState', handleGameState)
    socket.on('roomList', handleRoomList)
    socket.on('roomJoined', handleRoomJoined)
    socket.on('roomLeft', handleRoomLeft)
    socket.on('error', handleError)
    socket.on('gameOver', handleGameOver)
    socket.on('heroPowerOptions', handleHeroPowerOptions)
    socket.on('secretCardPlayed', handleSecretCardPlayed)
    socket.on('phaseSurge', handlePhaseSurge)
    socket.on('phaseChanging', handlePhaseChanging)

    return () => {
      socket.off('gameState', handleGameState)
      socket.off('roomList', handleRoomList)
      socket.off('roomJoined', handleRoomJoined)
      socket.off('roomLeft', handleRoomLeft)
      socket.off('error', handleError)
      socket.off('gameOver', handleGameOver)
      socket.off('heroPowerOptions', handleHeroPowerOptions)
      socket.off('secretCardPlayed', handleSecretCardPlayed)
      socket.off('phaseSurge', handlePhaseSurge)
      socket.off('phaseChanging', handlePhaseChanging)
    }
  }, [socket, currentPhase])

  const joinRoom = (roomId?: string, name?: string) => {
    if (!socket) {
      setError('Socket connection not available')
      return
    }
    const playerName = name || username
    if (!playerName) {
      setError('Please enter a username')
      return
    }
    socket.emit('joinRoom', { roomId, username: playerName })
  }

  const playCard = (cardId: string) => {
    if (!socket || !currentRoom) {
      setError('Not connected to a game room')
      return
    }
    console.log('[GAME] Playing card:', cardId)
    socket.emit('playCard', { roomId: currentRoom, cardId }, (response: { success: boolean; error?: string }) => {
      if (!response.success) {
        setError(response.error || 'Failed to play card')
        console.error('[GAME] Failed to play card:', response.error)
      }
    })
  }
  
  const playSecretCard = (cardId: string) => {
    if (!socket || !currentRoom) {
      setError('Not connected to a game room')
      return
    }
    socket.emit('playSecretCard', { roomId: currentRoom, cardId })
  }

  const endTurn = () => {
    if (!socket || !currentRoom) {
      setError('Not connected to a game room')
      return
    }
    socket.emit('endTurn', { roomId: currentRoom })
  }

  const leaveRoom = () => {
    if (!socket || !currentRoom) {
      setError('Not connected to a game room')
      return
    }
    socket.emit('leaveRoom', { roomId: currentRoom })
  }

  const getRooms = () => {
    if (!socket) {
      setError('Socket connection not available')
      return
    }
    socket.emit('getRooms')
  }

  const selectHeroPower = (power: string) => {
    if (!socket || !currentRoom) {
      setError('Not connected to a game room')
      return
    }
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
        phaseSurgeType,
        currentPhase
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