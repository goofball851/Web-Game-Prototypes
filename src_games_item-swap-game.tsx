import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Package } from 'lucide-react';

type Item = {
  x: number;
  y: number;
  w: number;
  h: number;
  type: string;
  color: string;
  icon: string;
  points: number;
};

const ItemSwapGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'win'>('menu');
  const [heldItem, setHeldItem] = useState<Item | null>(null);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');

  const gameRef = useRef<any>({
    player: {
      x: 100,
      y: 400,
      vx: 0,
      vy: 0,
      w: 35,
      h: 45,
      grounded: false,
      facingRight: true,
    },
    camera: { x: 0 },
    items: [] as Item[],
    platforms: [] as any[],
    goals: [] as any[],
    keys: {} as Record<string, boolean>,
    itemTypes: [
      { name: 'key', color: '#ffd700', icon: '🔑', points: 10 },
      { name: 'sword', color: '#c0c0c0', icon: '⚔️', points: 15 },
      { name: 'shield', color: '#4169e1', icon: '🛡️', points: 12 },
      { name: 'potion', color: '#ff1493', icon: '🧪', points: 20 },
      { name: 'gem', color: '#00ff00', icon: '💎', points: 25 },
      { name: 'scroll', color: '#daa520', icon: '📜', points: 18 },
    ],
    messageTimer: 0,
    levelWidth: 3000,
  });

  const spawnRandomItem = useCallback((x: number, y: number): Item => {
    const g = gameRef.current;
    const itemType = g.itemTypes[Math.floor(Math.random() * g.itemTypes.length)];
    return {
      x,
      y,
      w: 30,
      h: 30,
      type: itemType.name,
      color: itemType.color,
      icon: itemType.icon,
      points: itemType.points,
    };
  }, []);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.player = {
      x: 100,
      y: 400,
      vx: 0,
      vy: 0,
      w: 35,
      h: 45,
      grounded: false,
      facingRight: true,
    };

    g.camera = { x: 0 };

    // Ground platforms spanning the entire level
    g.platforms = [{ x: 0, y: 500, w: 3000, h: 100 }];

    // Generate platforms across the long level
    for (let i = 0; i < 20; i++) {
      g.platforms.push({
        x: 150 + i * 140,
        y: 400 - Math.random() * 100,
        w: 100 + Math.random() * 60,
        h: 20,
      });
    }

    // Scatter items across the level
    g.items = [];
    for (let i = 0; i < 30; i++) {
      g.items.push(
        spawnRandomItem(200 + Math.random() * 2600, 200 + Math.random() * 150)
      );
    }

    // Place goals at various points across the level
    g.goals = [
      { x: 500, y: 420, w: 60, h: 60, requiredItem: 'key', active: true },
      { x: 1000, y: 420, w: 60, h: 60, requiredItem: 'sword', active: true },
      { x: 1500, y: 420, w: 60, h: 60, requiredItem: 'gem', active: true },
      { x: 2000, y: 420, w: 60, h: 60, requiredItem: 'potion', active: true },
      { x: 2700, y: 420, w: 60, h: 60, requiredItem: 'scroll', active: true },
    ];

    setGameState('playing');
    setHeldItem(null);
    setScore(0);
    setMessage('');
    g.messageTimer = 0;
  }, [spawnRandomItem]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const g = gameRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      g.keys[e.key.toLowerCase()] = true;

      if (e.key === ' ' && g.player.grounded) {
        g.player.vy = -14;
        g.player.grounded = false;
      }

      if (e.key.toLowerCase() === 'e') {
        const p = g.player;

        for (let i = g.items.length - 1; i >= 0; i--) {
          const item: Item = g.items[i];
          if (Math.abs(p.x - item.x) < 50 && Math.abs(p.y - item.y) < 50) {
            if (heldItem) {
              const droppedItem = { ...heldItem, x: p.x, y: p.y - 40 };
              g.items.push(droppedItem);
              setMessage(`Dropped ${heldItem.type} and picked up ${item.type}!`);
            } else {
              setMessage(`Picked up ${item.type}!`);
            }

            setHeldItem(item);
            g.items.splice(i, 1);
            g.messageTimer = 120;
            break;
          }
        }

        for (let i = g.goals.length - 1; i >= 0; i--) {
          const goal = g.goals[i];
          if (
            goal.active &&
            heldItem &&
            Math.abs(p.x - goal.x) < 60 &&
            Math.abs(p.y - goal.y) < 60
          ) {
            if (heldItem.type === goal.requiredItem) {
              setScore((s) => s + heldItem.points + 50);
              setMessage(
                `Delivered ${heldItem.type}! +${heldItem.points + 50} points!`
              );
              g.goals[i].active = false;
              setHeldItem(null);
              g.messageTimer = 120;

              const newItem = spawnRandomItem(
                Math.random() * 600 + 100,
                Math.random() * 200 + 150
              );
              g.items.push(newItem);

              if (g.goals.every((gGoal: any) => !gGoal.active)) {
                setMessage('ALL GOALS COMPLETE! You Win!');
                g.messageTimer = 300;
                setTimeout(() => setGameState('win'), 2000);
              }
            } else {
              setMessage(`Wrong item! Need ${goal.requiredItem}!`);
              g.messageTimer = 120;
            }
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      g.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationId = 0;
    const gameLoop = () => {
      const p = g.player;

      if (g.keys['a']) {
        p.vx = -5;
        p.facingRight = false;
      } else if (g.keys['d']) {
        p.vx = 5;
        p.facingRight = true;
      } else {
        p.vx = 0;
      }

      p.vy += 0.7;
      p.x += p.vx;
      p.y += p.vy;

      p.grounded = false;

      for (const plat of g.platforms) {
        if (
          p.x + p.w > plat.x &&
          p.x < plat.x + plat.w &&
          p.y + p.h > plat.y &&
          p.y + p.h < plat.y + 20 &&
          p.vy > 0
        ) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.grounded = true;
        }
      }

      if (p.x < 0) p.x = 0;
      if (p.x + p.w > g.levelWidth) p.x = g.levelWidth - p.w;
      if (p.y > 600) {
        p.y = 100;
        p.vy = 0;
      }

      // Update camera to follow player
      g.camera.x = p.x - 400;
      if (g.camera.x < 0) g.camera.x = 0;
      if (g.camera.x > g.levelWidth - 800) g.camera.x = g.levelWidth - 800;

      if (g.messageTimer > 0) g.messageTimer--;

      // Clear background
      ctx.fillStyle = '#87ceeb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground paint
      ctx.fillStyle = '#90ee90';
      ctx.fillRect(0, 500, canvas.width, 100);

      // Apply camera transform
      ctx.save();
      ctx.translate(-g.camera.x, 0);

      // Platforms
      ctx.fillStyle = '#8b4513';
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      for (const plat of g.platforms) {
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
      }

      // Goals
      for (const goal of g.goals) {
        if (goal.active) {
          ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
          ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 3;
          ctx.strokeRect(goal.x, goal.y, goal.w, goal.h);

          ctx.fillStyle = '#000';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            `Need: ${goal.requiredItem}`,
            goal.x + goal.w / 2,
            goal.y + goal.h / 2
          );
        } else {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
          ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
          ctx.strokeRect(goal.x, goal.y, goal.w, goal.h);
          ctx.fillStyle = '#000';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('✓', goal.x + goal.w / 2, goal.y + goal.h / 2 + 8);
        }
      }

      // Items
      for (const item of g.items) {
        const pulse = Math.sin(Date.now() / 200) * 3;
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x - 15 + pulse, item.y - 15 + pulse, item.w, item.h);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(item.x - 15 + pulse, item.y - 15 + pulse, item.w, item.h);

        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.icon, item.x, item.y + 5);
      }

      // Player
      ctx.fillStyle = '#4169e1';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = '#fff';
      if (p.facingRight) {
        ctx.fillRect(p.x + 20, p.y + 12, 8, 8);
      } else {
        ctx.fillRect(p.x + 7, p.y + 12, 8, 8);
      }
      ctx.fillStyle = '#000';
      ctx.fillRect(p.x + p.w / 2 - 4, p.y + 25, 8, 3);

      // Held item above player
      if (heldItem) {
        const itemX = p.x + p.w / 2 - 12;
        const itemY = p.y - 35;
        ctx.fillStyle = heldItem.color;
        ctx.fillRect(itemX, itemY, 24, 24);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(itemX, itemY, 24, 24);
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(heldItem.icon, itemX + 12, itemY + 17);
      }

      let nearItem = false;
      let nearGoal = false;

      for (const item of g.items) {
        if (Math.abs(p.x - item.x) < 50 && Math.abs(p.y - item.y) < 50) {
          nearItem = true;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(item.x - 20, item.y - 50, 80, 25);
          ctx.fillStyle = '#000';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Press E to pickup', item.x + 20, item.y - 33);
          break;
        }
      }

      for (const goal of g.goals) {
        if (
          goal.active &&
          Math.abs(p.x - goal.x) < 60 &&
          Math.abs(p.y - goal.y) < 60
        ) {
          nearGoal = true;
          if (heldItem) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(goal.x + 10, goal.y - 30, 100, 25);
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Press E to deliver', goal.x + 60, goal.y - 13);
          }
          break;
        }
      }

      // End camera transform
      ctx.restore();

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, heldItem, spawnRandomItem]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-blue-900 p-4">
      {gameState === 'menu' && (
        <div className="text-center text-white bg-gray-800 p-12 rounded-lg border-4 border-yellow-400">
          <h1 className="text-5xl font-bold mb-6">Item Swap Adventure</h1>
          <p className="text-xl mb-8">Collect and deliver items to complete goals!</p>
          <button
            onClick={startGame}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-12 rounded-lg text-2xl"
          >
            Start Game
          </button>
          <div className="mt-8 text-left max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-bold mb-4">CONTROLS:</h2>
            <p>A/D - Move left/right</p>
            <p>SPACE - Jump</p>
            <p>E - Pick up / Drop item / Deliver</p>
            <p className="mt-4 text-yellow-400">You can only hold ONE item at a time!</p>
            <p className="text-yellow-400">Picking up a new item drops your current one.</p>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex flex-col items-center">
          <div className="bg-gray-800 p-4 rounded-lg mb-4 flex gap-8 text-white border-4 border-yellow-400">
            <div className="flex items-center gap-2">
              <Package className="text-yellow-400" />
              <span className="text-xl font-bold">Score: {score}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                Holding: {heldItem ? `${heldItem.icon} ${heldItem.type}` : 'Nothing'}
              </span>
            </div>
          </div>
          {message && gameRef.current.messageTimer > 0 && (
            <div className="bg-yellow-400 text-black px-6 py-3 rounded-lg mb-4 font-bold text-lg">
              {message}
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-4 border-yellow-400 rounded-lg shadow-2xl"
          />
        </div>
      )}

      {gameState === 'win' && (
        <div className="text-center text-white bg-gray-800 p-12 rounded-lg border-4 border-green-400">
          <h1 className="text-6xl font-bold mb-6 text-green-400">Victory!</h1>
          <p className="text-2xl mb-4">Final Score: {score}</p>
          <button
            onClick={startGame}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-4 px-12 rounded-lg text-2xl"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemSwapGame;