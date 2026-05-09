import { genkit } from 'genkit';
import { googleAI, geminiPro } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});

// Export model
export const model = geminiPro;
