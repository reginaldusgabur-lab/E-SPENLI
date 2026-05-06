import { configure } from '@genkit-ai/core';
import { googleAI, gemini15Flash } from '@genkit-ai/google-genai';
import { firebase } from '@genkit-ai/firebase';

/**
 * PERBAIKAN FINAL (berdasarkan versi package.json):
 * File ini diperbarui untuk menggunakan sintaks Genkit yang benar untuk versi 1.33.0.
 * Fungsi yang benar adalah `configure` dari `@genkit-ai/core`.
 * Ini akan menyelesaikan error "no exported member 'defineConfig'".
 */
export const config = configure({
  plugins: [
    // Plugin akan secara otomatis menggunakan environment variables yang diatur di Vercel.
    firebase(),
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Ekspor model seperti biasa.
export const model = gemini15Flash;
