# 🚀 Quick Setup Checklist

## ⚠️ IMPORTANT: Firebase Console Setup Required

Before the new authentication system will work, you **MUST** enable Google Sign-In in Firebase Console.

## Step-by-Step Setup

### ✅ 1. Go to Firebase Console
Visit: https://console.firebase.google.com/

### ✅ 2. Select Your Project
Choose `pic-pro-base` from your projects

### ✅ 3. Enable Google Authentication
1. Click **Authentication** in the left sidebar
2. Click **Sign-in method** tab at the top
3. Find **Google** in the providers list
4. Click **Google** to expand it
5. Toggle **Enable** switch to ON
6. Click **Save**

### ✅ 4. Add Authorized Domains
1. Still in Authentication, click **Settings** tab
2. Scroll to **Authorized domains**
3. Make sure these domains are listed:
   - localhost (should be there by default)
   - picturelab.space (add if not present)
4. Click **Add domain** if you need to add picturelab.space

### ✅ 5. Update Firestore Security Rules (Optional but Recommended)
1. Click **Firestore Database** in left sidebar
2. Click **Rules** tab
3. Replace with these rules:

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

4. Click **Publish**

## Testing After Setup

### Local Testing (Development)
1. Run `npm run dev` in your terminal
2. Open http://localhost:5173
3. Click "Login" or "Continue with Google"
4. Select your Google account
5. You should be redirected to the Dashboard
6. Your profile and credits should appear in the header

### Production Testing (Railway)
1. Wait for Railway deployment to complete (2-5 minutes)
2. Visit https://picturelab.space
3. Click "Login" or "Continue with Google"
4. Select your Google account
5. You should be redirected to the Dashboard
6. Everything should work! 🎉

## Troubleshooting

### Error: "Auth domain not authorized"
**Solution**: Add `picturelab.space` to Authorized domains in Firebase Console

### Error: "This app is not verified"
**Solution**: This is normal for development. Click "Advanced" → "Go to [app name] (unsafe)"

### Error: "Firebase: Error (auth/operation-not-allowed)"
**Solution**: Google provider is not enabled. Go back to Step 3 above.

### Login popup doesn't open
**Solution**: 
- Check that popup blockers are disabled
- Try in incognito mode
- Check browser console for errors

### User logs in but immediately logs out
**Solution**:
- Check Firestore security rules
- Check browser console for permission errors
- Make sure Firebase config in .env is correct

## What's Different?

### Before (Old System)
- Backend handled Google OAuth
- Custom session cookies
- Complex token management
- Often broke after deployment

### After (New System)
- Firebase handles everything
- Automatic session persistence  
- Clean, simple code
- Rock-solid reliability ✅

## Need Help?

Check these files:
- `AUTH_SYSTEM.md` - Complete documentation
- `FIREBASE_SETUP.md` - Firebase configuration guide
- `src/firebase.js` - Auth implementation

---

**Setup Time**: ~5 minutes  
**Difficulty**: Easy 🟢  
**Required**: YES - App won't work without this!
