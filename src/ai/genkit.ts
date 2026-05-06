
import { configureGenkit } from '@genkit-ai/core';
import { googleAI, gemini15Flash } from '@genkit-ai/google-genai';
import { firebase } from '@genkit-ai/firebase';

// Konfigurasi Genkit disederhanakan untuk selalu menggunakan Environment Variables.
// Ini adalah praktik terbaik untuk platform serverless seperti Vercel.
export const config = configureGenkit({
  plugins: [
    firebase(), // Mengaktifkan logging dan tracing ke Firebase.
    // Plugin googleAI akan secara otomatis menggunakan environment variable
    // GOOGLE_GENAI_API_KEY jika tidak ada `apiKey` yang disediakan di sini.
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Ekspor model seperti biasa. File lain tidak perlu diubah.
export const model = gemini15Flash;
