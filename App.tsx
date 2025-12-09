import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import MultiplayerSetup from './components/MultiplayerSetup';
import MultiplayerLobby from './components/MultiplayerLobby';
import MultiplayerGameCanvas from './components/MultiplayerGameCanvas';
import MultiplayerUIOverlay from './components/MultiplayerUIOverlay';
import { GameState } from './types';
import { MultiplayerRoom, MultiplayerPlayer } from './types/multiplayer';
import { multiplayerService } from './services/multiplayerService';

type AppMode = 'solo' | 'multiplayer-setup' | 'multiplayer-lobby' | 'multiplayer-game';

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('solo');
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);

  // Multiplayer state
  const [multiplayerRoom, setMultiplayerRoom] = useState<MultiplayerRoom | null>(null);
  const [multiplayerPlayers, setMultiplayerPlayers] = useState<MultiplayerPlayer[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('neon-void-highscore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }

    // Connect to multiplayer server
    multiplayerService.connect();

    return () => {
      multiplayerService.disconnect();
    };
  }, []);

  // Solo game handlers
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
    setAppMode('solo');
  }, []);

  // Multiplayer handlers
  const handleMultiplayerClick = useCallback(() => {
    setAppMode('multiplayer-setup');
  }, []);

  const handleRoomCreated = useCallback((room: MultiplayerRoom) => {
    setMultiplayerRoom(room);
    setMultiplayerPlayers(room.players);
    setAppMode('multiplayer-lobby');
  }, []);

  const handleRoomJoined = useCallback((room: MultiplayerRoom) => {
    setMultiplayerRoom(room);
    setMultiplayerPlayers(room.players);
    setAppMode('multiplayer-lobby');
  }, []);

  const handleStartMultiplayerGame = useCallback(() => {
    setGameState(GameState.PLAYING);
    setAppMode('multiplayer-game');
  }, []);

  const handleLeaveRoom = useCallback(() => {
    setMultiplayerRoom(null);
    setMultiplayerPlayers([]);
    setGameState(GameState.MENU);
    setAppMode('solo');
  }, []);

  const handlePlayerDied = useCallback(() => {
    // Player died but game continues for others
    // UI will show death overlay
  }, []);

  const handleBackToSetup = useCallback(() => {
    setAppMode('multiplayer-setup');
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      {/* Solo Mode */}
      {appMode === 'solo' && (
        <>
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
            onMultiplayerClick={handleMultiplayerClick}
          />
        </>
      )}

      {/* Multiplayer Setup */}
      {appMode === 'multiplayer-setup' && (
        <MultiplayerSetup
          onRoomCreated={handleRoomCreated}
          onRoomJoined={handleRoomJoined}
          onBack={handleBackToMenu}
        />
      )}

      {/* Multiplayer Lobby */}
      {appMode === 'multiplayer-lobby' && multiplayerRoom && (
        <MultiplayerLobby
          room={multiplayerRoom}
          onStartGame={handleStartMultiplayerGame}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {/* Multiplayer Game */}
      {appMode === 'multiplayer-game' && multiplayerPlayers.length > 0 && (
        <>
          <MultiplayerGameCanvas
            gameState={gameState}
            players={multiplayerPlayers}
            onPlayerDied={handlePlayerDied}
          />
          <MultiplayerUIOverlay
            gameState={gameState}
            players={multiplayerPlayers}
            onLeaveGame={handleLeaveRoom}
          />
        </>
      )}
    </div>
  );
};

export default App;