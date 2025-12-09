import React, { useEffect, useRef, useCallback } from 'react';
import { GameState, Entity, Particle } from '../types';
import { MultiplayerPlayer, PlayerMovedEvent, PlayerDiedEvent, EnemySpawnedEvent } from '../types/multiplayer';
import { multiplayerService } from '../services/multiplayerService';

interface SharedArenaGameCanvasProps {
  gameState: GameState;
  players: MultiplayerPlayer[];
  onPlayerDied: () => void;
}

const PLAYER_SIZE = 12;
const PLAYER_SPEED = 6;
const SPAWN_RATE_INITIAL = 60;
const ENEMY_SPEED_BASE = 3;
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;

const SharedArenaGameCanvas: React.FC<SharedArenaGameCanvasProps> = ({
  gameState,
  players: initialPlayers,
  onPlayerDied
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Input state
  const keysPressed = useRef<Set<string>>(new Set());

  // Game Entities
  const playersRef = useRef<Map<string, MultiplayerPlayer>>(new Map());
  const enemiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const currentPlayer = multiplayerService.getCurrentPlayer();
  const isHost = multiplayerService.isHost();

  // Interpolation targets for smooth player movement
  const playerTargetsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Initialize and update players when initialPlayers changes
  useEffect(() => {
    // Update the map with all players from initialPlayers
    initialPlayers.forEach(player => {
      const existing = playersRef.current.get(player.id);
      if (existing) {
        // Update existing player but keep their current position if they're alive
        existing.name = player.name;
        existing.color = player.color;
        existing.ready = player.ready;
        if (!existing.alive) {
          existing.alive = player.alive;
        }
      } else {
        // Add new player
        playersRef.current.set(player.id, { ...player });
      }
    });

    // Remove players that are no longer in initialPlayers
    const currentIds = new Set(initialPlayers.map(p => p.id));
    Array.from(playersRef.current.keys()).forEach(id => {
      if (!currentIds.has(id)) {
        playersRef.current.delete(id);
      }
    });
  }, [initialPlayers]);

  // Input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.code);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Multiplayer event listeners
  useEffect(() => {
    const handlePlayerMoved = (data: PlayerMovedEvent) => {
      // Don't update our own position from network events
      if (data.playerId === currentPlayer?.id) return;

      let player = playersRef.current.get(data.playerId);

      // If player doesn't exist in our map, it's a new player - add them
      if (!player) {
        const newPlayer: MultiplayerPlayer = {
          id: data.playerId,
          socketId: data.playerId,
          name: 'Player',
          color: '#ffffff',
          ready: true,
          alive: true,
          position: data.position
        };
        playersRef.current.set(data.playerId, newPlayer);
        playerTargetsRef.current.set(data.playerId, { ...data.position });
      } else {
        // Store target position for interpolation
        playerTargetsRef.current.set(data.playerId, { ...data.position });
      }
    };

    const handlePlayerDied = (data: PlayerDiedEvent) => {
      const player = playersRef.current.get(data.playerId);
      if (player) {
        player.alive = false;
      }
    };

    const handleEnemySpawned = (data: EnemySpawnedEvent) => {
      // Only non-hosts receive spawn events and add enemies
      if (!isHost) {
        enemiesRef.current.push({
          id: data.enemy.id,
          pos: { ...data.enemy.pos },
          vel: { ...data.enemy.vel },
          size: data.enemy.size,
          color: '#ff0033',
          opacity: 1
        });
      }
    };

    multiplayerService.onPlayerMoved(handlePlayerMoved);
    multiplayerService.onPlayerDied(handlePlayerDied);
    multiplayerService.onEnemySpawned(handleEnemySpawned);

    return () => {
      multiplayerService.offPlayerMoved(handlePlayerMoved);
      multiplayerService.offPlayerDied(handlePlayerDied);
      multiplayerService.offEnemySpawned(handleEnemySpawned);
    };
  }, [isHost, currentPlayer]);

  // Initialize game
  const initGame = useCallback(() => {
    enemiesRef.current = [];
    particlesRef.current = [];
    frameCountRef.current = 0;

    // Initialize player positions in a circle
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;
    const radius = 100;
    const players = Array.from(playersRef.current.values());

    players.forEach((player, index) => {
      const angle = (Math.PI * 2 * index) / players.length;
      player.position = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
      player.alive = true;
    });

    // Send initial position to server immediately
    if (currentPlayer) {
      const myPlayer = playersRef.current.get(currentPlayer.id);
      if (myPlayer) {
        multiplayerService.sendPlayerPosition(myPlayer.position);
      }
    }
  }, [currentPlayer]);

  // Game loop
  const update = useCallback(() => {
    if (gameState !== GameState.PLAYING || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameCountRef.current++;

    // Get current player
    const myPlayer = currentPlayer ? playersRef.current.get(currentPlayer.id) : null;

    if (myPlayer && myPlayer.alive) {
      // Update current player movement
      let dx = 0;
      let dy = 0;

      if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('KeyW')) dy -= 1;
      if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('KeyS')) dy += 1;
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) dx -= 1;
      if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length) * PLAYER_SPEED;
        dy = (dy / length) * PLAYER_SPEED;
      }

      myPlayer.position.x += dx;
      myPlayer.position.y += dy;

      // Boundary check
      myPlayer.position.x = Math.max(PLAYER_SIZE, Math.min(GAME_WIDTH - PLAYER_SIZE, myPlayer.position.x));
      myPlayer.position.y = Math.max(PLAYER_SIZE, Math.min(GAME_HEIGHT - PLAYER_SIZE, myPlayer.position.y));

      // Send position to server every 5 frames (reduced frequency)
      if (frameCountRef.current % 5 === 0) {
        multiplayerService.sendPlayerPosition(myPlayer.position);
      }
    }

    // Interpolate other players' positions for smooth movement
    playersRef.current.forEach((player, playerId) => {
      // Skip current player (controlled locally)
      if (playerId === currentPlayer?.id) return;

      const target = playerTargetsRef.current.get(playerId);
      if (target && player.alive) {
        // Linear interpolation with factor 0.3 (smooth but responsive)
        const lerpFactor = 0.3;
        player.position.x += (target.x - player.position.x) * lerpFactor;
        player.position.y += (target.y - player.position.y) * lerpFactor;
      }
    });

    // Spawn enemies (only host spawns in shared arena)
    if (isHost) {
      const difficultyFactor = Math.min(frameCountRef.current / 3000, 3.5);
      const currentSpawnRate = Math.max(7, SPAWN_RATE_INITIAL - (frameCountRef.current / 30));

      if (frameCountRef.current % Math.floor(currentSpawnRate) === 0) {
        let spawnCount = 1;

        if (frameCountRef.current > 500) {
          if (Math.random() < 0.3) spawnCount = 2;
        }
        if (frameCountRef.current > 1500) {
          if (Math.random() < 0.5) spawnCount = 3;
        }

        for (let i = 0; i < spawnCount; i++) {
          const size = 15 + Math.random() * 15;
          const side = Math.floor(Math.random() * 4);
          let x = 0, y = 0, vx = 0, vy = 0;

          // Spawn from random side
          switch (side) {
            case 0: x = Math.random() * GAME_WIDTH; y = -size; break;
            case 1: x = GAME_WIDTH + size; y = Math.random() * GAME_HEIGHT; break;
            case 2: x = Math.random() * GAME_WIDTH; y = GAME_HEIGHT + size; break;
            case 3: x = -size; y = Math.random() * GAME_HEIGHT; break;
          }

          // Random direction (instead of targeting specific player)
          const targetX = Math.random() * GAME_WIDTH;
          const targetY = Math.random() * GAME_HEIGHT;

          const angle = Math.atan2(targetY - y, targetX - x);
          const speed = (ENEMY_SPEED_BASE + Math.random() * 2) * (1 + difficultyFactor * 0.4);

          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;

          const enemy = {
            id: `enemy-${frameCountRef.current}-${i}`,
            pos: { x, y },
            vel: { x: vx, y: vy },
            size,
            color: '#ff0033',
            opacity: 1
          };

          enemiesRef.current.push(enemy);

          // Broadcast ONLY the spawn event with initial position + velocity
          // Clients will calculate movement themselves
          multiplayerService.spawnEnemy({
            id: enemy.id,
            pos: enemy.pos,
            vel: enemy.vel,
            size: enemy.size
          });
        }
      }

      // Update enemies locally (same for all clients)
      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const enemy = enemiesRef.current[i];
        enemy.pos.x += enemy.vel.x;
        enemy.pos.y += enemy.vel.y;

        const margin = 100;
        if (
          enemy.pos.x < -margin ||
          enemy.pos.x > GAME_WIDTH + margin ||
          enemy.pos.y < -margin ||
          enemy.pos.y > GAME_HEIGHT + margin
        ) {
          enemiesRef.current.splice(i, 1);
        }
      }

      // No need to broadcast positions anymore - all clients calculate the same trajectory!
    } else {
      // Non-host: interpolate enemy positions locally based on velocity
      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const enemy = enemiesRef.current[i];
        enemy.pos.x += enemy.vel.x;
        enemy.pos.y += enemy.vel.y;

        // Remove enemies that go off screen
        const margin = 100;
        if (
          enemy.pos.x < -margin ||
          enemy.pos.x > GAME_WIDTH + margin ||
          enemy.pos.y < -margin ||
          enemy.pos.y > GAME_HEIGHT + margin
        ) {
          enemiesRef.current.splice(i, 1);
        }
      }
    }

    // Check collision with all alive players
    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
      const enemy = enemiesRef.current[i];

      playersRef.current.forEach((player) => {
        if (!player.alive) return;

        const closestX = Math.max(enemy.pos.x - enemy.size / 2, Math.min(player.position.x, enemy.pos.x + enemy.size / 2));
        const closestY = Math.max(enemy.pos.y - enemy.size / 2, Math.min(player.position.y, enemy.pos.y + enemy.size / 2));

        const distanceX = player.position.x - closestX;
        const distanceY = player.position.y - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        if (distanceSquared < (PLAYER_SIZE * PLAYER_SIZE)) {
          player.alive = false;

          // If it's the current player, notify server
          if (currentPlayer && player.id === currentPlayer.id) {
            multiplayerService.sendPlayerDied();
            onPlayerDied();
          }
        }
      });
    }

    // Update particles
    if (frameCountRef.current % 5 === 0) {
      particlesRef.current.push({
        id: `p-${frameCountRef.current}`,
        pos: { x: Math.random() * GAME_WIDTH, y: Math.random() * GAME_HEIGHT },
        vel: { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20 },
        size: Math.random() * 2,
        color: 'rgba(255, 255, 255, 0.1)',
        life: 20,
        maxLife: 20,
        opacity: 0.2
      });
    }

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.life--;
      p.pos.x -= 2;
      if (p.life <= 0) particlesRef.current.splice(i, 1);
    }

    draw(ctx);

    requestRef.current = requestAnimationFrame(update);
  }, [gameState, currentPlayer, onPlayerDied, isHost]);

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;

    const offsetX = (width - GAME_WIDTH) / 2;
    const offsetY = (height - GAME_HEIGHT) / 2;

    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Game area
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Border
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.shadowBlur = 0;

    // Grid
    ctx.strokeStyle = 'rgba(20, 20, 20, 1)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    const gridOffset = (frameCountRef.current * 2) % gridSize;

    ctx.beginPath();
    for (let x = 0; x <= GAME_WIDTH; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_HEIGHT);
    }
    for (let y = gridOffset; y <= GAME_HEIGHT; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_WIDTH, y);
    }
    ctx.stroke();

    // Particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    particlesRef.current.forEach(p => {
      ctx.beginPath();
      ctx.rect(p.pos.x, p.pos.y, p.size * 10, p.size);
      ctx.fill();
    });

    // Enemies
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0033';
    ctx.fillStyle = '#ff0033';
    enemiesRef.current.forEach(e => {
      ctx.beginPath();
      ctx.rect(e.pos.x - e.size / 2, e.pos.y - e.size / 2, e.size, e.size);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 0, 51, 0.3)';
      ctx.fillRect(e.pos.x - e.size / 2 - e.vel.x * 2, e.pos.y - e.size / 2 - e.vel.y * 2, e.size, e.size);

      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ff0033';
    });

    ctx.shadowBlur = 0;

    // Players
    playersRef.current.forEach((player) => {
      if (!player.alive) return;

      ctx.shadowBlur = 20;
      ctx.shadowColor = player.color;
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(player.position.x, player.position.y, PLAYER_SIZE, 0, Math.PI * 2);
      ctx.fill();

      // Player name
      ctx.shadowBlur = 0;
      ctx.fillStyle = player.color;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(player.name, player.position.x, player.position.y - PLAYER_SIZE - 5);
    });

    ctx.shadowBlur = 0;
    ctx.restore();

    // Arena info
    ctx.fillStyle = '#00ffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`SHARED ARENA: ${GAME_WIDTH}x${GAME_HEIGHT}`, width / 2, offsetY - 10);

    // Alive players count
    const aliveCount = Array.from(playersRef.current.values()).filter(p => p.alive).length;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Players Alive: ${aliveCount}`, width - 20, 30);
  };

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Game loop management
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      initGame();
      requestRef.current = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, initGame, update]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

export default SharedArenaGameCanvas;
