/* eslint-disable no-console */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, writeBatch, doc, Timestamp } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase safely
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedSchoolConfiguration() {
  const batch = writeBatch(db);

  // 1. Default School-wide Configuration
  const schoolConfigRef = doc(db, 'schoolConfig', 'default');

  batch.set(
    schoolConfigRef,
    {
      isAttendanceActive: true,
      useTimeValidation: true,

      checkInStartTime: '06:00',
      checkInEndTime: '08:30',

      checkOutTimes: {
        1: { start: '15:00', end: '18:00' },
        2: { start: '15:00', end: '18:00' },
        3: { start: '15:00', end: '18:00' },
        4: { start: '15:00', end: '18:00' },
        5: { start: '11:00', end: '13:00' },
        6: { start: '13:00', end: '15:00' },
      },

      offDays: [0],

      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );

  // 2. Monthly Holiday Configuration - May 2024
  const mayConfigRef = doc(db, 'monthlyConfigs', '2024-05');

  batch.set(
    mayConfigRef,
    {
      holidays: [
        '2024-05-01',
        '2024-05-09',
        '2024-05-23',
      ],
      notes: 'Konfigurasi libur untuk Mei 2024.',
    },
    { merge: true }
  );

  // 3. Monthly Holiday Configuration - June 2024
  const juneConfigRef = doc(db, 'monthlyConfigs', '2024-06');

  batch.set(
    juneConfigRef,
    {
      holidays: [
        '2024-06-01',
        '2024-06-17',
      ],
      notes: 'Konfigurasi libur untuk Juni 2024.',
    },
    { merge: true }
  );

  try {
    await batch.commit();

    console.log('✅ Successfully seeded database with default configurations.');
    console.log('- Set weekly off-day to Sunday.');
    console.log('- Added national holidays for May & June 2024.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedSchoolConfiguration();