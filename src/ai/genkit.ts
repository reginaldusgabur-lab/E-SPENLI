import { defineConfig } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/google-genai';
import { firebase } from '@genkit-ai/firebase';

/**
 * PERBAIKAN FINAL (berdasarkan log build Vercel yang baru):
 * File ini diperbarui untuk menggunakan sintaks Genkit modern.
 * Fungsi `configureGenkit` yang usang telah diganti dengan `defineConfig`.
 * Impor inti sekarang berasal dari 'genkit' bukan '@genkit-ai/core'.
 * Ini akan menyelesaikan error "no exported member 'configureGenkit'".
 */
export const config = defineConfig({
  plugins: [
    // Plugin firebase() dan googleAI() akan secara otomatis menggunakan
    // environment variables yang diatur di Vercel.
    firebase(),
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Ekspor model seperti biasa. File lain tidak perlu diubah.
export const model = gemini15Flash;
