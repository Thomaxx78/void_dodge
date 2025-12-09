import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { generateGameCommentary } from '../services/geminiService';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  highScore: number;
  startGame: () => void;
  resetGame: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, score, highScore, startGame, resetGame }) => {
  const [commentary, setCommentary] = useState<string>("");
  const [loadingCommentary, setLoadingCommentary] = useState(false);

  useEffect(() => {
    if (gameState === GameState.GAME_OVER) {
      setLoadingCommentary(true);
      // Rough estimate of time survived based on score (since logic was +1 per frame approx 60fps)
      const timeSurvived = score / 60; 
      generateGameCommentary(score, timeSurvived)
        .then(text => setCommentary(text))
        .finally(() => setLoadingCommentary(false));
    } else {
      setCommentary("");
    }
  }, [gameState, score]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">
      {/* Top HUD */}
      <div className="flex justify-between items-start w-full">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-widest uppercase opacity-80 neon-text mb-1">
            Neon Void
          </h1>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">High Score</span>
            <span className="text-xl text-yellow-500 font-mono font-bold neon-text shadow-yellow-500/50">
              {Math.floor(highScore)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Score</p>
          <p className="text-4xl text-white font-mono font-bold neon-text">{Math.floor(score)}</p>
        </div>
      </div>

      {/* Center Content (Menus) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        
        {gameState === GameState.MENU && (
          <div className="text-center bg-black/80 p-12 backdrop-blur-sm border border-white/10 rounded-lg shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            <h2 className="text-6xl text-white font-black tracking-tighter mb-4 neon-text italic">
              DODGE
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Use <span className="text-white font-bold border border-white/20 px-1 rounded">Arrows</span> or <span className="text-white font-bold border border-white/20 px-1 rounded">WASD</span> to move. <br/>
              Avoid the <span className="text-red-500 font-bold neon-red">RED SQUARES</span>.
            </p>
            <button
              onClick={startGame}
              className="group relative px-8 py-3 bg-transparent border-2 border-white text-white font-bold uppercase tracking-widest overflow-hidden hover:bg-white hover:text-black transition-all duration-300"
            >
              <span className="relative z-10">Initialize Sequence</span>
              <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
            </button>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="text-center bg-black/90 p-10 max-w-2xl border-2 border-red-600/50 shadow-[0_0_50px_rgba(255,0,0,0.2)] relative overflow-hidden">
             {/* Decorative lines */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse"></div>

            <h2 className="text-6xl text-red-600 font-black tracking-tighter mb-2 neon-red">
              TERMINATED
            </h2>
            <div className="mb-6 flex justify-center gap-12">
              <div className="text-center">
                <p className="text-gray-400 uppercase tracking-widest text-xs">Score</p>
                <p className="text-4xl text-white font-mono neon-text">{Math.floor(score)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 uppercase tracking-widest text-xs">Best</p>
                <p className="text-4xl text-yellow-500 font-mono neon-text">{Math.floor(highScore)}</p>
              </div>
            </div>

            {/* AI Commentary Section */}
            <div className="mb-8 min-h-[80px] flex items-center justify-center">
              {loadingCommentary ? (
                <p className="text-red-400/60 animate-pulse font-mono text-sm">
                  [ ANALYZING FAILURE PATTERNS... ]
                </p>
              ) : (
                <div className="relative">
                  <span className="absolute -left-4 -top-4 text-4xl text-red-800 opacity-20">"</span>
                  <p className="text-red-100 font-medium italic text-lg leading-relaxed max-w-lg">
                    {commentary}
                  </p>
                  <span className="absolute -right-4 -bottom-4 text-4xl text-red-800 opacity-20">"</span>
                </div>
              )}
            </div>

            <button
              onClick={resetGame}
              className="group relative px-8 py-3 bg-red-600 border border-red-500 text-white font-bold uppercase tracking-widest hover:bg-red-500 transition-all duration-200 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="w-full flex justify-between text-[10px] text-gray-600 uppercase tracking-widest">
         <span>System: React v18 // Engine: Tailwind</span>
         <span>Ai_Mod: Gemini-2.5-Flash</span>
      </div>
    </div>
  );
};

export default UIOverlay;