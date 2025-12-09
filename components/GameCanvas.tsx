import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Player, Entity, Particle } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
  setScore: (score: number) => void;
}

const PLAYER_SIZE = 12;
const PLAYER_SPEED = 6;
const SPAWN_RATE_INITIAL = 60; // Frames
const ENEMY_SPEED_BASE = 3;

// Fixed game arena size for fair gameplay
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onGameOver, setScore }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);

  // Input state
  const keysPressed = useRef<Set<string>>(new Set());

  // Game Entities Refs (avoid state for performance in tight loop)
  const playerRef = useRef<Player>({
    id: 'player',
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    size: PLAYER_SIZE,
    color: '#ffffff',
    speed: PLAYER_SPEED,
    invincible: false,
    opacity: 1
  });
  
  const enemiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  // Initialize input listeners
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

  // Initialize Game
  const initGame = useCallback(() => {
    if (!canvasRef.current) return;

    playerRef.current.pos = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
    playerRef.current.vel = { x: 0, y: 0 };
    enemiesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    frameCountRef.current = 0;
    setScore(0);
  }, [setScore]);

  // Game Loop
  const update = useCallback(() => {
    if (gameState !== GameState.PLAYING || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameCountRef.current++;
    scoreRef.current += 1; // Time based scoring + survival
    if (frameCountRef.current % 10 === 0) setScore(scoreRef.current);

    // --- Update Player ---
    const player = playerRef.current;
    let dx = 0;
    let dy = 0;

    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('KeyW')) dy -= 1;
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('KeyS')) dy += 1;
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) dx -= 1;
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx = (dx / length) * player.speed;
      dy = (dy / length) * player.speed;
    }

    player.pos.x += dx;
    player.pos.y += dy;

    // Boundary check (use fixed game dimensions)
    player.pos.x = Math.max(player.size, Math.min(GAME_WIDTH - player.size, player.pos.x));
    player.pos.y = Math.max(player.size, Math.min(GAME_HEIGHT - player.size, player.pos.y));

    // --- Spawn Enemies ---
    // Difficulty curve logic:
    // User requested difficulty to rise linearly until 1300, then slow down.
    
    const rawScore = scoreRef.current;
    let effectiveDifficultyScore = rawScore;

    if (rawScore > 1300) {
      // After 1300, every 1 actual point only adds 0.25 to the "difficulty score"
      // This drastically slows down the ramp up of speed and spawn density
      effectiveDifficultyScore = 1300 + (rawScore - 1300) * 0.25;
    }

    const difficultyFactor = Math.min(effectiveDifficultyScore / 1000, 3.5); 
    const currentSpawnRate = Math.max(7, SPAWN_RATE_INITIAL - (effectiveDifficultyScore / 30));

    if (frameCountRef.current % Math.floor(currentSpawnRate) === 0) {
      // Logic for multiple enemies ("+ d'obstacles")
      let spawnCount = 1;
      
      // Multi-spawn probabilities based on RAW score to keep chaos high, 
      // but the *speed* and *frequency* of these spawns is controlled by effectiveScore above.
      if (rawScore > 500) {
         if (Math.random() < 0.3) spawnCount = 2;
      }
      if (rawScore > 1500) {
         if (Math.random() < 0.5) spawnCount = 3;
      }
      if (rawScore > 3000) {
         spawnCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 enemies
      }

      for (let i = 0; i < spawnCount; i++) {
        const size = 15 + Math.random() * 15;
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x = 0, y = 0, vx = 0, vy = 0;

        // Spawn on edge (use fixed game dimensions)
        switch(side) {
          case 0: x = Math.random() * GAME_WIDTH; y = -size; break;
          case 1: x = GAME_WIDTH + size; y = Math.random() * GAME_HEIGHT; break;
          case 2: x = Math.random() * GAME_WIDTH; y = GAME_HEIGHT + size; break;
          case 3: x = -size; y = Math.random() * GAME_HEIGHT; break;
        }

        // Target slightly offset from player to create chaos, not perfect homing
        const angle = Math.atan2(player.pos.y - y + (Math.random() * 100 - 50), player.pos.x - x + (Math.random() * 100 - 50));
        const speed = (ENEMY_SPEED_BASE + Math.random() * 2) * (1 + difficultyFactor * 0.4);
        
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;

        enemiesRef.current.push({
          id: `enemy-${frameCountRef.current}-${i}`,
          pos: { x, y },
          vel: { x: vx, y: vy },
          size,
          color: '#ff0033',
          opacity: 1
        });
      }
    }

    // --- Update Enemies ---
    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
      const enemy = enemiesRef.current[i];
      enemy.pos.x += enemy.vel.x;
      enemy.pos.y += enemy.vel.y;

      // Remove off-screen enemies (with margin, use fixed game dimensions)
      const margin = 100;
      if (
        enemy.pos.x < -margin ||
        enemy.pos.x > GAME_WIDTH + margin ||
        enemy.pos.y < -margin ||
        enemy.pos.y > GAME_HEIGHT + margin
      ) {
        enemiesRef.current.splice(i, 1);
        continue;
      }

      // Collision Detection (Circle vs Rectangle simplified to Box vs Box for tighter feel or precise shapes)
      // Player is circle, Enemy is square.
      // Closest point on rectangle to circle center
      const closestX = Math.max(enemy.pos.x - enemy.size/2, Math.min(player.pos.x, enemy.pos.x + enemy.size/2));
      const closestY = Math.max(enemy.pos.y - enemy.size/2, Math.min(player.pos.y, enemy.pos.y + enemy.size/2));
      
      const distanceX = player.pos.x - closestX;
      const distanceY = player.pos.y - closestY;
      const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

      if (distanceSquared < (player.size * player.size)) {
        // Collision!
        onGameOver(scoreRef.current);
        return; // Stop updating this frame
      }
    }

    // --- Speed Lines / Particles ---
    if (frameCountRef.current % 5 === 0) {
      particlesRef.current.push({
        id: `p-${frameCountRef.current}`,
        pos: { x: Math.random() * GAME_WIDTH, y: Math.random() * GAME_HEIGHT },
        vel: { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20 }, // Fast random motion
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
      p.pos.x -= (player.vel.x * 0.5) + 2; // Parallax effect moving left/back
      // p.pos.y += p.vel.y;
      if (p.life <= 0) particlesRef.current.splice(i, 1);
    }

    // --- Render ---
    draw(ctx);

    requestRef.current = requestAnimationFrame(update);
  }, [gameState, setScore, onGameOver]);

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;

    // Calculate offsets to center the game area
    const offsetX = (width - GAME_WIDTH) / 2;
    const offsetY = (height - GAME_HEIGHT) / 2;

    // Clear full canvas background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Save context state
    ctx.save();

    // Translate to game area
    ctx.translate(offsetX, offsetY);

    // Draw game area background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw game area border
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.shadowBlur = 0;

    // Grid effect (faint) to show motion (use fixed game dimensions)
    ctx.strokeStyle = 'rgba(20, 20, 20, 1)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    const gridOffset = (frameCountRef.current * 2) % gridSize;

    ctx.beginPath();
    // Moving grid
    for (let x = 0; x <= GAME_WIDTH; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_HEIGHT);
    }
    for (let y = gridOffset; y <= GAME_HEIGHT; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_WIDTH, y);
    }
    ctx.stroke();

    // Draw Speed Lines (Particles)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    particlesRef.current.forEach(p => {
      ctx.beginPath();
      ctx.rect(p.pos.x, p.pos.y, p.size * 10, p.size); // Stretch for speed
      ctx.fill();
    });

    // Draw Enemies (Squares)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0033';
    ctx.fillStyle = '#ff0033';
    enemiesRef.current.forEach(e => {
      ctx.beginPath();
      // Draw centered square
      ctx.rect(e.pos.x - e.size/2, e.pos.y - e.size/2, e.size, e.size);
      ctx.fill();
      
      // Trail effect (simple)
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 0, 51, 0.3)';
      ctx.fillRect(e.pos.x - e.size/2 - e.vel.x * 2, e.pos.y - e.size/2 - e.vel.y * 2, e.size, e.size);
      
      // Restore main glow
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ff0033';
    });

    // Draw Player (Circle)
    const p = playerRef.current;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Restore context
    ctx.restore();

    // Draw game dimensions info (outside game area)
    ctx.fillStyle = '#00ffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Arena: ${GAME_WIDTH}x${GAME_HEIGHT}`, width / 2, offsetY - 10);
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

  // Game Loop Management
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

export default GameCanvas;