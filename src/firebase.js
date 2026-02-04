// Firebase configuration
import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
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

// Helper function to generate a unique username from email
export const generateUsernameFromEmail = (email) => {
    const baseName = email.split('@')[0];
    const randomSuffix = Math.floor(Math.random() * 9999);
    return `${baseName}${randomSuffix}`;
};

// Helper function to generate username from Google display name
export const generateUsernameFromName = (displayName) => {
    if (!displayName) return `user${Math.floor(Math.random() * 99999)}`;
    const cleaned = displayName.toLowerCase().replace(/\s+/g, '');
    const randomSuffix = Math.floor(Math.random() * 999);
    return `${cleaned}${randomSuffix}`;
};

// Helper function to register with email and password
export const registerWithEmail = async (email, password, username) => {
    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name with username
        await updateProfile(user, {
            displayName: username
        });

        console.log('✅ Successfully registered:', user.email);
        return user;
    } catch (error) {
        console.error('❌ Registration error:', error);

        // Provide user-friendly error messages
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email is already registered. Please sign in instead.');
        } else if (error.code === 'auth/weak-password') {
            throw new Error('Password should be at least 6 characters.');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email address.');
        }
        throw error;
    }
};

// Helper function to sign in with email and password
export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Successfully signed in:', userCredential.user.email);
        return userCredential.user;
    } catch (error) {
        console.error('❌ Sign-in error:', error);

        // Provide user-friendly error messages
        if (error.code === 'auth/user-not-found') {
            throw new Error('No account found with this email.');
        } else if (error.code === 'auth/wrong-password') {
            throw new Error('Incorrect password.');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email address.');
        }
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
