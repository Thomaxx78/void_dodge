import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL || 'https://void-dodge.vercel.app/']
      : ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3002;

// Light colors for players
const PLAYER_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#98d8c8'];

interface Player {
  id: string;
  socketId: string;
  name: string;
  color: string;
  ready: boolean;
  alive: boolean;
  position: { x: number; y: number };
}

type GameMode = 'battle-royale' | 'shared-arena';

interface Enemy {
  id: string;
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  size: number;
}

interface Room {
  id: string;
  hostId: string;
  players: Map<string, Player>;
  state: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  availableColors: string[];
  winner: string | null;
  gameMode: GameMode | null;
  enemies: Enemy[];
}

const rooms = new Map<string, Room>();

// Generate room ID
function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Get available color for new player
function getAvailableColor(room: Room): string | null {
  if (room.availableColors.length === 0) return null;
  const colorIndex = Math.floor(Math.random() * room.availableColors.length);
  const color = room.availableColors[colorIndex];
  room.availableColors.splice(colorIndex, 1);
  return color;
}

// Return color when player leaves
function returnColor(room: Room, color: string): void {
  room.availableColors.push(color);
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create room
  socket.on('create-room', (playerName: string) => {
    const roomId = generateRoomId();
    const color = PLAYER_COLORS[0]; // Host gets first color

    const room: Room = {
      id: roomId,
      hostId: socket.id,
      players: new Map(),
      state: 'waiting',
      maxPlayers: 5,
      availableColors: [...PLAYER_COLORS.slice(1)], // Remaining colors
      winner: null,
      gameMode: null,
      enemies: []
    };

    const player: Player = {
      id: socket.id,
      socketId: socket.id,
      name: playerName,
      color: color,
      ready: true, // Host is auto-ready
      alive: true,
      position: { x: 500, y: 300 }
    };

    room.players.set(socket.id, player);
    rooms.set(roomId, room);

    socket.join(roomId);

    socket.emit('room-created', { roomId, player, room: serializeRoom(room) });
    console.log(`Room created: ${roomId} by ${playerName}`);
  });

  // Join room
  socket.on('join-room', ({ roomId, playerName }: { roomId: string; playerName: string }) => {
    console.log(`Join attempt - Room: ${roomId}, Player: ${playerName}`);
    console.log(`Available rooms: [${Array.from(rooms.keys()).join(', ')}]`);

    const room = rooms.get(roomId);

    if (!room) {
      console.log(`❌ Room ${roomId} NOT FOUND!`);
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    console.log(`✅ Room ${roomId} found! Adding player...`);

    if (room.state !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }

    if (room.players.size >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    const color = getAvailableColor(room);
    if (!color) {
      socket.emit('error', { message: 'No colors available' });
      return;
    }

    const player: Player = {
      id: socket.id,
      socketId: socket.id,
      name: playerName,
      color: color,
      ready: false,
      alive: true,
      position: { x: 500, y: 300 }
    };

    room.players.set(socket.id, player);
    socket.join(roomId);

    // Notify all players in room
    io.to(roomId).emit('player-joined', { player, room: serializeRoom(room) });
    socket.emit('room-joined', { player, room: serializeRoom(room) });

    console.log(`${playerName} joined room ${roomId}`);
  });

  // Select game mode (host only)
  socket.on('select-game-mode', ({ roomId, gameMode }: { roomId: string; gameMode: GameMode }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Only host can select game mode
    if (socket.id !== room.hostId) {
      socket.emit('error', { message: 'Only host can select game mode' });
      return;
    }

    room.gameMode = gameMode;
    io.to(roomId).emit('game-mode-selected', { gameMode, room: serializeRoom(room) });
    console.log(`Game mode selected in room ${roomId}: ${gameMode}`);
  });

  // Toggle ready status
  socket.on('toggle-ready', (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    // Host is always ready
    if (socket.id !== room.hostId) {
      player.ready = !player.ready;
      io.to(roomId).emit('room-updated', serializeRoom(room));
    }
  });

  // Start game (host only)
  socket.on('start-game', (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Only host can start
    if (socket.id !== room.hostId) {
      socket.emit('error', { message: 'Only host can start the game' });
      return;
    }

    // Check if game mode is selected
    if (!room.gameMode) {
      socket.emit('error', { message: 'Please select a game mode first' });
      return;
    }

    // Check if all players are ready
    const allReady = Array.from(room.players.values()).every(p => p.ready);
    if (!allReady) {
      socket.emit('error', { message: 'Not all players are ready' });
      return;
    }

    room.state = 'playing';
    io.to(roomId).emit('game-started', serializeRoom(room));
    console.log(`Game started in room ${roomId} with mode: ${room.gameMode}`);
  });

  // Player position update
  socket.on('player-move', ({ roomId, position }: { roomId: string; position: { x: number; y: number } }) => {
    const room = rooms.get(roomId);
    if (!room || room.state !== 'playing') return;

    const player = room.players.get(socket.id);
    if (!player || !player.alive) return;

    player.position = position;

    // Broadcast to other players in room
    socket.to(roomId).emit('player-moved', { playerId: socket.id, position });
  });

  // Player died
  socket.on('player-died', (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room || room.state !== 'playing') return;

    const player = room.players.get(socket.id);
    if (!player) return;

    player.alive = false;
    io.to(roomId).emit('player-died', { playerId: socket.id, playerName: player.name });

    // Check if only one player left
    const alivePlayers = Array.from(room.players.values()).filter(p => p.alive);
    if (alivePlayers.length === 1) {
      room.state = 'finished';
      room.winner = alivePlayers[0].name;
      io.to(roomId).emit('game-finished', {
        winner: alivePlayers[0].name,
        winnerId: alivePlayers[0].id
      });
      console.log(`Game finished in room ${roomId}. Winner: ${room.winner}`);
    } else if (alivePlayers.length === 0) {
      // All players died
      room.state = 'finished';
      room.winner = null;
      io.to(roomId).emit('game-finished', {
        winner: 'No one',
        winnerId: null
      });
      console.log(`Game finished in room ${roomId}. No winner - all players died`);
    }
  });

  // Spawn enemy (host only in shared-arena mode)
  socket.on('spawn-enemy', ({ roomId, enemy }: { roomId: string; enemy: Enemy }) => {
    const room = rooms.get(roomId);
    if (!room || room.state !== 'playing' || room.gameMode !== 'shared-arena') return;

    // Only host can spawn enemies
    if (socket.id !== room.hostId) return;

    room.enemies.push(enemy);
    io.to(roomId).emit('enemy-spawned', { enemy });
  });

  // Update enemies (host only in shared-arena mode)
  socket.on('update-enemies', ({ roomId, enemies }: { roomId: string; enemies: Enemy[] }) => {
    const room = rooms.get(roomId);
    if (!room || room.state !== 'playing' || room.gameMode !== 'shared-arena') return;

    // Only host can update enemies
    if (socket.id !== room.hostId) return;

    room.enemies = enemies;
    socket.to(roomId).emit('enemies-updated', { enemies });
  });

  // Leave room
  socket.on('leave-room', (roomId: string) => {
    handlePlayerLeave(socket.id, roomId);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    // Find and remove player from any room they're in
    rooms.forEach((room, roomId) => {
      if (room.players.has(socket.id)) {
        handlePlayerLeave(socket.id, roomId);
      }
    });
  });
});

// Handle player leaving room
function handlePlayerLeave(socketId: string, roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const player = room.players.get(socketId);
  if (!player) return;

  // Return player's color to available pool
  returnColor(room, player.color);
  room.players.delete(socketId);

  // If host left, assign new host or delete room
  if (socketId === room.hostId) {
    if (room.players.size > 0) {
      const newHost = Array.from(room.players.values())[0];
      room.hostId = newHost.socketId;
      newHost.ready = true; // New host is auto-ready
      io.to(roomId).emit('host-changed', { newHostId: newHost.socketId, room: serializeRoom(room) });
    } else {
      // Room is empty, delete it
      rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
      return;
    }
  }

  // Notify remaining players
  io.to(roomId).emit('player-left', {
    playerId: socketId,
    playerName: player.name,
    room: serializeRoom(room)
  });

  console.log(`${player.name} left room ${roomId}`);
}

// Serialize room for sending to clients
function serializeRoom(room: Room) {
  return {
    id: room.id,
    hostId: room.hostId,
    players: Array.from(room.players.values()),
    state: room.state,
    maxPlayers: room.maxPlayers,
    winner: room.winner,
    gameMode: room.gameMode
  };
}

httpServer.listen(PORT, () => {
  console.log(`🎮 Multiplayer server running on http://localhost:${PORT}`);
});
