
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  WIN = 'WIN'
}

export interface ItemType {
  id: string;
  name: string;
  emoji: string;
  color: string;
  points: number;
}

export interface GameItem {
  id: number;
  x: number;
  y: number;
  type: ItemType;
  width: number;
  height: number;
}

export interface Goal {
  id: number;
  x: number;
  y: number;
  requiredType: ItemType;
  completed: boolean;
  width: number;
  height: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isJumping: boolean;
  direction: 'left' | 'right';
  heldItem: GameItem | null;
}

export interface GameMessage {
  text: string;
  timer: number;
  color: string;
}
