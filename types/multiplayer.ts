export interface MultiplayerPlayer {
  id: string;
  socketId: string;
  name: string;
  color: string;
  ready: boolean;
  alive: boolean;
  position: { x: number; y: number };
}

export interface MultiplayerRoom {
  id: string;
  hostId: string;
  players: MultiplayerPlayer[];
  state: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  winner: string | null;
}

export interface RoomCreatedEvent {
  roomId: string;
  player: MultiplayerPlayer;
  room: MultiplayerRoom;
}

export interface RoomJoinedEvent {
  player: MultiplayerPlayer;
  room: MultiplayerRoom;
}

export interface PlayerJoinedEvent {
  player: MultiplayerPlayer;
  room: MultiplayerRoom;
}

export interface PlayerLeftEvent {
  playerId: string;
  playerName: string;
  room: MultiplayerRoom;
}

export interface PlayerMovedEvent {
  playerId: string;
  position: { x: number; y: number };
}

export interface PlayerDiedEvent {
  playerId: string;
  playerName: string;
}

export interface GameFinishedEvent {
  winner: string;
  winnerId: string;
}

export interface HostChangedEvent {
  newHostId: string;
  room: MultiplayerRoom;
}

export interface ErrorEvent {
  message: string;
}
