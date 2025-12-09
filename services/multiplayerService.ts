import { io, Socket } from 'socket.io-client';
import {
  MultiplayerRoom,
  MultiplayerPlayer,
  RoomCreatedEvent,
  RoomJoinedEvent,
  PlayerJoinedEvent,
  PlayerLeftEvent,
  PlayerMovedEvent,
  PlayerDiedEvent,
  GameFinishedEvent,
  HostChangedEvent,
  ErrorEvent
} from '../types/multiplayer';

class MultiplayerService {
  private socket: Socket | null = null;
  private currentRoom: MultiplayerRoom | null = null;
  private currentPlayer: MultiplayerPlayer | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:3002', {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to multiplayer server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from multiplayer server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentRoom = null;
      this.currentPlayer = null;
    }
  }

  createRoom(playerName: string): Promise<RoomCreatedEvent> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('create-room', playerName);

      this.socket.once('room-created', (data: RoomCreatedEvent) => {
        this.currentRoom = data.room;
        this.currentPlayer = data.player;
        resolve(data);
      });

      this.socket.once('error', (error: ErrorEvent) => {
        reject(new Error(error.message));
      });
    });
  }

  joinRoom(roomId: string, playerName: string): Promise<RoomJoinedEvent> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('join-room', { roomId, playerName });

      this.socket.once('room-joined', (data: RoomJoinedEvent) => {
        this.currentRoom = data.room;
        this.currentPlayer = data.player;
        resolve(data);
      });

      this.socket.once('error', (error: ErrorEvent) => {
        reject(new Error(error.message));
      });
    });
  }

  leaveRoom() {
    if (!this.socket || !this.currentRoom) return;

    this.socket.emit('leave-room', this.currentRoom.id);
    this.currentRoom = null;
    this.currentPlayer = null;
  }

  toggleReady() {
    if (!this.socket || !this.currentRoom) return;
    this.socket.emit('toggle-ready', this.currentRoom.id);
  }

  startGame() {
    if (!this.socket || !this.currentRoom) return;
    this.socket.emit('start-game', this.currentRoom.id);
  }

  sendPlayerPosition(position: { x: number; y: number }) {
    if (!this.socket || !this.currentRoom) return;
    this.socket.emit('player-move', {
      roomId: this.currentRoom.id,
      position
    });
  }

  sendPlayerDied() {
    if (!this.socket || !this.currentRoom) return;
    this.socket.emit('player-died', this.currentRoom.id);
  }

  // Event listeners
  onPlayerJoined(callback: (data: PlayerJoinedEvent) => void) {
    this.socket?.on('player-joined', callback);
  }

  onPlayerLeft(callback: (data: PlayerLeftEvent) => void) {
    this.socket?.on('player-left', callback);
  }

  onRoomUpdated(callback: (room: MultiplayerRoom) => void) {
    this.socket?.on('room-updated', callback);
  }

  onGameStarted(callback: (room: MultiplayerRoom) => void) {
    this.socket?.on('game-started', callback);
  }

  onPlayerMoved(callback: (data: PlayerMovedEvent) => void) {
    this.socket?.on('player-moved', callback);
  }

  onPlayerDied(callback: (data: PlayerDiedEvent) => void) {
    this.socket?.on('player-died', callback);
  }

  onGameFinished(callback: (data: GameFinishedEvent) => void) {
    this.socket?.on('game-finished', callback);
  }

  onHostChanged(callback: (data: HostChangedEvent) => void) {
    this.socket?.on('host-changed', callback);
  }

  onError(callback: (error: ErrorEvent) => void) {
    this.socket?.on('error', callback);
  }

  // Remove event listeners
  offPlayerJoined(callback: (data: PlayerJoinedEvent) => void) {
    this.socket?.off('player-joined', callback);
  }

  offPlayerLeft(callback: (data: PlayerLeftEvent) => void) {
    this.socket?.off('player-left', callback);
  }

  offRoomUpdated(callback: (room: MultiplayerRoom) => void) {
    this.socket?.off('room-updated', callback);
  }

  offGameStarted(callback: (room: MultiplayerRoom) => void) {
    this.socket?.off('game-started', callback);
  }

  offPlayerMoved(callback: (data: PlayerMovedEvent) => void) {
    this.socket?.off('player-moved', callback);
  }

  offPlayerDied(callback: (data: PlayerDiedEvent) => void) {
    this.socket?.off('player-died', callback);
  }

  offGameFinished(callback: (data: GameFinishedEvent) => void) {
    this.socket?.off('game-finished', callback);
  }

  offHostChanged(callback: (data: HostChangedEvent) => void) {
    this.socket?.off('host-changed', callback);
  }

  offError(callback: (error: ErrorEvent) => void) {
    this.socket?.off('error', callback);
  }

  getCurrentRoom(): MultiplayerRoom | null {
    return this.currentRoom;
  }

  getCurrentPlayer(): MultiplayerPlayer | null {
    return this.currentPlayer;
  }

  isHost(): boolean {
    return this.currentPlayer?.id === this.currentRoom?.hostId;
  }
}

export const multiplayerService = new MultiplayerService();
