
import React from 'react';
import { GameState, RunFlavor, ScoreEntry } from '../types';

interface UIOverlayProps {
  state: GameState;
  score: number;
  destructionCount?: number;
  combo?: number;
  flavor: RunFlavor | null;
  highScores: ScoreEntry[];
  loadingProgress: number;
  onStart: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ state, score, destructionCount = 0, combo = 0, flavor, highScores, loadingProgress, onStart }) => {
  if (state === GameState.START_SCREEN) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50 p-4">
        <div className="border-4 border-cyan-500 p-8 md:p-12 text-center bg-black bg-opacity-90 relative">
          <h1 className="text-6xl md:text-8xl font-black mb-4 glitch-text tracking-tighter italic">TRIGGER HAPPY</h1>
          <p className="text-cyan-400 mb-8 text-xl font-mono tracking-widest animate-pulse">SYSTEM_STATUS: EXPERIMENTAL_v4.5</p>
          
          <button 
            onClick={onStart}
            className="bg-red-600 hover:bg-cyan-500 text-white px-12 py-5 text-3xl font-black uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 border-b-8 border-red-900"
          >
            INITIATE
          </button>

          <div className="mt-12 text-left border-t border-gray-800 pt-8 max-w-md mx-auto">
            <h2 className="text-gray-500 uppercase tracking-widest text-xs mb-4">Historical Efficiency</h2>
            <div className="space-y-1 font-mono text-sm max-h-40 overflow-y-auto">
              {highScores.map((s, i) => (
                <div key={i} className="flex justify-between border-b border-gray-900 pb-1">
                  <span className="text-gray-400">ID_{i+1}: {s.name}</span>
                  <span className="text-cyan-500 font-bold">{s.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === GameState.LOADING) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50">
        <div className="w-80 h-1 bg-gray-900 relative">
          <div 
            className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.8)] transition-all duration-300" 
            style={{ width: `${loadingProgress}%` }} 
          />
          <div className="absolute -top-6 left-0 text-[10px] font-mono text-cyan-400 uppercase tracking-tighter">
            Allocating_Neural_Resources... {loadingProgress}%
          </div>
        </div>
        <p className="mt-8 text-[10px] font-mono text-red-600 animate-pulse tracking-[0.5em]">GENETIC_FLAVOR_INJECTION_ACTIVE</p>
      </div>
    );
  }

  if (state === GameState.PLAYING && flavor) {
    const nextPhase = 10 - (destructionCount % 10);
    return (
      <div className="absolute inset-0 pointer-events-none p-4 md:p-8 font-mono">
        {/* HUD - TOP LEFT */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 p-4 border-l-4 border-cyan-400">
            <div className="text-[10px] text-cyan-500 uppercase font-bold">Subject_Profile</div>
            <div className="text-lg font-black uppercase tracking-tighter">{flavor.characterName}</div>
            <div className="mt-2 text-[10px] text-red-500 uppercase font-bold">Destruction_Count</div>
            <div className="text-2xl font-black text-white">{destructionCount}</div>
        </div>

        {/* HUD - TOP RIGHT */}
        <div className="absolute top-4 right-4 text-right bg-black bg-opacity-70 p-4 border-r-4 border-yellow-500">
            <div className="text-[10px] text-yellow-500 uppercase font-bold">Efficiency_Rating</div>
            <div className="text-4xl font-black">{score.toLocaleString()}</div>
            <div className="mt-1 text-[8px] text-gray-500 uppercase tracking-widest">Next_Phase_In: {nextPhase} Kills</div>
        </div>

        {/* COMBO METER */}
        {combo > 1 && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
            <div className="text-6xl font-black text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">x{combo}</div>
            <div className="text-xl font-black text-cyan-400 uppercase tracking-[0.3em] glitch-text">COMBO</div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end pointer-events-auto">
            <div className="flex gap-4">
                <button 
                    onMouseDown={() => (window as any).triggerHappyMove?.('left')}
                    onMouseUp={() => (window as any).triggerHappyMove?.('stop')}
                    onTouchStart={() => (window as any).triggerHappyMove?.('left')}
                    onTouchEnd={() => (window as any).triggerHappyMove?.('stop')}
                    className="w-20 h-20 bg-black bg-opacity-50 border-2 border-cyan-500 border-opacity-30 flex items-center justify-center text-4xl text-cyan-400 active:bg-cyan-900 transition-all"
                >
                    ←
                </button>
                <button 
                    onMouseDown={() => (window as any).triggerHappyMove?.('right')}
                    onMouseUp={() => (window as any).triggerHappyMove?.('stop')}
                    onTouchStart={() => (window as any).triggerHappyMove?.('right')}
                    onTouchEnd={() => (window as any).triggerHappyMove?.('stop')}
                    className="w-20 h-20 bg-black bg-opacity-50 border-2 border-cyan-500 border-opacity-30 flex items-center justify-center text-4xl text-cyan-400 active:bg-cyan-900 transition-all"
                >
                    →
                </button>
            </div>

            <button 
                onMouseDown={() => (window as any).triggerHappyFire?.()}
                onTouchStart={(e) => { e.preventDefault(); (window as any).triggerHappyFire?.(); }}
                className="w-32 h-32 bg-red-600 bg-opacity-80 border-4 border-red-400 rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(255,0,0,0.6)] hover:scale-110 active:scale-90 transition-all"
            >
                <span className="text-2xl font-black italic tracking-tighter">PULSE</span>
                <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-1">FIRE</span>
            </button>
        </div>

        {/* Dynamic Commentary */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 flex flex-col items-center opacity-80">
            <p className="text-[10px] md:text-xs text-center text-gray-400 italic">
                <span className="text-red-500 font-bold mr-2 uppercase tracking-widest">[AI_MONITOR]:</span> 
                "{flavor.labCommentary}"
            </p>
        </div>
      </div>
    );
  }

  if (state === GameState.GAME_OVER || state === GameState.VICTORY) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-95 z-50 p-6 text-center">
            <h2 className={`text-6xl md:text-8xl font-black mb-4 italic uppercase glitch-text ${state === GameState.VICTORY ? 'text-cyan-400' : 'text-red-600'}`}>
                {state === GameState.VICTORY ? 'PHASE_COMPLETE' : 'PROTOCOL_VOID'}
            </h2>
            <div className="text-xl mb-10 font-mono">Efficiency Rating: <span className="text-yellow-400 font-black">{score.toLocaleString()}</span></div>
            
            <button 
                onClick={onStart}
                className="bg-white text-black px-16 py-6 text-3xl font-black uppercase hover:bg-cyan-400 transition-all hover:scale-105"
            >
                RE-INITIALIZE
            </button>
            
            <p className="mt-8 text-white text-opacity-40 max-w-sm font-mono text-[10px] uppercase tracking-widest">
                Data recorded. Subject performance analyzed. The simulation continues.
            </p>
        </div>
    );
  }

  return null;
};

export default UIOverlay;
