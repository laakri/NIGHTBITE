import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { GameState,  CardType } from '../types/gameTypes'

type GameContextType = {
  socket: Socket | null
  gameState: GameState | null
  joinRoom: (roomId?: string, username?: string) => void
  playCard: (cardId: string) => void
  playSecretCard: (cardId: string) => void
  selectHeroPower: (power: string) => void
  leaveRoom: () => void
  getRooms: () => void
  availableRooms: any[]
  username: string
  setUsername: (name: string) => void
  currentRoom: string | null
  error: string | null
  heroPower: string
  setHeroPower: (power: string) => void
  secretCards: any[]
  momentum: {sun: number, moon: number, eclipse: number}
  isPhaseChanging: boolean
  phaseSurgeActive: boolean
  phaseSurgeType: CardType | null
  inOverdrive: boolean
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
  const [secretCards, setSecretCards] = useState<any[]>([])
  const [momentum, setMomentum] = useState<{sun: number, moon: number, eclipse: number}>({
    sun: 0, moon: 0, eclipse: 0
  })
  const [isPhaseChanging, setIsPhaseChanging] = useState(false)
  const [phaseSurgeActive, setPhaseSurgeActive] = useState(false)
  const [phaseSurgeType, setPhaseSurgeType] = useState<CardType | null>(null)
  const [inOverdrive, setInOverdrive] = useState(false)

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
      
      // Check if player is in overdrive
      if (state.player) {
        setInOverdrive(state.player.inOverdrive || false)
      }
      
      // Update secret cards
      if (state.secretCards) {
        setSecretCards(state.secretCards)
      }
      
      // Update momentum
      if (state.playerMomentum && state.player) {
        const playerMomentum = state.playerMomentum[state.player.id] || { sun: 0, moon: 0, eclipse: 0 }
        setMomentum(playerMomentum)
      }
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

    // Handle momentum updates
    socket.on('momentumUpdate', ({ momentum }: { momentum: any }) => {
      setMomentum(momentum)
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
    
    // Handle overdrive activation
    socket.on('overdriveActivated', ({ playerId }) => {
      if (gameState?.player && gameState.player.id === playerId) {
        setInOverdrive(true)
      }
    })

    return () => {
      socket.off('gameState')
      socket.off('roomList')
      socket.off('roomJoined')
      socket.off('roomLeft')
      socket.off('error')
      socket.off('gameOver')
      socket.off('heroPowerOptions')
      socket.off('momentumUpdate')
      socket.off('secretCardPlayed')
      socket.off('phaseSurge')
      socket.off('phaseChanging')
      socket.off('overdriveActivated')
    }
  }, [socket, username, gameState])

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
        leaveRoom,
        getRooms,
        availableRooms,
        username,
        setUsername,
        currentRoom,
        error,
        heroPower,
        setHeroPower,
        secretCards,
        momentum,
        isPhaseChanging,
        phaseSurgeActive,
        phaseSurgeType,
        inOverdrive
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