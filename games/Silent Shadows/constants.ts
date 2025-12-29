
import { GameStatus, GuardMode } from './types';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const WORLD_WIDTH = 3550;

export const PHYSICS = {
  GRAVITY: 0.6,
  JUMP_FORCE: -13,
  RUN_SPEED: 4.2,
  SNEAK_SPEED: 2.1,
  BOLD_SPEED: 5.5,
  FRICTION: 0.85,
  MAX_FALL_SPEED: 15,
  COYOTE_TIME: 8,
};

export const STEALTH = {
  ALERT_THRESHOLD: 1800,
  DECOY_DURATION: 4000,
  MAX_GOGGLES: 3,
  PING_DURATION: 1200,
  BLEND_IDLE_REQUIRED: 100,
};

export const GUARD_CONFIG = {
  VIEW_DIST: 320,
  FOV: Math.PI * 0.4,
  PATROL_SPEED: 1.4,
  INVESTIGATE_SPEED: 2.6,
  SEARCH_TIME: 1500,
  EYE_DETECT_DIST: 50,
};

export const COLORS = {
  BG: '#020617',
  SOLID: '#1e293b',
  SOLID_ACCENT: '#334155',
  BLEND: 'rgba(15, 23, 42, 0.85)',
  PLAYER: '#f8fafc',
  PLAYER_SILHOUETTE: '#0f172a',
  GUARD_CONE: 'rgba(239, 68, 68, 0.15)',
  GUARD_CONE_ALERT: 'rgba(239, 68, 68, 0.4)',
  GUARD_BODY: '#ef4444',
  EXIT: '#10b981',
  DECOY: '#6366f1',
};

export const INITIAL_SOLIDS = [
  { x: 0, y: 620, w: 3550, h: 100 }, // Global Floor
  { x: 0, y: 0, w: 40, h: 720 },    // Left Boundary
  { x: 3510, y: 0, w: 40, h: 720 }, // Right Boundary

  // SECTOR 1: Infiltration Point
  { x: 400, y: 500, w: 300, h: 30 },
  { x: 800, y: 420, w: 250, h: 30 },
  // BARRIER A: Hanging blast door (PASS UNDER)
  { x: 1050, y: 0, w: 60, h: 540 }, 

  // SECTOR 2: Inner Hallway
  { x: 1300, y: 520, w: 300, h: 30 },
  { x: 1700, y: 440, w: 350, h: 30 },
  // BARRIER B: Heavy Shield Generator (JUMP OVER)
  { x: 2050, y: 480, w: 80, h: 140 },

  // SECTOR 3: Data Core Chamber
  { x: 2200, y: 360, w: 400, h: 30 },
  { x: 2650, y: 510, w: 250, h: 30 },
  // BARRIER C: Ventilation Shaft Intake (PASS UNDER)
  { x: 2950, y: 0, w: 60, h: 540 },

  // SECTOR 4: Extraction Zone
  { x: 3100, y: 430, w: 350, h: 30 },
];

export const INITIAL_BLEND_ZONES = [
  { x: 100, y: 550, w: 200, h: 70 },
  { x: 850, y: 550, w: 200, h: 70 },
  { x: 1450, y: 550, w: 200, h: 70 },
  { x: 2350, y: 550, w: 300, h: 70 },
  { x: 1750, y: 410, w: 200, h: 30 },
];

// Precisely 1 guard per major area
export const INITIAL_GUARDS = [
  { x: 600, y: 576, w: 24, h: 44, x1: 100, x2: 1000, dir: 1, facing: 0, mode: GuardMode.PATROL, timer: 0 },
  { x: 1500, y: 576, w: 24, h: 44, x1: 1150, x2: 2000, dir: -1, facing: Math.PI, mode: GuardMode.PATROL, timer: 0 },
  { x: 2500, y: 576, w: 24, h: 44, x1: 2150, x2: 2900, dir: 1, facing: 0, mode: GuardMode.PATROL, timer: 0 },
  { x: 3200, y: 576, w: 24, h: 44, x1: 3050, x2: 3450, dir: -1, facing: Math.PI, mode: GuardMode.PATROL, timer: 0 },
];
