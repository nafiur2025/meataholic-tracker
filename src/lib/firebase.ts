import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - Meataholic Production
const firebaseConfig = {
  apiKey: "AIzaSyCDltSlqjno-Af13qIpazUmLhRru-febXQ",
  authDomain: "meataholic.firebaseapp.com",
  projectId: "meataholic",
  storageBucket: "meataholic.firebasestorage.app",
  messagingSenderId: "85179034653",
  appId: "1:85179034653:web:0a462eb36b291c27df2af4"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configuration check - always true since we have the config
export const isFirebaseConfigured = true;

export default app;
