# 🔐 New Authentication System Documentation

## Overview
The login system has been completely rebuilt from scratch using **pure Firebase Authentication**. This new implementation is simpler, more reliable, and works seamlessly with Firestore.

## What Changed

### ❌ OLD SYSTEM (Removed)
- Custom Express backend OAuth with Google
- Session cookies with base64-encoded tokens
- Complex token passing between frontend and backend
- Firebase Auth integration via credentials (buggy)
- `/auth/google`, `/auth/google/callback`, `/auth/me` endpoints

### ✅ NEW SYSTEM (Current)
- **Pure Firebase Authentication** (client-side)
- Google Sign-In via Firebase `signInWithPopup`
- Automatic session persistence
- Clean Firebase Auth state management
- No backend authentication endpoints needed

## Architecture

### Frontend Flow
```
User clicks "Continue with Google"
    ↓
LoginModal.jsx calls signInWithGoogle()
    ↓
Firebase handles Google OAuth popup
    ↓
User authenticates with Google
    ↓
Firebase Auth state changes
    ↓
App.jsx's onAuthStateChanged listener fires
    ↓
User state updated throughout app
    ↓
User redirected to Dashboard
```

### Authentication State Management
- **App.jsx**: Main auth listener using `onAuthStateChanged()`
- **UserMenu.jsx**: Displays user info and manages credits
- **LoginModal.jsx**: Handles Google Sign-In
- **AccountPanel.jsx**: User profile and logout

## Key Files

### `src/firebase.js`
- Configures Firebase app
- Exports `signInWithGoogle()` helper
- Exports `signOut()` helper
- Exports `onAuthStateChanged` for state listening

### `src/App.jsx`
- Listens to Firebase auth state changes
- Passes user object to child components
- Handles loading state during auth check

### `src/components/LoginModal.jsx`
- Calls `signInWithGoogle()` on button click
- Shows error messages if auth fails
- Displays loading state during sign-in

### `src/components/UserMenu.jsx`
- Initializes user document in Firestore
- Listens to credit changes in real-time
- Displays user avatar and credits

### `src/components/AccountPanel.jsx`
- Shows user profile
- Displays user gallery
- Handles logout via `signOut()`

## User Object Structure

```javascript
{
  uid: "firebase-user-id",           // Firebase UID
  email: "user@example.com",
  name: "John Doe",                  // displayName
  picture: "https://...",            // photoURL
  emailVerified: true/false
}
```

## Firestore Integration

### User Document
When a user signs in for the first time, we create:
```
/users/{uid}
  - email: string
  - displayName: string
  - photoURL: string
  - credits: number (default: 200)
  - createdAt: timestamp
  - lastLogin: timestamp
```

### Creations
User creations are stored at:
```
/users/{uid}/creations/{creationId}
  - type: "background-changer" | "image-to-video" | "text-to-voice"
  - inputUrl: string
  - outputUrl: string
  - prompt: string
  - status: "processing" | "completed"
  - createdAt: timestamp
```

## Firebase Console Setup Required

### 1. Enable Google Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`pic-pro-base`)
3. Go to **Authentication** → **Sign-in method**
4. Enable **Google** provider
5. Save your changes

### 2. Add Authorized Domains
In Authentication → Settings → Authorized domains, add:
- `localhost` (for development)
- `picturelab.space` (for production)
- Any other domains you use

### 3. Firestore Security Rules
Update your Firestore rules to allow authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User's creations
      match /creations/{creationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Backend Changes (server.js)

The backend OAuth endpoints are **no longer used** for authentication. However, the backend still:
- ✅ Proxies requests to ComfyDeploy API (`/api/generate`)
- ✅ Checks run status (`/api/run/:run_id`)
- ✅ Manages Firestore operations for credits

### Future: Secure Backend API
To secure backend API endpoints, we'll use **Firebase Admin SDK**:

```javascript
import admin from 'firebase-admin';

// Middleware to verify Firebase ID token
const verifyFirebaseToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  
  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Use in routes
app.post('/api/generate', verifyFirebaseToken, async (req, res) => {
  const userId = req.user.uid;
  // ... rest of the code
});
```

## Testing the New System

### Local Development
1. Make sure Firebase config is in `.env`
2. Run `npm run dev`
3. Click "Continue with Google"
4. Authenticate with your Google account
5. You should be redirected to Dashboard
6. Credits should display in header
7. User menu should show your profile

### Production
1. Deploy to Railway
2. Ensure all environment variables are set
3. Test the same flow as local

## Troubleshooting

### "Auth domain not authorized"
- Add your domain to Firebase Console → Authentication → Settings → Authorized domains

### "Firebase Auth not initialized"
- Check that all Firebase env variables are set correctly
- Restart your dev server after changing `.env`

### User not staying logged in
- Firebase handles persistence automatically
- Check browser console for errors
- Clear cookies and try again

### Credits not updating
- Check Firestore security rules
- Ensure user document exists in `/users/{uid}`
- Check browser console for permission errors

## Migration Notes

- ✅ Old sessions are **incompatible** with new system
- ✅ Users will need to **log in again**
- ✅ No data loss - Firestore data remains intact
- ✅ Much more reliable authentication flow
- ✅ Better error handling and user feedback

## Benefits of New System

1. **Simpler**: No custom backend OAuth logic
2. **More Reliable**: Firebase handles all edge cases
3. **Better UX**: Popup instead of redirects
4. **Automatic Session Management**: Firebase handles it
5. **Seamless Firestore Integration**: Auth works out of the box
6. **Better Error Messages**: Clear feedback to users
7. **Real-time State**: `onAuthStateChanged` updates instantly
8. **Industry Standard**: Firebase Auth is battle-tested

---

**Last Updated**: 2026-02-02
**Version**: 2.0 (Complete Rebuild)
