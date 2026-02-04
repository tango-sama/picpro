# 👤 User Profile System Documentation

## Overview
This document describes the comprehensive user profile system implemented for PicPro, supporting both **Google OAuth** and **Email/Password** authentication methods.

## Database Schema

Every user in the Firestore database has the following fields:

### User Document Structure
```
/users/{uid}
  - email: string              // User's email address
  - username: string           // Unique username for the user
  - displayName: string        // Display name (from Google or username)
  - photoURL: string           // Profile picture URL (Google, uploaded, or default)
  - authMethod: string         // 'google' or 'email'
  - credits: number            // User credits (default: 200)
  - createdAt: timestamp       // Account creation timestamp
  - lastLogin: timestamp       // Last login timestamp
```

## Field Descriptions

### 1. **Profile Picture (`photoURL`)**
- **Google OAuth**: Automatically pulled from Google account profile picture
- **Email/Password**: Generated default avatar using UI Avatars API based on username
- **Default**: `https://ui-avatars.com/api/?name={username}&background=6366f1&color=fff&size=200`
- Users can later update this field with custom profile pictures

### 2. **Email Address (`email`)**
- **Google OAuth**: Automatically retrieved from Google account
- **Email/Password**: User provides email during registration
- **Validation**: Firebase validates email format
- **Required**: Yes, for both auth methods

### 3. **Username (`username`)**
- **Google OAuth**: 
  - First tries to use Google display name (cleaned, lowercased, no spaces)
  - If not available, generates from email prefix
  - Appends random 3-4 digit suffix for uniqueness
  - Example: `johndoe123` or `user47821`
- **Email/Password**: User chooses username during registration
- **Validation**: Minimum 3 characters
- **Required**: Yes

### 4. **Credits (`credits`)**
- **Initial Value**: 200 credits for all new users
- **Type**: Number
- **Usage**: Deducted when using AI features
- **Real-time**: Updates via Firestore listeners

### 5. **Password**
- **Google OAuth**: Not stored (managed by Google)
- **Email/Password**: Securely hashed and stored by Firebase Authentication
- **Validation**: Minimum 6 characters
- **Note**: Password is NOT stored in Firestore, only in Firebase Auth

### 6. **Auth Method (`authMethod`)**
- **Values**: `'google'` or `'email'`
- **Purpose**: Identifies how the user authenticates
- **Automatic**: Set during account creation

### 7. **Display Name (`displayName`)**
- **Google OAuth**: From Google account
- **Email/Password**: Same as username
- **Editable**: Can be updated later

## Authentication Flows

### Google OAuth Flow
```
1. User clicks "Continue with Google"
2. Firebase opens Google OAuth popup
3. User authenticates with Google
4. Firebase returns user object with:
   - uid (Firebase User ID)
   - email
   - photoURL (from Google)
   - displayName (from Google)
5. System creates Firestore user document with:
   - email: from Google
   - username: generated from displayName or email
   - photoURL: from Google
   - authMethod: 'google'
   - credits: 200
   - displayName: from Google
6. User is redirected to Dashboard
```

### Email/Password Registration Flow
```
1. User clicks "Create Account"
2. User fills in:
   - Email address
   - Username (custom)
   - Password
   - Confirm password
3. Frontend validates:
   - All fields filled
   - Username >= 3 characters
   - Password >= 6 characters
   - Passwords match
4. Firebase creates account with email/password
5. System updates Firebase profile with username as displayName
6. System creates Firestore user document with:
   - email: user provided
   - username: user provided
   - photoURL: generated default avatar
   - authMethod: 'email'
   - credits: 200
   - displayName: username
7. User is redirected to Dashboard
```

### Email/Password Login Flow
```
1. User clicks "Sign In" (Email tab)
2. User enters email and password
3. Firebase authenticates credentials
4. System updates lastLogin timestamp
5. User is redirected to Dashboard
```

## User Registration Component

### RegisterModal Features
- Email input with validation
- Username input (min 3 characters)
- Password input (min 6 characters)
- Confirm password field
- Real-time validation
- User-friendly error messages
- Switch to Login link

### LoginModal Features
- Tab switcher: Google / Email
- **Google Tab**:
  - Single "Continue with Google" button
  - Firebase OAuth popup
- **Email Tab**:
  - Email input field
  - Password input field
  - Sign In button
- Switch to Register link
- Error handling and display

## Firestore Security Rules

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

## Firebase Configuration Required

### 1. Enable Authentication Providers
In Firebase Console → Authentication → Sign-in method:
- ✅ Enable **Google** provider
- ✅ Enable **Email/Password** provider

### 2. Authorized Domains
Add your domains in Authentication → Settings → Authorized domains:
- `localhost` (development)
- `picturelab.space` (production)
- Any other custom domains

## Implementation Files

### Core Files
1. **`src/firebase.js`** - Firebase configuration and auth helpers
2. **`src/components/LoginModal.jsx`** - Login modal with Google & Email options
3. **`src/components/RegisterModal.jsx`** - Registration form for email/password
4. **`src/components/UserMenu.jsx`** - User profile initialization and display
5. **`src/components/Header.jsx`** - Navigation with auth modal triggers

### New Firebase Functions

#### `registerWithEmail(email, password, username)`
Creates new email/password account and sets username as displayName

#### `signInWithEmail(email, password)`
Authenticates user with email and password

#### `signInWithGoogle()`
Opens Google OAuth popup for authentication

#### `generateUsernameFromEmail(email)`
Generates username from email prefix + random digits

#### `generateUsernameFromName(displayName)`
Generates username from Google display name + random digits

## User Object in Frontend

After authentication, the user object available throughout the app:

```javascript
{
  uid: "firebase-user-id",
  email: "user@example.com",
  name: "John Doe",              // or username
  picture: "https://...",         // photoURL
  displayName: "johndoe123",
  emailVerified: true/false,
  providerData: [...]
}
```

## Testing

### Test Google OAuth
1. npm run dev
2. Click "Get Started"
3. Select "Google" tab
4. Click "Continue with Google"
5. Authenticate with Google account
6. Verify redirect to Dashboard
7. Check Firestore for user document with correct fields

### Test Email/Password Registration
1. npm run dev
2. Click "Get Started"
3. Click "Create account"
4. Fill in email, username, password
5. Click "Create Account"
6. Verify redirect to Dashboard
7. Check Firestore for user document

### Test Email/Password Login
1. npm run dev
2. Click "Get Started"
3. Select "Email" tab
4. Enter existing credentials
5. Click "Sign In"
6. Verify redirect to Dashboard

## Error Handling

### Registration Errors
- "This email is already registered" → `auth/email-already-in-use`
- "Password should be at least 6 characters" → `auth/weak-password`
- "Invalid email address" → `auth/invalid-email`
- "Please fill in all fields" → Frontend validation
- "Passwords do not match" → Frontend validation
- "Username must be at least 3 characters" → Frontend validation

### Login Errors
- "No account found with this email" → `auth/user-not-found`
- "Incorrect password" → `auth/wrong-password`
- "Invalid email address" → `auth/invalid-email`
- "Please enter both email and password" → Frontend validation

## Default Values

| Field | Default Value |
|-------|--------------|
| credits | 200 |
| photoURL (email auth) | Generated avatar based on username |
| photoURL (google auth) | From Google profile |
| authMethod | 'google' or 'email' |
| displayName (email) | Same as username |
| displayName (google) | From Google account |

## Future Enhancements

### Planned Features
1. **Profile editing**: Allow users to update username, displayName, photoURL
2. **Password reset**: Email-based password recovery
3. **Email verification**: Send verification emails
4. **Social sign-in**: Add Facebook, Twitter, etc.
5. **Profile pictures**: Upload custom profile pictures
6. **Account linking**: Link Google account to existing email/password account

## Benefits of This System

✅ **Flexible**: Supports multiple auth methods  
✅ **Secure**: Firebase handles all password hashing and security  
✅ **User-Friendly**: Default avatars and auto-generated usernames  
✅ **Complete**: All required fields captured for both auth methods  
✅ **Consistent**: Same user experience regardless of auth method  
✅ **Scalable**: Easy to add more auth providers in the future  

---

**Last Updated**: 2026-02-04  
**Version**: 3.0 (Dual Authentication Support)
