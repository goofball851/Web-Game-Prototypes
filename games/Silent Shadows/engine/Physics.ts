
import { Rect, Entity, Player } from '../types';
import { PHYSICS } from '../constants';

export function checkHit(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function resolveCollisions(entity: Entity, solids: Rect[], isPlayer = false): void {
  // Horizontal
  entity.x += entity.vx;
  let box = { x: entity.x, y: entity.y, w: entity.w, h: entity.h };
  
  for (const s of solids) {
    if (checkHit(box, s)) {
      if (entity.vx > 0) entity.x = s.x - entity.w;
      else if (entity.vx < 0) entity.x = s.x + s.w;
      entity.vx = 0;
      box.x = entity.x;
    }
  }

  // Vertical
  entity.y += entity.vy;
  box.y = entity.y;
  let onGround = false;

  for (const s of solids) {
    if (checkHit(box, s)) {
      if (entity.vy > 0) {
        entity.y = s.y - entity.h;
        entity.vy = 0;
        onGround = true;
      } else if (entity.vy < 0) {
        entity.y = s.y + s.h;
        entity.vy = 0;
      }
      box.y = entity.y;
    }
  }

  if (isPlayer) {
    (entity as Player).onGround = onGround;
    if (onGround) (entity as Player).coyoteTime = PHYSICS.COYOTE_TIME;
    else if ((entity as Player).coyoteTime > 0) (entity as Player).coyoteTime--;
  }
}
