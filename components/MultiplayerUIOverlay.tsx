import React, { useEffect, useState } from 'react';
import { GameState } from '../types';
import { MultiplayerPlayer, GameFinishedEvent } from '../types/multiplayer';
import { multiplayerService } from '../services/multiplayerService';

interface MultiplayerUIOverlayProps {
  gameState: GameState;
  players: MultiplayerPlayer[];
  onLeaveGame: () => void;
}

const MultiplayerUIOverlay: React.FC<MultiplayerUIOverlayProps> = ({
  gameState,
  players,
  onLeaveGame
}) => {
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const currentPlayer = multiplayerService.getCurrentPlayer();
  const myPlayer = players.find(p => p.id === currentPlayer?.id);
  const isAlive = myPlayer?.alive ?? false;

  useEffect(() => {
    const handleGameFinished = (data: GameFinishedEvent) => {
      setWinner(data.winner);
      setWinnerId(data.winnerId);
    };

    multiplayerService.onGameFinished(handleGameFinished);

    return () => {
      multiplayerService.offGameFinished(handleGameFinished);
    };
  }, []);

  const handleLeave = () => {
    multiplayerService.leaveRoom();
    onLeaveGame();
  };

  const handlePlayAgain = () => {
    if (multiplayerService.isHost()) {
      multiplayerService.restartGame();
    }
  };

  const aliveCount = players.filter(p => p.alive).length;
  const isHost = multiplayerService.isHost();

  return (
    <>
      {/* Top HUD */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 md:p-6 flex justify-between items-start pointer-events-none z-10">
          {/* Players List */}
          <div className="bg-black/80 border border-white/20 p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <p className="text-white font-bold mb-2 uppercase tracking-wider">Players</p>
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: player.color }}
                />
                <span className={`font-mono ${player.alive ? 'text-white' : 'text-gray-600 line-through'}`}>
                  {player.name}
                  {player.id === currentPlayer?.id && ' (You)'}
                </span>
              </div>
            ))}
          </div>

          {/* Alive Counter */}
          <div className="bg-black/80 border border-cyan-400 p-2 sm:p-3 md:p-4">
            <p className="text-cyan-400 font-mono font-bold text-xl sm:text-2xl text-center">
              {aliveCount} / {players.length}
            </p>
            <p className="text-gray-400 text-xs uppercase tracking-wider text-center">
              Alive
            </p>
          </div>
        </div>
      )}

      {/* Death Overlay (for dead players) */}
      {gameState === GameState.PLAYING && !isAlive && !winner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto z-20">
          <div className="text-center px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-red-400 font-black mb-3 sm:mb-4 neon-text-red">
              YOU DIED
            </h1>
            <p className="text-white text-lg sm:text-xl mb-6 sm:mb-8">
              Waiting for game to finish...
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              {aliveCount} player{aliveCount !== 1 ? 's' : ''} still alive
            </p>
          </div>
        </div>
      )}

      {/* Winner Overlay */}
      {winner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm pointer-events-auto z-20">
          <div className="max-w-sm sm:max-w-md md:max-w-2xl w-full mx-4 p-6 sm:p-8 border-2 border-yellow-500/50 bg-black/90 shadow-[0_0_50px_rgba(234,179,8,0.3)] text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-yellow-400 font-black mb-4 sm:mb-6 neon-text-yellow">
              {winnerId === currentPlayer?.id ? 'VICTORY!' : 'GAME OVER'}
            </h1>

            <div className="mb-6 sm:mb-8">
              <p className="text-white text-xl sm:text-2xl mb-2">Winner:</p>
              <p className="text-yellow-400 text-3xl sm:text-4xl font-bold">{winner}</p>
            </div>

            {winnerId === currentPlayer?.id && (
              <p className="text-green-400 text-lg sm:text-xl mb-6 sm:mb-8">
                🎉 You are the last survivor! 🎉
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {isHost ? (
                <>
                  <button
                    onClick={handlePlayAgain}
                    className="flex-1 px-6 py-4 sm:px-8 sm:py-4 text-base sm:text-lg font-bold uppercase tracking-widest border-2 border-green-500 text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-all duration-300"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={handleLeave}
                    className="flex-1 px-6 py-4 sm:px-8 sm:py-4 text-base sm:text-lg font-bold uppercase tracking-widest border-2 border-red-500 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all duration-300"
                  >
                    Leave Room
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 px-6 py-4 sm:px-8 sm:py-4 text-center border-2 border-gray-600 text-gray-400 bg-gray-600/10">
                    <p className="text-xs sm:text-sm mb-1">Waiting for host...</p>
                    <p className="text-xs text-gray-500">Host can restart the game</p>
                  </div>
                  <button
                    onClick={handleLeave}
                    className="flex-1 px-6 py-4 sm:px-8 sm:py-4 text-base sm:text-lg font-bold uppercase tracking-widest border-2 border-red-500 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all duration-300"
                  >
                    Leave Room
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leave button (during gameplay) */}
      {gameState === GameState.PLAYING && isAlive && !winner && (
        <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 pointer-events-auto z-10">
          <button
            onClick={handleLeave}
            className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold uppercase tracking-wider border border-red-500/50 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all duration-300"
          >
            Leave Game
          </button>
        </div>
      )}

      <style>{`
        .neon-text-red {
          text-shadow: 0 0 10px rgba(248, 113, 113, 0.8),
                       0 0 20px rgba(248, 113, 113, 0.6),
                       0 0 30px rgba(248, 113, 113, 0.4);
        }

        .neon-text-yellow {
          text-shadow: 0 0 10px rgba(234, 179, 8, 0.8),
                       0 0 20px rgba(234, 179, 8, 0.6),
                       0 0 30px rgba(234, 179, 8, 0.4);
        }
      `}</style>
    </>
  );
};

export default MultiplayerUIOverlay;
