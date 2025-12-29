
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, RunFlavor, ScoreEntry } from './types';
import { generateRunFlavor } from './services/geminiService';
import GameView from './components/GameView';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [runFlavor, setRunFlavor] = useState<RunFlavor | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [destructionCount, setDestructionCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [highScores, setHighScores] = useState<ScoreEntry[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('trigger_happy_scores');
    if (saved) {
      setHighScores(JSON.parse(saved));
    }
  }, []);

  const startNewRun = useCallback(async () => {
    setGameState(GameState.LOADING);
    setLoadingProgress(10);
    const flavor = await generateRunFlavor();
    setRunFlavor(flavor);
    setLoadingProgress(100);
    setGameState(GameState.PLAYING);
    setCurrentScore(0);
    setDestructionCount(0);
    setCombo(0);
  }, []);

  const onGameOver = useCallback((score: number) => {
    setCurrentScore(score);
    setGameState(GameState.GAME_OVER);
    const newEntry: ScoreEntry = {
      name: runFlavor?.characterName || 'Unknown',
      score: score,
      date: new Date().toLocaleDateString()
    };
    setHighScores(prev => {
      const updated = [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
      localStorage.setItem('trigger_happy_scores', JSON.stringify(updated));
      return updated;
    });
  }, [runFlavor]);

  const onVictory = useCallback((score: number) => {
    setCurrentScore(score);
    setGameState(GameState.VICTORY);
  }, []);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden text-white select-none">
      {gameState === GameState.PLAYING && runFlavor && (
        <GameView 
          flavor={runFlavor} 
          onGameOver={onGameOver} 
          onVictory={onVictory}
          onScoreUpdate={setCurrentScore}
          onDestructionUpdate={setDestructionCount}
          onComboUpdate={setCombo}
        />
      )}
      
      <UIOverlay 
        state={gameState} 
        score={currentScore} 
        destructionCount={destructionCount}
        combo={combo}
        flavor={runFlavor}
        highScores={highScores}
        loadingProgress={loadingProgress}
        onStart={startNewRun}
      />
    </div>
  );
};

export default App;
