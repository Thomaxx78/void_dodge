import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateGameCommentary = async (score: number, timeSurvived: number): Promise<string> => {
  const client = getClient();
  if (!client) return "Gemini offline. Good luck next time!";

  try {
    const prompt = `
      I just played a minimalist abstract dodge arcade game called "Neon Void".
      I survived for ${timeSurvived.toFixed(1)} seconds and scored ${Math.floor(score)} points.
      
      The game visuals are deep black background, white player circle, chaotic red enemy squares.
      
      Give me a single, short, intense, 1-sentence commentary on my performance.
      Style: Cyberpunk, Arcade Announcer, Slightly chaotic.
      
      Rules:
      - If score < 500: Roast me gently for being too slow or having bad reflexes.
      - If score > 500 and < 2000: Encourage me to push harder, focus on the flow.
      - If score > 2000: Praise me as a void-walker or neon god.
      - Do not include "Game Over" in the text, just the commentary.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "The void stares back...";
  } catch (error) {
    console.error("Error generating commentary:", error);
    return "Connection to the Void severed.";
  }
};