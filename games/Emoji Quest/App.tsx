
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GameState, 
  Player, 
  GameItem, 
  Goal, 
  GameMessage,
  ItemType
} from './types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  WORLD_WIDTH, 
  WORLD_HEIGHT, 
  GRAVITY, 
  JUMP_FORCE, 
  MOVE_SPEED, 
  FRICTION, 
  ITEM_TYPES, 
  INITIAL_PLATFORMS 
} from './constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<GameMessage | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  const playerRef = useRef<Player>({
    x: 100,
    y: 400,
    vx: 0,
    vy: 0,
    width: 40,
    height: 60,
    isJumping: false,
    direction: 'right',
    heldItem: null
  });

  const itemsRef = useRef<GameItem[]>([]);
  const goalsRef = useRef<Goal[]>([]);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const cameraX = useRef(0);
  const frameCount = useRef(0);

  // Boiling effect state (slight movement of hand drawn lines)
  const [boil, setBoil] = useState(0);

  const drawRoughLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, seed: number, segments = 5) => {
    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    
    for (let i = 1; i <= segments; i++) {
      const wobble = (Math.sin(seed + i * 1.5) * 1.5);
      const targetX = x1 + dx * i + wobble;
      const targetY = y1 + dy * i + wobble;
      ctx.lineTo(targetX, targetY);
    }
    ctx.stroke();
  };

  const drawRoughRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: number) => {
    drawRoughLine(ctx, x, y, x + w, y, seed);
    drawRoughLine(ctx, x + w, y, x + w, y + h, seed + 1);
    drawRoughLine(ctx, x + w, y + h, x, y + h, seed + 2);
    drawRoughLine(ctx, x, y + h, x, y, seed + 3);
  };

  const drawRoughCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, seed: number) => {
    ctx.beginPath();
    for (let i = 0; i < Math.PI * 2; i += 0.4) {
      const wobble = Math.sin(seed + i * 5) * 1.5;
      const px = x + Math.cos(i) * (r + wobble);
      const py = y + Math.sin(i) * (r + wobble);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  };

  const spawnItemOfType = (id: number, type: ItemType): GameItem => {
    const x = 300 + Math.random() * (WORLD_WIDTH - 600);
    const y = 200 + Math.random() * 250;
    return { id, x, y, type, width: 40, height: 40 };
  };

  const spawnRandomItem = (id: number): GameItem => {
    const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    return spawnItemOfType(id, type);
  };

  const initGame = useCallback(() => {
    playerRef.current = {
      x: 100, y: 400, vx: 0, vy: 0, width: 40, height: 60,
      isJumping: false, direction: 'right', heldItem: null
    };
    cameraX.current = 0;
    setScore(0);
    setMessage(null);
    particlesRef.current = [];

    const initialGoals: Goal[] = [
      { id: 1, x: 700, y: 220, requiredType: ITEM_TYPES[0], completed: false, width: 80, height: 80 },
      { id: 2, x: 1400, y: 270, requiredType: ITEM_TYPES[2], completed: false, width: 80, height: 80 },
      { id: 3, x: 2100, y: 320, requiredType: ITEM_TYPES[4], completed: false, width: 80, height: 80 },
    ];
    goalsRef.current = initialGoals;

    const initialItems: GameItem[] = [];
    initialGoals.forEach((goal, index) => {
      initialItems.push(spawnItemOfType(index, goal.requiredType));
    });

    for (let i = initialItems.length; i < 6; i++) {
      initialItems.push(spawnRandomItem(Date.now() + i));
    }
    itemsRef.current = initialItems;
  }, []);

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0, color, size: Math.random() * 4 + 2
      });
    }
  };

  const showMessage = (text: string, color: string = '#000000') => {
    setMessage({ text, timer: 120, color });
  };

  const handleInteraction = () => {
    if (gameState === GameState.MENU) return;

    const p = playerRef.current;
    const nearbyGoal = goalsRef.current.find(g => 
      !g.completed && 
      Math.abs((p.x + p.width / 2) - (g.x + g.width / 2)) < 90 &&
      Math.abs((p.y + p.height / 2) - (g.y + g.height / 2)) < 90
    );

    if (nearbyGoal) {
      if (p.heldItem) {
        if (p.heldItem.type.id === nearbyGoal.requiredType.id) {
          nearbyGoal.completed = true;
          const pointsGained = p.heldItem.type.points;
          setScore(prev => prev + pointsGained);
          createExplosion(nearbyGoal.x + nearbyGoal.width/2, nearbyGoal.y + nearbyGoal.height/2, nearbyGoal.requiredType.color);
          showMessage(`Found it! +${pointsGained}`, '#166534');
          p.heldItem = null;
          itemsRef.current.push(spawnRandomItem(Date.now()));
          if (goalsRef.current.every(g => g.completed)) setGameState(GameState.WIN);
        } else {
          showMessage(`Wrong item! Needs ${nearbyGoal.requiredType.name}`, '#991b1b');
        }
      } else {
        showMessage(`Needs a ${nearbyGoal.requiredType.name}`, '#854d0e');
      }
      return;
    }

    const nearbyItemIndex = itemsRef.current.findIndex(item => 
      Math.abs((p.x + p.width / 2) - (item.x + item.width / 2)) < 70 &&
      Math.abs((p.y + p.height / 2) - (item.y + item.height / 2)) < 70
    );

    if (nearbyItemIndex !== -1) {
      const item = itemsRef.current[nearbyItemIndex];
      const prevHeld = p.heldItem;
      p.heldItem = item;
      itemsRef.current.splice(nearbyItemIndex, 1);
      if (prevHeld) {
        itemsRef.current.push({ ...prevHeld, x: p.x, y: p.y });
      }
      showMessage(`Got ${item.type.name}`, '#1e40af');
    } else if (p.heldItem) {
      itemsRef.current.push({ ...p.heldItem, x: p.x, y: p.y });
      showMessage(`Dropped ${p.heldItem.type.name}`, '#475569');
      p.heldItem = null;
    }
  };

  const update = () => {
    frameCount.current++;
    if (frameCount.current % 12 === 0) setBoil(b => b + 1);

    if (gameState === GameState.MENU) return;

    const p = playerRef.current;
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) {
      p.vx -= 1.0;
      p.direction = 'left';
    }
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) {
      p.vx += 1.0;
      p.direction = 'right';
    }

    p.vx *= FRICTION;
    if (Math.abs(p.vx) > MOVE_SPEED) p.vx = Math.sign(p.vx) * MOVE_SPEED;

    p.vy += GRAVITY;
    if ((keysPressed.current['Space'] || keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) && !p.isJumping) {
      p.vy = JUMP_FORCE;
      p.isJumping = true;
    }

    p.x += p.vx;
    p.y += p.vy;

    INITIAL_PLATFORMS.forEach(plat => {
      if (
        p.x + p.width > plat.x && 
        p.x < plat.x + plat.width && 
        p.y + p.height >= plat.y && 
        p.y + p.height <= plat.y + p.vy + 10 && 
        p.vy >= 0
      ) {
        p.y = plat.y - p.height;
        p.vy = 0;
        p.isJumping = false;
      }
    });

    if (p.x < 0) p.x = 0;
    if (p.x + p.width > WORLD_WIDTH) p.x = WORLD_WIDTH - p.width;
    if (p.y > WORLD_HEIGHT) {
      p.y = 100; p.x = 100; p.vy = 0;
      showMessage('Oops! Respawning...', '#991b1b');
    }

    const targetCameraX = p.x - CANVAS_WIDTH / 2 + p.width / 2;
    cameraX.current = Math.max(0, Math.min(targetCameraX, WORLD_WIDTH - CANVAS_WIDTH));

    if (message) {
      message.timer--;
      if (message.timer <= 0) setMessage(null);
    }

    particlesRef.current.forEach(part => {
      part.x += part.vx;
      part.y += part.vy;
      part.vy += 0.22;
      part.life -= 0.02;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
  };

  const drawMenu = (ctx: CanvasRenderingContext2D) => {
    // Static seed for completely fixed menu
    const b = 101; 
    const center = CANVAS_WIDTH / 2;

    // Background: Clean parchment
    ctx.fillStyle = '#fdf6e3';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // The Title Square
    const squareSize = 340;
    const sqX = center - squareSize / 2;
    const sqY = 80;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    
    // Draw outer sketchy square
    drawRoughRect(ctx, sqX, sqY, squareSize, squareSize, b);
    
    // Sub-rect for detail
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    drawRoughRect(ctx, sqX + 10, sqY + 10, squareSize - 20, squareSize - 20, b + 10);

    // Stacked Title Text to fit the square
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    
    // "EMOJI"
    ctx.font = 'bold 90px "Architects Daughter"';
    ctx.fillText('EMOJI', center, sqY + 130);
    
    // "QUEST"
    ctx.font = 'bold 90px "Architects Daughter"';
    ctx.fillText('QUEST', center, sqY + 260);

    // Subtle crosshatching in the square corners
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    for(let i=0; i<40; i+=8) {
        drawRoughLine(ctx, sqX + i, sqY, sqX, sqY + i, b + i);
        drawRoughLine(ctx, sqX + squareSize - i, sqY + squareSize, sqX + squareSize, sqY + squareSize - i, b + i);
    }

    // Secondary tagline
    ctx.font = '22px "Architects Daughter"';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText('~ The Sketchbook Adventure ~', center, sqY + 310);

    // Sketchy character at the bottom
    ctx.save();
    ctx.translate( center, 520);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    drawRoughRect(ctx, -20, -50, 40, 50, b + 50);
    ctx.beginPath();
    ctx.arc(-8, -35, 2, 0, Math.PI * 2);
    ctx.arc(8, -35, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (gameState === GameState.MENU) {
      drawMenu(ctx);
      return;
    }

    const camX = cameraX.current;
    const time = frameCount.current;
    const b = boil;

    ctx.fillStyle = '#fdf6e3'; 
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.strokeStyle = 'rgba(0,0,0,0.03)';
    ctx.lineWidth = 1;
    for(let i=0; i<CANVAS_WIDTH; i+=40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_HEIGHT); ctx.stroke();
    }
    for(let j=0; j<CANVAS_HEIGHT; j+=40) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(CANVAS_WIDTH, j); ctx.stroke();
    }

    ctx.save();
    ctx.translate(-camX, 0);

    INITIAL_PLATFORMS.forEach((plat, idx) => {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#444';
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(plat.x + 4, plat.y + 4, plat.width, plat.height);
      ctx.fillStyle = plat.color;
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      drawRoughRect(ctx, plat.x, plat.y, plat.width, plat.height, b + idx * 10);
      if (plat.color === '#8b5a2b') {
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        for(let x=plat.x + 10; x < plat.x + plat.width; x+=30) {
          drawRoughLine(ctx, x, plat.y + 10, x + 10, plat.y + plat.height - 5, b);
        }
      }
    });

    goalsRef.current.forEach((g, idx) => {
      const wobble = Math.sin(time * 0.05) * 5;
      if (!g.completed) {
        ctx.save();
        ctx.translate(g.x + g.width/2, g.y + g.height/2 + wobble);
        ctx.strokeStyle = g.requiredType.color;
        ctx.lineWidth = 3;
        drawRoughRect(ctx, -g.width/2, -g.height/2, g.width, g.height, b + idx * 5);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(-g.width/2 + 5, -g.height/2 + 5, g.width - 10, g.height - 10);
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(g.requiredType.emoji, 0, 15);
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(g.x + g.width/2, g.y + g.height/2);
        ctx.fillStyle = 'rgba(16,185,129,0.2)';
        ctx.beginPath();
        ctx.arc(0,0,40,0,Math.PI*2);
        ctx.fill();
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✔️', 0, 12);
        ctx.restore();
      }
    });

    itemsRef.current.forEach(item => {
      const float = Math.sin(time * 0.1 + item.id) * 8;
      ctx.save();
      ctx.translate(item.x + item.width/2, item.y + item.height/2 + float);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.fillStyle = item.type.color;
      ctx.beginPath();
      drawRoughCircle(ctx, 0, 0, item.width/2, b + item.id);
      ctx.fill();
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.type.emoji, 0, 8);
      ctx.restore();
    });

    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    const p = playerRef.current;
    ctx.save();
    ctx.translate(p.x + p.width/2, p.y + p.height);
    const scaleY = p.isJumping ? 1.1 : (1 + Math.abs(p.vx) * 0.01);
    const scaleX = p.isJumping ? 0.9 : (1 - Math.abs(p.vx) * 0.01);
    ctx.scale(scaleX, scaleY);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#ff8080';
    drawRoughRect(ctx, -p.width/2, -p.height, p.width, p.height, b);
    ctx.fillRect(-p.width/2 + 2, -p.height + 2, p.width - 4, p.height - 4);
    const eyeX = p.direction === 'right' ? 8 : -8;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(eyeX - 5, -45, 5, 0, Math.PI * 2);
    ctx.arc(eyeX + 5, -45, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(eyeX - 5, -45, 2, 0, Math.PI * 2);
    ctx.arc(eyeX + 5, -45, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(eyeX - 5, -35);
    ctx.lineTo(eyeX + 5, -35);
    ctx.stroke();
    if (p.heldItem) {
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.heldItem.type.emoji, 0, -p.height - 20);
    }
    ctx.restore();
    ctx.restore();
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      update();
      draw(ctx);
    }
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, boil]);

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
        keysPressed.current[e.code] = true;
        if (e.code === 'KeyE') handleInteraction();
    };
    const handleUp = (e: KeyboardEvent) => keysPressed.current[e.code] = false;
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameLoop, gameState]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const startGame = () => {
    initGame();
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-4 font-handdrawn select-none">
      <div className="relative overflow-hidden rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-[16px] border-[#333] bg-[#fdf6e3]">
        
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT} 
          className="block" 
        />

        {gameState === GameState.MENU && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12">
            <button 
              onClick={startGame}
              className="bg-black text-white px-12 py-5 rounded-md text-3xl font-black shadow-[6px_6px_0_rgba(255,128,128,1)] hover:scale-105 active:scale-95 transition-all mb-4"
            >
              START SKETCHING
            </button>
            <div className="text-black/30 text-sm font-bold tracking-widest uppercase">
              Click Button to Begin
            </div>
          </div>
        )}

        {gameState === GameState.PLAYING && (
          <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none flex justify-between items-start z-10">
            <div className="bg-[#fdf6e3] border-2 border-black/20 p-4 rounded-lg shadow-md rotate-[-2deg]">
              <div className="text-xs uppercase font-bold text-black/50 mb-1">Crystals Found</div>
              <div className="text-3xl font-black text-black">{score}</div>
            </div>
            
            {playerRef.current.heldItem && (
              <div className="bg-[#fdf6e3] border-2 border-black/20 p-4 rounded-lg shadow-md rotate-[3deg] flex items-center gap-3">
                <div className="text-4xl">{playerRef.current.heldItem.type.emoji}</div>
                <div>
                  <div className="text-xs uppercase font-bold text-black/50">Inventory</div>
                  <div className="text-xl font-bold">{playerRef.current.heldItem.type.name}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {message && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-30">
            <div 
              className="px-8 py-3 rounded-md shadow-lg text-2xl font-bold border-2 bg-[#fdf6e3] animate-bounce"
              style={{ borderColor: message.color, color: message.color }}
            >
              {message.text}
            </div>
          </div>
        )}

        {gameState === GameState.WIN && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-12">
            <div className="bg-[#fdf6e3] border-4 border-black/80 rounded-lg shadow-2xl p-12 flex flex-col items-center max-w-md w-full text-center rotate-[1deg]">
              <div className="text-8xl mb-6">🎉</div>
              <h1 className="text-5xl font-black mb-4 italic tracking-tightest leading-tight">PAGE COMPLETED!</h1>
              <p className="text-black/60 font-bold mb-8">The sketchbook story continues...</p>
              
              <div className="w-full bg-black/5 rounded-lg p-6 mb-10 border-2 border-black/10">
                <div className="text-xs uppercase tracking-widest font-black text-black/40 mb-2">Total Inspiration</div>
                <div className="text-7xl font-black text-black">{score}</div>
              </div>

              <button 
                onClick={startGame}
                className="bg-black text-white font-black px-12 py-4 rounded-md text-xl hover:scale-110 active:scale-95 transition-all shadow-[6px_6px_0_#444]"
              >
                NEW SKETCH
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-6 items-center text-white/20 font-bold uppercase text-xs tracking-widest">
        <span>WASD: Move</span>
        <span>|</span>
        <span>E: Interact</span>
        <span>|</span>
        <span>Space: Jump</span>
      </div>
    </div>
  );
};

export default App;
