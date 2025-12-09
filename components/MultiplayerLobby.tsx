import React, { useEffect, useState } from 'react';
import { multiplayerService } from '../services/multiplayerService';
import { MultiplayerRoom, PlayerJoinedEvent, PlayerLeftEvent, HostChangedEvent, GameMode, GameModeSelectedEvent } from '../types/multiplayer';

interface MultiplayerLobbyProps {
  room: MultiplayerRoom;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ room: initialRoom, onStartGame, onLeaveRoom }) => {
  const [room, setRoom] = useState<MultiplayerRoom>(initialRoom);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const currentPlayer = multiplayerService.getCurrentPlayer();
  const isHost = multiplayerService.isHost();

  useEffect(() => {
    const handlePlayerJoined = (data: PlayerJoinedEvent) => {
      setRoom(data.room);
    };

    const handlePlayerLeft = (data: PlayerLeftEvent) => {
      setRoom(data.room);
    };

    const handleRoomUpdated = (updatedRoom: MultiplayerRoom) => {
      setRoom(updatedRoom);
    };

    const handleHostChanged = (data: HostChangedEvent) => {
      setRoom(data.room);
    };

    const handleGameModeSelected = (data: GameModeSelectedEvent) => {
      setRoom(data.room);
    };

    const handleGameStarted = () => {
      onStartGame();
    };

    const handleError = (err: { message: string }) => {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    };

    multiplayerService.onPlayerJoined(handlePlayerJoined);
    multiplayerService.onPlayerLeft(handlePlayerLeft);
    multiplayerService.onRoomUpdated(handleRoomUpdated);
    multiplayerService.onHostChanged(handleHostChanged);
    multiplayerService.onGameModeSelected(handleGameModeSelected);
    multiplayerService.onGameStarted(handleGameStarted);
    multiplayerService.onError(handleError);

    return () => {
      multiplayerService.offPlayerJoined(handlePlayerJoined);
      multiplayerService.offPlayerLeft(handlePlayerLeft);
      multiplayerService.offRoomUpdated(handleRoomUpdated);
      multiplayerService.offHostChanged(handleHostChanged);
      multiplayerService.offGameModeSelected(handleGameModeSelected);
      multiplayerService.offGameStarted(handleGameStarted);
      multiplayerService.offError(handleError);
    };
  }, [onStartGame]);

  const handleToggleReady = () => {
    if (!isHost) {
      multiplayerService.toggleReady();
    }
  };

  const handleSelectGameMode = (gameMode: GameMode) => {
    if (isHost) {
      multiplayerService.selectGameMode(gameMode);
    }
  };

  const handleStartGame = () => {
    if (isHost) {
      multiplayerService.startGame();
    }
  };

  const handleLeave = () => {
    multiplayerService.leaveRoom();
    onLeaveRoom();
  };

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  const allPlayersReady = room.players.every(p => p.ready);
  const canStart = isHost && allPlayersReady && room.players.length >= 2 && room.gameMode !== null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/95">
      <div className="max-w-2xl sm:max-w-3xl lg:max-w-4xl w-full mx-4 p-4 sm:p-6 md:p-8 border-2 border-cyan-500/50 bg-black/90 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-cyan-400 font-black tracking-tighter text-center neon-text mb-3 sm:mb-4">
            MULTIPLAYER LOBBY
          </h1>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <p className="text-lg sm:text-xl md:text-2xl text-white font-mono">
                Room Code:
              </p>
              <button
                onClick={handleCopyRoomCode}
                className="text-lg sm:text-xl md:text-2xl text-cyan-400 font-bold hover:text-cyan-300 transition-colors px-2 sm:px-3 py-1 border border-cyan-500/50 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20"
                title="Click to copy"
              >
                {room.id}
                {copied && <span className="ml-2 text-green-400 text-xs sm:text-sm">✓ Copied!</span>}
              </button>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-widest">
              {room.players.length} / {room.maxPlayers} Players
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 border border-red-500/50 bg-red-500/10 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Players List */}
        <div className="mb-6 sm:mb-8 space-y-2 sm:space-y-3 max-h-[50vh] overflow-y-auto">
          {room.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 sm:p-4 border border-white/20 bg-white/5"
            >
              {/* Player Color & Name */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-lg flex-shrink-0"
                  style={{
                    backgroundColor: player.color,
                    boxShadow: `0 0 20px ${player.color}`
                  }}
                />
                <div>
                  <p className="text-base sm:text-lg md:text-xl text-white font-bold">
                    {player.name}
                    {player.id === room.hostId && (
                      <span className="ml-2 text-yellow-400 text-xs sm:text-sm">👑 HOST</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {player.id === currentPlayer?.id && '(You)'}
                  </p>
                </div>
              </div>

              {/* Ready Status */}
              <div>
                {player.ready ? (
                  <span className="text-green-400 font-bold text-sm sm:text-base md:text-lg">✓ READY</span>
                ) : (
                  <span className="text-gray-500 font-bold text-sm sm:text-base md:text-lg">NOT READY</span>
                )}
              </div>
            </div>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center justify-center p-3 sm:p-4 border border-white/10 bg-white/5"
            >
              <p className="text-gray-600 font-mono text-xs sm:text-sm">Waiting for player...</p>
            </div>
          ))}
        </div>

        {/* Game Mode Selection */}
        {isHost && !room.gameMode && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 border-2 border-yellow-500/50 bg-yellow-500/10">
            <h2 className="text-xl sm:text-2xl text-yellow-400 font-bold mb-3 sm:mb-4 text-center">SELECT GAME MODE</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Battle Royale Mode */}
              <button
                onClick={() => handleSelectGameMode('battle-royale')}
                className="p-4 sm:p-6 border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300 text-left"
              >
                <h3 className="text-lg sm:text-xl text-purple-400 font-bold mb-2">BATTLE ROYALE</h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3">
                  Chaque joueur a son propre terrain. Les ennemis ciblent votre position. Le dernier survivant gagne!
                </p>
                <div className="flex items-center gap-2 text-purple-400 text-xs">
                  <span>👤</span>
                  <span>Solo arenas</span>
                  <span>•</span>
                  <span>🎯</span>
                  <span>Ennemis ciblés</span>
                </div>
              </button>

              {/* Shared Arena Mode */}
              <button
                onClick={() => handleSelectGameMode('shared-arena')}
                className="p-4 sm:p-6 border-2 border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all duration-300 text-left"
              >
                <h3 className="text-lg sm:text-xl text-cyan-400 font-bold mb-2">SHARED ARENA</h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3">
                  Tous les joueurs partagent le même terrain. Les ennemis apparaissent aléatoirement. Voyez les autres joueurs en temps réel!
                </p>
                <div className="flex items-center gap-2 text-cyan-400 text-xs">
                  <span>👥</span>
                  <span>Terrain partagé</span>
                  <span>•</span>
                  <span>🎲</span>
                  <span>Spawn aléatoire</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Game Mode Selected Display */}
        {room.gameMode && (
          <div className="mb-6 p-4 border border-green-500/50 bg-green-500/10">
            <p className="text-green-400 text-center font-bold">
              Mode sélectionné: {room.gameMode === 'battle-royale' ? '👤 BATTLE ROYALE' : '👥 SHARED ARENA'}
            </p>
            <p className="text-gray-400 text-center text-sm mt-1">
              {room.gameMode === 'battle-royale'
                ? 'Terrains séparés - Ennemis ciblés'
                : 'Terrain partagé - Spawn aléatoire'}
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-8 p-4 border border-cyan-500/30 bg-cyan-500/5">
          <p className="text-cyan-400 text-center text-sm">
            {isHost
              ? !room.gameMode
                ? 'Sélectionnez un mode de jeu pour continuer.'
                : allPlayersReady
                ? 'All players ready! You can start the game.'
                : 'Waiting for all players to be ready...'
              : !room.gameMode
              ? 'Waiting for host to select game mode...'
              : currentPlayer?.ready
              ? 'You are ready! Waiting for host to start...'
              : 'Click READY when you\'re prepared to play!'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Ready/Unready Button (for non-hosts) */}
          {!isHost && (
            <button
              onClick={handleToggleReady}
              className={`flex-1 px-6 py-4 sm:px-8 sm:py-4 font-bold uppercase tracking-widest text-base sm:text-lg border-2 transition-all duration-300 ${
                currentPlayer?.ready
                  ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20'
                  : 'border-green-500 text-green-400 bg-green-500/10 hover:bg-green-500/20'
              }`}
            >
              {currentPlayer?.ready ? 'UNREADY' : 'READY'}
            </button>
          )}

          {/* Start Game Button (for host) */}
          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              className={`flex-1 px-6 py-4 sm:px-8 sm:py-4 font-bold uppercase tracking-widest text-base sm:text-lg border-2 transition-all duration-300 ${
                canStart
                  ? 'border-green-500 text-green-400 bg-green-500/10 hover:bg-green-500/20 cursor-pointer'
                  : 'border-gray-600 text-gray-600 bg-gray-600/10 cursor-not-allowed opacity-50'
              }`}
            >
              START GAME
            </button>
          )}

          {/* Leave Button */}
          <button
            onClick={handleLeave}
            className="px-6 py-4 sm:px-8 sm:py-4 font-bold uppercase tracking-widest text-base sm:text-lg border-2 border-red-500 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all duration-300"
          >
            LEAVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerLobby;
