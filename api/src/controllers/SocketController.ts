import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/RoomService';

export class SocketController {
  private io: Server;
  private roomService: RoomService;

  constructor(io: Server) {
    this.io = io;
    this.roomService = new RoomService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join a room
      socket.on('joinRoom', ({ roomId, username }) => {
        try {
          let room;
          
          // If roomId is provided, join that room, otherwise create a new room
          if (roomId) {
            room = this.roomService.getRoom(roomId);
            if (!room) {
              throw new Error('Room not found');
            }
            room = this.roomService.addPlayerToRoom(roomId, socket.id, username);
          } else {
            room = this.roomService.createRoom(`${username}'s Room`);
            room = this.roomService.addPlayerToRoom(room.id, socket.id, username);
          }
          
          // Join the socket room
          socket.join(room.id);
          
          // Send room info to the client
          socket.emit('roomJoined', { room });
          
          // Notify other players in the room
          socket.to(room.id).emit('playerJoined', { 
            playerId: socket.id, 
            username 
          });
          
          // If the game has started (room is full), send the game state to ALL players
          if (room.game) {
            // Send game state to all players in the room
            for (const player of room.players) {
              const gameState = this.roomService.getGameState(room.id, player.id);
              this.io.to(player.id).emit('gameState', gameState);
            }
          }
        } catch (error) {
          socket.emit('error', { message: (error as Error).message });
        }
      });

      // Get available rooms
      socket.on('getRooms', () => {
        const rooms = this.roomService.getAllRooms()
          .filter(room => room.status === 'waiting' && room.players.length < room.maxPlayers);
        console.log(`[ROOMS] Sending ${rooms.length} available rooms`);
        socket.emit('roomList', { rooms });
      });

      // Play a card
      socket.on('playCard', ({ roomId, cardId }, callback) => {
        try {
          console.log(`[CARD] Player ${socket.id} playing card ${cardId} in room ${roomId}`)
          
          // Get the room and verify the game exists
          const room = this.roomService.getRoom(roomId)
          if (!room || !room.game) {
            throw new Error('Game not found')
          }

          // Verify it's the player's turn
          const currentPlayer = room.game.players.find(p => p.id === socket.id)
          if (!currentPlayer) {
            throw new Error('Player not found in game')
          }
          if (room.game.state.currentPlayerId !== socket.id) {
            throw new Error('Not your turn')
          }

          // Play the card
          const updatedRoom = this.roomService.playCard(roomId, socket.id, cardId)
          
          // Send updated game state to all players in the room
          for (const player of updatedRoom.players) {
            const gameState = this.roomService.getGameState(roomId, player.id)
            console.log(`[GAME] Sending updated game state to ${player.username}, phase: ${gameState.currentPhase}`)
            this.io.to(player.id).emit('gameState', gameState)
          }
          
          // Send success response
          if (callback) {
            callback({ success: true })
          }
          
          // If the game is over, notify all players
          if (updatedRoom.status === 'finished' && updatedRoom.game?.winner) {
            this.io.to(roomId).emit('gameOver', { 
              winner: {
                id: updatedRoom.game.winner.id,
                username: updatedRoom.game.winner.username
              }
            })
          }
        } catch (error) {
          console.log(`[ERROR] ${(error as Error).message}`)
          socket.emit('error', { message: (error as Error).message })
          if (callback) {
            callback({ success: false, error: (error as Error).message })
          }
        }
      });

      // Start a game with all available cards (one of each)
      socket.on('startGameWithFullDeck', ({ roomId }) => {
        try {
          console.log(`[GAME] Starting game with full deck in room ${roomId}`);
          const room = this.roomService.startGame(roomId, true);
          
          // Send game state to all players in the room
          for (const player of room.players) {
            const gameState = this.roomService.getGameState(roomId, player.id);
            console.log(`[GAME] Sending initial game state to ${player.username}, phase: ${gameState.currentPhase}`);
            this.io.to(player.id).emit('gameState', gameState);
          }
          
          // Notify all players that game started with full deck
          this.io.to(roomId).emit('gameStarted', { 
            useFullDeck: true,
            message: 'Game started with all available cards (no duplicates)' 
          });
        } catch (error) {
          console.log(`[ERROR] ${(error as Error).message}`);
          socket.emit('error', { message: (error as Error).message });
        }
      });

      // Leave room
      socket.on('leaveRoom', ({ roomId }) => {
        try {
          if (!roomId) {
            // Find the room the player is in
            const room = this.roomService.getRoomByPlayerId(socket.id);
            if (room) {
              roomId = room.id;
            } else {
              throw new Error('Room not found');
            }
          }
          
          console.log(`[LEAVE] Player ${socket.id} leaving room ${roomId}`);
          const room = this.roomService.removePlayerFromRoom(roomId, socket.id);
          socket.leave(roomId);
          socket.emit('roomLeft', { roomId });
          
          // Notify other players in the room
          socket.to(roomId).emit('playerLeft', { playerId: socket.id });
        } catch (error) {
          console.log(`[ERROR] ${(error as Error).message}`);
          socket.emit('error', { message: (error as Error).message });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Find all rooms the player is in and remove them
        const rooms = this.roomService.getAllRooms();
        for (const room of rooms) {
          if (room.players.some(p => p.id === socket.id)) {
            this.roomService.removePlayerFromRoom(room.id, socket.id);
            // Notify other players in the room
            socket.to(room.id).emit('playerLeft', { playerId: socket.id });
          }
        }
      });

      // End turn
      socket.on('endTurn', ({ roomId }) => {
        try {
          console.log(`[TURN] Player ${socket.id} ending turn in room ${roomId}`)
          const room = this.roomService.getRoom(roomId)
          
          if (!room || !room.game) {
            throw new Error('Game not found')
          }
          
          // Check if it's the player's turn using currentPlayerId from game state
          if (room.game.state.currentPlayerId !== socket.id) {
            throw new Error('Not your turn')
          }
          
          // Start a new turn - get the updated room with the new game state
          const updatedRoom = this.roomService.startNewTurn(roomId)
          
          // Send updated game state to all players in the room
          for (const player of updatedRoom.players) {
            const gameState = this.roomService.getGameState(roomId, player.id)
            console.log(`[GAME] Sending updated game state to ${player.username}, phase: ${gameState.currentPhase}`)
            this.io.to(player.id).emit('gameState', gameState)
          }
        } catch (error) {
          console.log(`[ERROR] ${(error as Error).message}`)
          socket.emit('error', { message: (error as Error).message })
        }
      })
    });
  }
}
