
import { GameState, GuardMode } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, GUARD_CONFIG, STEALTH } from '../constants';

export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { player, guards, solids, blendZones, decoys, ping, exit, camX, seenMeter, status } = state;

  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Deep Parallax (Far city/facility silhouettes)
  ctx.save();
  ctx.translate(-camX * 0.1, 0);
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, 10000, GAME_HEIGHT);
  ctx.fillStyle = '#070a18';
  for (let i = 0; i < 20; i++) {
    ctx.fillRect(i * 400 - 200, 50, 200, 700);
  }
  ctx.restore();

  // Mid Parallax (Structural elements)
  ctx.save();
  ctx.translate(-camX * 0.25, 0);
  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < 15; i++) {
    ctx.fillRect(i * 600 + 100, 100, 300, 600);
    // Detail lines on background buildings
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(i * 600 + 100, 100, 300, 600);
  }
  ctx.restore();

  // World Layer
  ctx.save();
  ctx.translate(-camX, 0);

  // Blend Zones (Shadow areas)
  for (const b of blendZones) {
    ctx.fillStyle = COLORS.BLEND;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for(let sy=b.y; sy<b.y+b.h; sy+=4) {
      ctx.beginPath();
      ctx.moveTo(b.x, sy);
      ctx.lineTo(b.x+b.w, sy);
      ctx.stroke();
    }
  }

  // Holographic Exit
  const exitPulse = Math.sin(state.t * 0.005) * 0.2 + 0.8;
  ctx.save();
  ctx.fillStyle = `rgba(16, 185, 129, ${0.1 * exitPulse})`;
  ctx.fillRect(exit.x - 20, 0, exit.w + 40, GAME_HEIGHT);
  
  ctx.fillStyle = COLORS.EXIT;
  ctx.shadowBlur = 20 * exitPulse;
  ctx.shadowColor = COLORS.EXIT;
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.globalAlpha = exitPulse;
  ctx.fillText('EXTRACT', exit.x + exit.w / 2, exit.y - 25);
  ctx.beginPath();
  ctx.moveTo(exit.x + exit.w/2 - 10, exit.y - 15);
  ctx.lineTo(exit.x + exit.w/2 + 10, exit.y - 15);
  ctx.lineTo(exit.x + exit.w/2, exit.y - 5);
  ctx.fill();
  ctx.restore();

  // Solids with detail
  for (const s of solids) {
    const gradient = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.h);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    
    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(s.x, s.y, s.w, 2);

    ctx.strokeStyle = COLORS.SOLID_ACCENT;
    ctx.lineWidth = 1;
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  }

  // Decoys
  for (const d of decoys) {
    const life = 1 - (state.t - d.created) / STEALTH.DECOY_DURATION;
    const pulse = Math.sin(state.t * 0.02) * 0.5 + 0.5;
    ctx.fillStyle = '#22d3ee';
    ctx.shadowBlur = 30 * life * pulse;
    ctx.shadowColor = '#22d3ee';
    ctx.beginPath();
    ctx.arc(d.x, d.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Ping (Noise detection circle)
  if (ping) {
    const age = state.t - ping.created;
    const progress = age / STEALTH.PING_DURATION;
    const alpha = (1 - progress) * 0.8;
    ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(ping.x, ping.y, 10 + progress * 150, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Guards
  for (const g of guards) {
    // Cone
    ctx.save();
    ctx.translate(g.x + g.w / 2, g.y + g.h / 3);
    ctx.rotate(g.facing);
    const coneGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, GUARD_CONFIG.VIEW_DIST);
    const baseColor = (g.mode === GuardMode.PATROL) ? COLORS.GUARD_CONE : COLORS.GUARD_CONE_ALERT;
    coneGrad.addColorStop(0, baseColor);
    coneGrad.addColorStop(0.4, baseColor.replace('0.15', '0.08').replace('0.4', '0.2'));
    coneGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, GUARD_CONFIG.VIEW_DIST, -GUARD_CONFIG.FOV / 2, GUARD_CONFIG.FOV / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Guard Body
    const isAlert = g.mode !== GuardMode.PATROL;
    ctx.fillStyle = isAlert ? '#ef4444' : '#334155';
    ctx.fillRect(g.x, g.y, g.w, g.h);
    
    // Guard Visor
    const pulse = isAlert ? (Math.sin(state.t * 0.01) * 0.5 + 0.5) : 1;
    ctx.fillStyle = isAlert ? `rgba(255, 255, 255, ${pulse})` : '#ef4444';
    const gEyeX = g.dir > 0 ? g.x + g.w - 12 : g.x + 4;
    ctx.fillRect(gEyeX, g.y + 6, 8, 4);

    if (isAlert) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(g.mode === GuardMode.INVESTIGATE ? '?' : '!', g.x + g.w / 2, g.y - 20);
    }
  }

  // Player
  const moving = (state.t - player.lastMoveT) < STEALTH.BLEND_IDLE_REQUIRED;
  const inBlend = blendZones.some(b => 
    player.x + player.w/2 >= b.x && 
    player.x + player.w/2 <= b.x + b.w && 
    player.y + player.h/2 >= b.y && 
    player.y + player.h/2 <= b.y + b.h
  );
  const blended = inBlend && !moving;

  ctx.save();
  if (blended) {
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#0f172a';
  } else {
    ctx.fillStyle = '#f8fafc';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(255,255,255,0.2)';
  }
  ctx.fillRect(player.x, player.y, player.w, player.h);
  
  // Goggles (The Eyes)
  const eyeWidth = 14;
  const eyeHeight = 6;
  const eyeX = player.facing === 0 ? player.x + player.w - eyeWidth + 4 : player.x - 4;
  const eyeY = player.y + 8;

  if (player.eyesClosed) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(eyeX, eyeY + eyeHeight/2 - 1, eyeWidth, 2);
  } else {
    ctx.fillStyle = '#22d3ee';
    ctx.shadowBlur = blended ? 0 : 20;
    ctx.shadowColor = '#22d3ee';
    ctx.fillRect(eyeX, eyeY, eyeWidth, eyeHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(eyeX + 2, eyeY + 1, eyeWidth - 4, eyeHeight - 2);
  }
  ctx.restore();

  ctx.restore();

  // Screen Shake and Alert Overlays
  if (seenMeter > 0) {
    const intensity = (seenMeter / STEALTH.ALERT_THRESHOLD);
    const shake = intensity * 8;
    const ox = (Math.random() - 0.5) * shake;
    const oy = (Math.random() - 0.5) * shake;
    ctx.canvas.style.transform = `translate(${ox}px, ${oy}px)`;
    
    // Alert Flash
    if (intensity > 0.5) {
       ctx.fillStyle = `rgba(239, 68, 68, ${0.15 * intensity * (Math.sin(state.t * 0.05) * 0.5 + 0.5)})`;
       ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
  } else {
    ctx.canvas.style.transform = 'none';
  }
}
