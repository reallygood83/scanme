'use client';

import { getAnalytics, isSupported } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBHs7TRrjWPXz0hMR8NiZ-a2E79SMomiiI',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'scanme-6e6e1.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'scanme-6e6e1',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'scanme-6e6e1.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '579315231855',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:579315231855:web:e7838b7a784ae22dfcb19a',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-ZCD69CFHNR',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);

let analyticsBooted = false;

export async function bootFirebaseAnalytics() {
  if (analyticsBooted || typeof window === 'undefined' || !firebaseConfig.measurementId) return;
  const supported = await isSupported();
  if (!supported) return;
  getAnalytics(firebaseApp);
  analyticsBooted = true;
}
