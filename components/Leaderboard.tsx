import React, { useEffect, useState } from 'react';
import { getLeaderboard, LeaderboardEntry } from '../services/leaderboardService';

interface LeaderboardProps {
  onClose: () => void;
  currentScore?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose, currentScore }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await getLeaderboard();
    setEntries(data);
    setLoading(false);
  };

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-black/95 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="mb-6 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
          <h2 className="text-5xl text-cyan-400 font-black tracking-tighter mb-2 text-center neon-text">
            GLOBAL LEADERBOARD
          </h2>
          <p className="text-gray-400 text-center text-sm uppercase tracking-widest">
            Top 10 Champions
          </p>
        </div>

        {/* Leaderboard Content */}
        <div className="flex-1 overflow-y-auto mb-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-cyan-400/60 animate-pulse font-mono">
                [ LOADING RANKINGS... ]
              </p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-mono">
                No scores yet. Be the first!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => {
                const isCurrentScore = currentScore && entry.score === currentScore &&
                  Math.abs(entry.timestamp - Date.now()) < 5000;

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 border transition-all ${
                      isCurrentScore
                        ? 'border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-16 text-center">
                      <span className={`font-bold text-xl ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-300' :
                        index === 2 ? 'text-orange-400' :
                        'text-gray-500'
                      }`}>
                        {getRankMedal(index + 1)}
                      </span>
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${
                        isCurrentScore ? 'text-yellow-300' : 'text-white'
                      }`}>
                        {entry.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className={`text-2xl font-mono font-bold ${
                        isCurrentScore ? 'text-yellow-400 neon-text' : 'text-cyan-400'
                      }`}>
                        {entry.score.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">
                        points
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with close button */}
        <div className="relative">
          <div className="absolute bottom-full left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse mb-4"></div>
          <button
            onClick={onClose}
            className="w-full group relative px-8 py-3 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest overflow-hidden hover:bg-cyan-400 hover:text-black transition-all duration-300"
          >
            <span className="relative z-10">Close</span>
            <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
