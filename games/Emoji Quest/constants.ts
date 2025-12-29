
import { ItemType, Platform } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 600;

export const GRAVITY = 0.6;
export const JUMP_FORCE = -15;
export const MOVE_SPEED = 6;
export const FRICTION = 0.85;

export const ITEM_TYPES: ItemType[] = [
  { id: 'key', name: 'Key', emoji: '🔑', color: '#ffd666', points: 100 },
  { id: 'sword', name: 'Sword', emoji: '⚔️', color: '#aab4c2', points: 150 },
  { id: 'potion', name: 'Potion', emoji: '🧪', color: '#dca6ff', points: 200 },
  { id: 'gem', name: 'Gem', emoji: '💎', color: '#90d5ff', points: 300 },
  { id: 'scroll', name: 'Scroll', emoji: '📜', color: '#ffc1c1', points: 120 },
  { id: 'shield', name: 'Shield', emoji: '🛡️', color: '#a0e4b0', points: 180 },
];

export const INITIAL_PLATFORMS: Platform[] = [
  // Ground
  { x: 0, y: 550, width: WORLD_WIDTH, height: 50, color: '#4d6b31' },
  // Platforms
  { x: 300, y: 400, width: 200, height: 25, color: '#8b5a2b' },
  { x: 600, y: 300, width: 250, height: 25, color: '#8b5a2b' },
  { x: 950, y: 450, width: 200, height: 25, color: '#8b5a2b' },
  { x: 1300, y: 350, width: 300, height: 25, color: '#8b5a2b' },
  { x: 1700, y: 250, width: 200, height: 25, color: '#8b5a2b' },
  { x: 2000, y: 400, width: 250, height: 25, color: '#8b5a2b' },
  // Floating steps
  { x: 100, y: 450, width: 100, height: 20, color: '#8b5a2b' },
  { x: 1000, y: 250, width: 100, height: 20, color: '#8b5a2b' },
  { x: 1800, y: 480, width: 120, height: 20, color: '#8b5a2b' },
];
