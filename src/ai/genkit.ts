import { genkit } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Menggunakan nama variabel lingkungan dari README
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});

// Export model
export const model = gemini15Flash;
