
export enum GameStatus {
  MENU = 'MENU',
  BRIEFING = 'BRIEFING',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST'
}

export enum GuardMode {
  PATROL = 'PATROL',
  INVESTIGATE = 'INVESTIGATE',
  SEARCH = 'SEARCH'
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Entity extends Rect {
  vx: number;
  vy: number;
}

export interface Player extends Entity {
  onGround: boolean;
  facing: number; // 0 for right, Math.PI for left
  lastMoveT: number;
  eyesClosed: boolean;
  goggles: number;
  coyoteTime: number;
  // Tracking internal key state to avoid repeated triggers
  _spacePressed?: boolean;
  _ePressed?: boolean;
}

export interface Guard extends Entity {
  x1: number;
  x2: number;
  dir: number;
  facing: number;
  mode: GuardMode;
  timer: number;
  onGround: boolean;
  investigateTarget?: Point;
}

export interface Decoy extends Point {
  created: number;
}

export interface GameState {
  t: number;
  status: GameStatus;
  player: Player;
  guards: Guard[];
  solids: Rect[];
  blendZones: Rect[];
  decoys: Decoy[];
  ping?: { x: number; y: number; created: number };
  exit: Rect;
  camX: number;
  seenMeter: number;
  intel?: string;
}
