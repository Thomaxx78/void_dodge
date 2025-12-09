import React, { useState } from 'react';
import { multiplayerService } from '../services/multiplayerService';
import { MultiplayerRoom } from '../types/multiplayer';

interface MultiplayerSetupProps {
  onRoomCreated: (room: MultiplayerRoom) => void;
  onRoomJoined: (room: MultiplayerRoom) => void;
  onBack: () => void;
}

const MultiplayerSetup: React.FC<MultiplayerSetupProps> = ({ onRoomCreated, onRoomJoined, onBack }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const result = await multiplayerService.createRoom(playerName.trim());
      onRoomCreated(result.room);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter room code');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const result = await multiplayerService.joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
      onRoomJoined(result.room);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
      setIsJoining(false);
    }
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateRoom();
    }
  };

  const handleCodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/95">
      <div className="max-w-md sm:max-w-lg md:max-w-2xl w-full mx-4 p-6 sm:p-8 border-2 border-cyan-500/50 bg-black/90 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl text-cyan-400 font-black tracking-tighter text-center neon-text mb-4">
            MULTIPLAYER
          </h1>
          <p className="text-gray-400 text-center text-sm uppercase tracking-widest">
            Create or Join a Room
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 border border-red-500/50 bg-red-500/10 text-red-400 text-center text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Player Name Input */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-cyan-400 font-bold mb-2 uppercase tracking-wider text-sm">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={handleNameKeyPress}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full px-4 py-4 sm:py-3 bg-black border-2 border-white/20 text-white font-mono text-base sm:text-lg focus:border-cyan-400 focus:outline-none transition-colors"
            disabled={isCreating || isJoining}
          />
        </div>

        {/* Create Room Section */}
        <div className="mb-6 p-4 sm:p-6 border border-cyan-500/30 bg-cyan-500/5">
          <h2 className="text-xl sm:text-2xl text-white font-bold mb-3">Create New Room</h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-4">
            Host a new game and invite up to 4 other players to join.
          </p>
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || isJoining || !playerName.trim()}
            className="w-full px-6 py-4 sm:px-8 sm:py-3 text-base sm:text-lg font-bold uppercase tracking-widest border-2 border-cyan-400 text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'CREATING...' : 'CREATE ROOM'}
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-black text-gray-500 text-sm uppercase tracking-widest">
              or
            </span>
          </div>
        </div>

        {/* Join Room Section */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 border border-purple-500/30 bg-purple-500/5">
          <h2 className="text-xl sm:text-2xl text-white font-bold mb-3">Join Existing Room</h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-4">
            Enter the room code shared by your host to join the game.
          </p>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyPress={handleCodeKeyPress}
            placeholder="ROOM CODE"
            maxLength={6}
            className="w-full px-4 py-4 sm:py-3 bg-black border-2 border-white/20 text-white font-mono text-base sm:text-lg text-center tracking-widest mb-4 focus:border-purple-400 focus:outline-none transition-colors uppercase"
            disabled={isCreating || isJoining}
          />
          <button
            onClick={handleJoinRoom}
            disabled={isCreating || isJoining || !playerName.trim() || !roomCode.trim()}
            className="w-full px-6 py-4 sm:px-8 sm:py-3 text-base sm:text-lg font-bold uppercase tracking-widest border-2 border-purple-400 text-purple-400 bg-purple-400/10 hover:bg-purple-400/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'JOINING...' : 'JOIN ROOM'}
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          disabled={isCreating || isJoining}
          className="w-full px-6 py-4 sm:px-8 sm:py-3 text-base sm:text-lg font-bold uppercase tracking-widest border-2 border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default MultiplayerSetup;
