import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// DEBUG - à supprimer après
console.log('API KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10));

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let analytics: Analytics | null = null;

function initializeFirebase() {
  if (typeof window === 'undefined') return;
  
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    
    if (firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  }
  
  return { app, auth, analytics };
}

function getFirebaseApp() {
  if (typeof window === 'undefined') return undefined;
  if (!app) initializeFirebase();
  return app;
}

function getFirebaseAuth() {
  if (typeof window === 'undefined') return undefined;
  if (!auth) initializeFirebase();
  return auth;
}

function getFirebaseAnalytics() {
  if (typeof window === 'undefined') return null;
  if (!analytics) initializeFirebase();
  return analytics;
}

export { getFirebaseApp as app, getFirebaseAuth as auth, getFirebaseAnalytics as analytics };