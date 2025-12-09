import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('neon-void-highscore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const handleStartGame = useCallback(() => {
    setScore(0);
    setGameState(GameState.PLAYING);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.GAME_OVER);
    
    setHighScore(prev => {
      if (finalScore > prev) {
        localStorage.setItem('neon-void-highscore', finalScore.toString());
        return finalScore;
      }
      return prev;
    });
  }, []);

  const handleResetGame = useCallback(() => {
    setScore(0);
    setGameState(GameState.PLAYING);
  }, []);

  const handleBackToMenu = useCallback(() => {
    setScore(0);
    setGameState(GameState.MENU);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      <GameCanvas
        gameState={gameState}
        onGameOver={handleGameOver}
        setScore={setScore}
      />
      <UIOverlay
        gameState={gameState}
        score={score}
        highScore={highScore}
        startGame={handleStartGame}
        resetGame={handleResetGame}
        backToMenu={handleBackToMenu}
      />
    </div>
  );
};

export default App;