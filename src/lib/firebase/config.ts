import { initializeApp } from 'firebase/app';
import { getAuth, type Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, type Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { browser } from '$app/environment';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Log config for debugging (remove in production)
console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
});

// Initialize Firebase only in browser
let app: any = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (browser) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Enable auth persistence
    auth.useDeviceLanguage();
    
    console.log('✅ Firebase initialized successfully');
    
    // Uncomment these lines if you want to use Firebase emulators for development
    // if (import.meta.env.DEV) {
    //   connectAuthEmulator(auth, 'http://localhost:9099');
    //   connectFirestoreEmulator(db, 'localhost', 8080);
    // }
    
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
}

export { auth, db };