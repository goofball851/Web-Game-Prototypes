
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameStatus, GameState, GuardMode, Player, Guard } from './types';
import { 
  GAME_WIDTH, GAME_HEIGHT, PHYSICS, STEALTH, WORLD_WIDTH, GUARD_CONFIG,
  INITIAL_SOLIDS, INITIAL_BLEND_ZONES, INITIAL_GUARDS 
} from './constants';
import { resolveCollisions, checkHit } from './engine/Physics';
import { render } from './engine/Renderer';
import { fetchMissionBriefing } from './services/geminiService';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [briefing, setBriefing] = useState<string>("");
  const keys = useRef<Record<string, boolean>>({});
  const requestRef = useRef<number>(0);

  const resetGame = useCallback(async () => {
    const intel = await fetchMissionBriefing();
    setBriefing(intel);
    
    setGameState({
      t: 0,
      status: GameStatus.BRIEFING,
      player: {
        x: 100, y: 550, w: 20, h: 40,
        vx: 0, vy: 0, onGround: false,
        facing: 0, lastMoveT: 0, eyesClosed: false,
        goggles: STEALTH.MAX_GOGGLES,
        coyoteTime: 0,
        _spacePressed: false,
        _ePressed: false
      },
      guards: INITIAL_GUARDS.map(g => ({ 
        ...g, 
        vx: 0, 
        vy: 0, 
        onGround: false 
      })),
      solids: INITIAL_SOLIDS,
      blendZones: INITIAL_BLEND_ZONES,
      decoys: [],
      exit: { x: 3380, y: 530, w: 60, h: 90 },
      camX: 0,
      seenMeter: 0,
      intel
    });
  }, []);

  useEffect(() => {
    resetGame();
    const handleKeyDown = (e: KeyboardEvent) => keys.current[e.key.toLowerCase()] = true;
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.key.toLowerCase()] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetGame]);

  const update = useCallback((state: GameState, dt: number): GameState => {
    if (state.status !== GameStatus.PLAYING) return state;

    const next = { ...state, t: state.t + dt };
    const p = { ...next.player };
    const decoyActive = next.decoys.some(d => next.t - d.created < STEALTH.DECOY_DURATION);

    // Player Inputs
    let moveDir = (keys.current['d'] ? 1 : 0) - (keys.current['a'] ? 1 : 0);
    if (moveDir !== 0) {
      p.lastMoveT = next.t;
      p.facing = moveDir > 0 ? 0 : Math.PI;
    }

    // Toggle Eyes
    if (keys.current[' '] && !p._spacePressed) {
      if (!decoyActive) p.eyesClosed = !p.eyesClosed;
      p._spacePressed = true;
    } else if (!keys.current[' ']) {
      p._spacePressed = false;
    }

    // Toss Decoy
    if (keys.current['e'] && !p._ePressed && p.goggles > 0) {
      const dx = Math.cos(p.facing) * 160;
      next.decoys.push({ x: p.x + dx, y: p.y - 40, created: next.t });
      p.goggles--;
      p.eyesClosed = true;
      p._ePressed = true;
    } else if (!keys.current['e']) {
      p._ePressed = false;
    }

    // Player Movement Physics
    let speed = decoyActive ? PHYSICS.BOLD_SPEED : (keys.current['shift'] ? PHYSICS.SNEAK_SPEED : PHYSICS.RUN_SPEED);
    p.vx = moveDir * speed;
    p.vy += PHYSICS.GRAVITY;
    if (p.vy > PHYSICS.MAX_FALL_SPEED) p.vy = PHYSICS.MAX_FALL_SPEED;

    // Jump
    if (keys.current['w'] && (p.onGround || p.coyoteTime > 0)) {
      p.vy = PHYSICS.JUMP_FORCE;
      p.onGround = false;
      p.coyoteTime = 0;
    }

    resolveCollisions(p, next.solids, true);
    next.player = p;

    // Camera
    const targetCamX = p.x - GAME_WIDTH * 0.45;
    const maxCamX = WORLD_WIDTH - GAME_WIDTH;
    next.camX = Math.max(0, Math.min(maxCamX, targetCamX));

    // Cleanup timed objects
    next.decoys = next.decoys.filter(d => next.t - d.created < STEALTH.DECOY_DURATION);
    if (next.ping && next.t - next.ping.created > STEALTH.PING_DURATION) next.ping = undefined;

    // Guard Logic
    const activeDecoys = next.decoys;
    let spotted = false;

    next.guards = next.guards.map(g => {
      const gNext = { ...g };
      gNext.vy += PHYSICS.GRAVITY;
      if (gNext.vy > PHYSICS.MAX_FALL_SPEED) gNext.vy = PHYSICS.MAX_FALL_SPEED;

      let target: { x: number, y: number } | null = null;
      if (activeDecoys.length) target = activeDecoys[0];
      else if (next.ping) target = next.ping;

      if (target) {
        const dist = Math.hypot(target.x - (gNext.x + gNext.w/2), target.y - (gNext.y + gNext.h/2));
        const angle = Math.atan2(target.y - (gNext.y + gNext.h/2), target.x - (gNext.x + gNext.w/2));
        gNext.facing = angle;
        
        if (dist > 20) {
          gNext.mode = GuardMode.INVESTIGATE;
          gNext.vx = Math.cos(angle) * GUARD_CONFIG.INVESTIGATE_SPEED;
        } else {
          gNext.mode = GuardMode.SEARCH;
          gNext.vx = 0;
        }
      } else {
        if (gNext.mode === GuardMode.SEARCH) {
          gNext.timer = (gNext.timer || 0) + dt;
          gNext.facing += Math.sin(next.t / 100) * 0.05;
          gNext.vx = 0;
          if (gNext.timer > GUARD_CONFIG.SEARCH_TIME) {
            gNext.mode = GuardMode.PATROL;
            gNext.timer = 0;
          }
        } else {
          gNext.mode = GuardMode.PATROL;
          gNext.vx = gNext.dir * GUARD_CONFIG.PATROL_SPEED;
          
          if (gNext.dir > 0 && gNext.x > gNext.x2) {
            gNext.dir = -1;
            gNext.x = gNext.x2;
          } else if (gNext.dir < 0 && gNext.x < gNext.x1) {
            gNext.dir = 1;
            gNext.x = gNext.x1;
          }
          gNext.facing = gNext.dir > 0 ? 0 : Math.PI;
        }
      }

      gNext.x += gNext.vx;
      let hitWall = false;
      for (const s of next.solids) {
        if (checkHit(gNext, s)) {
          if (gNext.vx > 0) gNext.x = s.x - gNext.w;
          else if (gNext.vx < 0) gNext.x = s.x + s.w;
          gNext.vx = 0;
          hitWall = true;
          break;
        }
      }

      if (hitWall) {
        if (gNext.mode === GuardMode.PATROL) {
          gNext.dir *= -1;
          gNext.facing = gNext.dir > 0 ? 0 : Math.PI;
        } else {
          gNext.mode = GuardMode.SEARCH;
          gNext.timer = 0;
        }
      }

      gNext.y += gNext.vy;
      gNext.onGround = false;
      for (const s of next.solids) {
        if (checkHit(gNext, s)) {
          if (gNext.vy > 0) {
            gNext.y = s.y - gNext.h;
            gNext.vy = 0;
            gNext.onGround = true;
          } else if (gNext.vy < 0) {
            gNext.y = s.y + s.h;
            gNext.vy = 0;
          }
          break;
        }
      }

      const moving = (next.t - p.lastMoveT) < STEALTH.BLEND_IDLE_REQUIRED;
      const inBlend = next.blendZones.some(b => checkHit(p, b));
      const isBlended = inBlend && !moving;

      const dx = p.x + p.w/2 - (gNext.x + gNext.w/2);
      const dy = p.y + p.h/2 - (gNext.y + gNext.h/3);
      const d = Math.hypot(dx, dy);
      const angleToPlayer = Math.atan2(dy, dx);
      let diff = angleToPlayer - gNext.facing;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      const canSeeByLight = d < GUARD_CONFIG.VIEW_DIST && Math.abs(diff) < GUARD_CONFIG.FOV / 2;
      const canSeeEyes = !p.eyesClosed && !isBlended && d < GUARD_CONFIG.EYE_DETECT_DIST;

      if ((canSeeByLight && !isBlended) || canSeeEyes) {
        spotted = true;
        next.ping = { x: p.x + p.w/2, y: p.y + p.h/2, created: next.t };
        gNext.mode = GuardMode.INVESTIGATE;
      }

      return gNext;
    });

    if (spotted) {
      next.seenMeter += dt;
      if (next.seenMeter > STEALTH.ALERT_THRESHOLD) next.status = GameStatus.LOST;
    } else {
      next.seenMeter = Math.max(0, next.seenMeter - dt * 0.4);
    }

    if (checkHit(p, next.exit)) next.status = GameStatus.WON;

    return next;
  }, []);

  const gameLoop = useCallback((time: number) => {
    if (!gameState) return;
    const dt = 16;
    
    setGameState(prev => {
      if (!prev) return null;
      const next = update(prev, dt);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) render(ctx, next);
      return next;
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, update]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  const startGame = () => {
    if (gameState) setGameState({ ...gameState, status: GameStatus.PLAYING });
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-[#010409] text-slate-100 p-4">
      
      {/* HUD Layer */}
      {gameState?.status === GameStatus.PLAYING && (
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-50">
          <div className="flex flex-col gap-2">
            <div className="bg-slate-950/80 border border-slate-700/50 backdrop-blur-md px-4 py-2 rounded-sm font-mono text-sm flex items-center gap-3">
              <span className="text-cyan-400 font-bold tracking-tighter">DECOYS:</span>
              <div className="flex gap-1">
                {[...Array(STEALTH.MAX_GOGGLES)].map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < gameState.player.goggles ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-800'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="w-64 h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-75 ${gameState.seenMeter > STEALTH.ALERT_THRESHOLD * 0.7 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)]' : 'bg-red-900'}`}
                style={{ width: `${(gameState.seenMeter / STEALTH.ALERT_THRESHOLD) * 100}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Detection Index</div>
          </div>
        </div>
      )}

      {/* Briefing Overlay */}
      {gameState?.status === GameStatus.BRIEFING && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="max-w-xl p-8 border-2 border-slate-700 bg-slate-900/90 rounded-sm shadow-2xl relative overflow-hidden crt-glow">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/80" />
            <h2 className="text-3xl font-black text-white mb-6 tracking-tighter uppercase italic flex items-center gap-3">
              <span className="w-2 h-8 bg-cyan-500" /> Mission Briefing
            </h2>
            <div className="font-mono text-slate-400 text-sm leading-relaxed mb-8 border-l-2 border-cyan-900 pl-4 py-2">
              {briefing || "Initializing secure uplink..."}
            </div>
            <button 
              onClick={startGame}
              className="w-full py-4 bg-white hover:bg-cyan-500 text-black font-black rounded-sm transition-all uppercase tracking-[0.25em] text-xs"
            >
              Begin Infiltration
            </button>
          </div>
        </div>
      )}

      {/* Game Canvas with Enhanced CRT Wrappers */}
      <div className="crt-container crt-glow">
        <div className="scanlines"></div>
        <div className="crt-flicker"></div>
        <div className="vignette"></div>
        <div className="noise-overlay"></div>
        
        <canvas 
          ref={canvasRef} 
          width={GAME_WIDTH} 
          height={GAME_HEIGHT}
          className="relative z-0"
        />
      </div>

      <div className="mt-8 flex gap-12 text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em]">
        <div className="flex items-center gap-2">Protocol: <span className="text-emerald-500 animate-pulse">Obsidian</span></div>
        <div className="flex items-center gap-2">Optics: <span className="text-cyan-400">Night-Vision</span></div>
        <div className="flex items-center gap-2">Signal: <span className="text-slate-500">Encrypted</span></div>
      </div>
    </div>
  );
};

export default App;
