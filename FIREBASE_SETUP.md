# Firebase Setup Guide

This guide will help you link your PicPro app with Firebase.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard:
   - Enter a project name
   - (Optional) Enable Google Analytics
   - Click **"Create project"**

## Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Register your app with a nickname (e.g., "PicPro Web")
3. (Optional) Check "Also set up Firebase Hosting"
4. Click **"Register app"**

## Step 3: Get Your Firebase Configuration

After registering, Firebase will show your configuration object. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**Alternative:** You can also find this in:
- Firebase Console → Project Settings → General → Your apps → Web app config

## Step 4: Set Up Environment Variables

1. Copy the `.env.example` file to create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

## Step 5: Enable Authentication (Optional)

If you want to use Firebase Authentication:

1. Go to Firebase Console → **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **Google** sign-in provider
5. Add your authorized domains (e.g., `localhost` for development)

## Step 6: Enable Other Firebase Services (Optional)

### Firestore Database
1. Go to **Firestore Database**
2. Click **"Create database"**
3. Start in **test mode** (for development) or **production mode**
4. Choose a location for your database

### Storage
1. Go to **Storage**
2. Click **"Get started"**
3. Accept the default security rules (you can customize later)
4. Choose a location

## Step 7: Verify Setup

1. Make sure your `.env` file is in the root directory
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Check the browser console for any Firebase errors
4. The app should now be connected to Firebase!

## Security Notes

- **Never commit your `.env` file** to version control
- The `.env` file is already in `.gitignore` (should be)
- Firebase API keys in client-side code are safe to expose (they're public)
- For sensitive operations, use Firebase Security Rules and Cloud Functions

## Using Firebase in Your Components

After setup, you can import and use Firebase in your components:

```javascript
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

// Sign in with Google
const handleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('User:', result.user);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Sign out
const handleSignOut = async () => {
  await signOut(auth);
};
```

## Troubleshooting

- **"Firebase configuration is missing"**: Check your `.env` file and ensure all variables start with `VITE_`
- **"Permission denied"**: Check Firebase Security Rules for Firestore/Storage
- **"Auth domain not authorized"**: Add your domain to Firebase Authentication settings
- **Environment variables not loading**: Restart your dev server after creating/updating `.env`
