import {  createRoom, RoomStatus, type Room } from '../models/Room';
import {  createPlayer } from '../models/Player';
import { GameService } from './GameService';
import { CardService } from './CardService';
import type { FrontendGameState } from '../models/Game';

export class RoomService {
  private rooms: Map<string, Room>;
  private gameService: GameService;
  private playerToRoom: Map<string, string>; // Track which room each player is in

  constructor() {
    this.rooms = new Map();
    const cardService = CardService.getInstance();
    this.gameService = new GameService(cardService);
    this.playerToRoom = new Map();
  }

  // Create a new room
  createRoom(name: string): Room {
    const room = createRoom(name);
    this.rooms.set(room.id, room);
    return room;
  }

  // Get a room by ID
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  // Get room by player ID
  getRoomByPlayerId(playerId: string): Room | undefined {
    const roomId = this.playerToRoom.get(playerId);
    if (roomId) {
      return this.getRoom(roomId);
    }
    return undefined;
  }

  // Get all rooms
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  // Add a player to a room
  addPlayerToRoom(roomId: string, userId: string, username: string): Room {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    
    if (room.players.length >= room.maxPlayers) {
      throw new Error('Room is full');
    }
    
    // Check if player is already in another room
    const existingRoomId = this.playerToRoom.get(userId);
    if (existingRoomId && existingRoomId !== roomId) {
      this.removePlayerFromRoom(existingRoomId, userId);
    }
    
    // Check if player is already in this room
    const existingPlayer = room.players.find(p => p.id === userId);
    if (existingPlayer) {
      return room; // Player already in room, just return the room
    }
    
    const player = createPlayer(userId, username);
    room.players.push(player);
    this.playerToRoom.set(userId, roomId);
    
    // If room is full, start the game
    if (room.players.length === room.maxPlayers) {
      this.startGame(roomId);
    }
    
    return room;
  }

  // Remove a player from a room
  removePlayerFromRoom(roomId: string, userId: string): Room {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    
    const playerIndex = room.players.findIndex(p => p.id === userId);
    if (playerIndex !== -1) {
      room.players.splice(playerIndex, 1);
      this.playerToRoom.delete(userId);
    }
    
    // If room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
    } else if (room.status === RoomStatus.PLAYING && room.players.length < 2) {
      // If a player leaves during a game, end the game
      room.status = RoomStatus.WAITING;
      room.game = null;
    }
    
    return room;
  }

  // Start a game in a room
  startGame(roomId: string): Room {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    
    if (room.players.length < 2) {
      throw new Error('Not enough players to start the game');
    }
    
    room.game = this.gameService.initializeGame(room.players);
    room.status = RoomStatus.PLAYING;
    
    return room;
  }

  // Play a card in a game
  playCard(roomId: string, playerId: string, cardId: string): Room {
    const room = this.getRoom(roomId);
    if (!room || !room.game) {
      throw new Error('Game not found');
    }
    
    room.game = this.gameService.playCard(room.game, playerId, cardId);
    
    // Check if the game is over
    if (room.game.isGameOver) {
      room.status = RoomStatus.FINISHED;
    }
    
    return room;
  }

  // Get the game state for a player
  getGameState(roomId: string, playerId: string): FrontendGameState {
    const room = this.getRoom(roomId);
    if (!room || !room.game) {
      throw new Error('Game not found');
    }
    
    return this.gameService.getGameState(room.game, playerId);
  }

  // Start a new turn
  startNewTurn(roomId: string): Room {
    const room = this.getRoom(roomId);
    if (!room || !room.game) {
      throw new Error('Game not found');
    }
    
    // Update the game object within the room
    room.game = this.gameService.startNewTurn(room.game);
    
    // Check if the game is over
    if (room.game.isGameOver) {
      room.status = RoomStatus.FINISHED;
    }
    
    return room;
  }
} 