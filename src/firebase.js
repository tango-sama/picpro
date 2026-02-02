// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Get Firebase config from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('⚠️ Firebase configuration is missing! Check your .env file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);
const db = getFirestore(app);

// Initialize Analytics only in client environment
let analytics;
if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (e) {
        console.warn("Analytics not initialized", e);
    }
}

// Configure Google Auth Provider
provider.setCustomParameters({
    prompt: 'select_account'
});

// Helper function to sign in with Google
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log('✅ Successfully signed in:', result.user.email);
        return result.user;
    } catch (error) {
        console.error('❌ Sign-in error:', error);
        throw error;
    }
};

// Helper function to sign out
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        console.log('✅ Successfully signed out');
    } catch (error) {
        console.error('❌ Sign-out error:', error);
        throw error;
    }
};

// Export everything
export { app, auth, provider, storage, db, analytics, onAuthStateChanged };
