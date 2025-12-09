import type { VercelRequest, VercelResponse } from '@vercel/node';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  timestamp: number;
}

// In-memory storage (will reset on each deployment)
// For persistent storage, use Vercel KV, PostgreSQL, or another database
let leaderboard: LeaderboardEntry[] = [];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Fetch leaderboard
  if (req.method === 'GET') {
    try {
      const topScores = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      return res.status(200).json(topScores);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }

  // POST - Submit score
  if (req.method === 'POST') {
    try {
      const { name, score } = req.body;

      if (!name || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid data' });
      }

      const sanitizedName = String(name).trim().substring(0, 20);

      if (!sanitizedName) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const newEntry: LeaderboardEntry = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        name: sanitizedName,
        score: Math.floor(score),
        timestamp: Date.now()
      };

      leaderboard.push(newEntry);

      // Keep only top 100 scores
      leaderboard = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 100);

      const rank = leaderboard.findIndex(entry => entry.id === newEntry.id) + 1;

      return res.status(200).json({
        success: true,
        rank,
        entry: newEntry
      });
    } catch (error) {
      console.error('Error submitting score:', error);
      return res.status(500).json({ error: 'Failed to submit score' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
