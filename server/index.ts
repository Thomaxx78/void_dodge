import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3003;
const DATA_FILE = path.join(__dirname, 'leaderboard.json');

app.use(cors());
app.use(express.json());

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  timestamp: number;
}

// Initialize leaderboard file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const leaderboard: LeaderboardEntry[] = JSON.parse(data);

    // Sort by score descending and return top 10
    const topScores = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json(topScores);
  } catch (error) {
    console.error('Error reading leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Submit score
app.post('/api/leaderboard', (req, res) => {
  try {
    const { name, score } = req.body;

    if (!name || typeof score !== 'number') {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Sanitize name
    const sanitizedName = name.trim().substring(0, 20);

    if (!sanitizedName) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    let leaderboard: LeaderboardEntry[] = JSON.parse(data);

    // Normalize name for comparison (case-insensitive)
    const normalizedName = sanitizedName.toLowerCase();
    const newScore = Math.floor(score);

    // Check if player already exists
    const existingPlayerIndex = leaderboard.findIndex(
      entry => entry.name.toLowerCase() === normalizedName
    );

    if (existingPlayerIndex !== -1) {
      const existingScore = leaderboard[existingPlayerIndex].score;

      // Only update if new score is better
      if (newScore > existingScore) {
        leaderboard[existingPlayerIndex] = {
          ...leaderboard[existingPlayerIndex],
          score: newScore,
          timestamp: Date.now()
        };
      } else {
        // Score is not better, return existing entry
        const topScores = leaderboard.sort((a, b) => b.score - a.score);
        const rank = topScores.findIndex(entry => entry.name.toLowerCase() === normalizedName) + 1;

        return res.json({
          success: true,
          rank,
          entry: leaderboard[existingPlayerIndex],
          message: 'Score not improved'
        });
      }
    } else {
      // New player, add to leaderboard
      const newEntry: LeaderboardEntry = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        name: sanitizedName,
        score: newScore,
        timestamp: Date.now()
      };
      leaderboard.push(newEntry);
    }

    // Keep only top 100 scores to prevent file from growing too large
    const topScores = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);

    fs.writeFileSync(DATA_FILE, JSON.stringify(topScores, null, 2));

    // Return the rank of the submitted score
    const rank = topScores.findIndex(
      entry => entry.name.toLowerCase() === normalizedName
    ) + 1;

    const playerEntry = topScores.find(
      entry => entry.name.toLowerCase() === normalizedName
    );

    res.json({
      success: true,
      rank,
      entry: playerEntry
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

app.listen(PORT, () => {
  console.log(`🎮 Leaderboard server running on http://localhost:${PORT}`);
});
