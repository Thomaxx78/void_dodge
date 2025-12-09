import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3001;
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
    const leaderboard: LeaderboardEntry[] = JSON.parse(data);

    const newEntry: LeaderboardEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      name: sanitizedName,
      score: Math.floor(score),
      timestamp: Date.now()
    };

    leaderboard.push(newEntry);

    // Keep only top 100 scores to prevent file from growing too large
    const topScores = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);

    fs.writeFileSync(DATA_FILE, JSON.stringify(topScores, null, 2));

    // Return the rank of the submitted score
    const rank = topScores.findIndex(entry => entry.id === newEntry.id) + 1;

    res.json({
      success: true,
      rank,
      entry: newEntry
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

app.listen(PORT, () => {
  console.log(`🎮 Leaderboard server running on http://localhost:${PORT}`);
});
