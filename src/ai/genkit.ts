
import { configureGenkit } from '@genkit-ai/core';
import { googleAI, gemini15Flash } from '@genkit-ai/google-genai';
import { firebase } from '@genkit-ai/firebase';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';

// Helper function to safely initialize Firebase Admin SDK
const initializeAdminApp = (): App => {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }
  // When running in a Vercel serverless function, the SDK should automatically
  // pick up the service account credentials from environment variables.
  return initializeApp();
};

// Async function to fetch the API key from Firestore
async function getApiKeyFromFirestore(): Promise<string | undefined> {
  try {
    initializeAdminApp();
    const db = getFirestore();
    const configDoc = await db.collection('schoolConfig').doc('default').get();

    if (configDoc.exists) {
      const configData = configDoc.data();
      // Return the key if it exists and is a non-empty string
      if (configData && typeof configData.geminiApiKey === 'string' && configData.geminiApiKey.trim() !== '') {
        console.log("Successfully fetched API key from Firestore.");
        return configData.geminiApiKey;
      }
    }
    // Log if the document or key is not found, for debugging purposes.
    console.log("geminiApiKey not found in schoolConfig/default or is empty. Falling back to environment variable.");
    return undefined;
  } catch (error) {
    console.error("Error fetching API key from Firestore. Falling back to environment variable:", error);
    return undefined;
  }
}

// Use top-level await to get the key before configuring Genkit.
// This ensures that the configuration has the dynamic key when the module is imported.
const apiKeyFromFirestore = await getApiKeyFromFirestore();

export const config = configureGenkit({
  plugins: [
    firebase(), // Enables logging and tracing to Firebase
    // Use the fetched key. If it's undefined, the plugin will default to process.env.GENAI_API_KEY
    googleAI({ apiKey: apiKeyFromFirestore }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Export the model as before. No changes needed in other files.
export const model = gemini15Flash;
