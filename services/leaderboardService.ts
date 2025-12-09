// Use relative URL for both local dev and production
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  timestamp: number;
}

export interface SubmitScoreResponse {
  success: boolean;
  rank: number;
  entry: LeaderboardEntry;
  message?: string;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const response = await fetch(`${API_URL}/leaderboard`);
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

export const submitScore = async (name: string, score: number): Promise<SubmitScoreResponse | null> => {
  try {
    const response = await fetch(`${API_URL}/leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, score }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit score');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting score:', error);
    return null;
  }
};
