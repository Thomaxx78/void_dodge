export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface Point {
  x: number;
  y: number;
}

export interface Vector {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Point;
  vel: Vector;
  size: number;
  color: string;
  opacity: number;
}

export interface Particle extends Entity {
  life: number;
  maxLife: number;
}

export interface Player extends Entity {
  speed: number;
  invincible: boolean;
}

export interface GameStats {
  score: number;
  highScore: number;
  timeSurvived: number;
}
