# 📊 User Database Structure Documentation

## Overview
This document describes the organized, clearly-identified user data structure in Firestore.

## Database Location
```
/users/{firebase-uid}/
```

## Complete User Document Structure

```javascript
{
  // ═══════════════════════════════════════════════════════════
  // ACCOUNT IDENTIFIERS
  // ═══════════════════════════════════════════════════════════
  userId: "firebase-uid-string",           // Primary identifier (Firebase UID)
  userNumber: null,                        // Sequential number (e.g., 1, 2, 3... for admin use)
  
  // ═══════════════════════════════════════════════════════════
  // PROFILE INFORMATION
  // ═══════════════════════════════════════════════════════════
  profile: {
    email: "user@example.com",             // User's email address
    username: "johndoe123",                // Unique username
    displayName: "John Doe",               // Display name shown in UI
    photoURL: "https://...",               // Profile picture URL
    bio: "",                               // User bio (empty by default)
    emailVerified: true/false              // Email verification status
  },
  
  // ═══════════════════════════════════════════════════════════
  // AUTHENTICATION INFO
  // ═══════════════════════════════════════════════════════════
  authentication: {
    method: "google" | "email",            // Authentication method used
    provider: "google.com" | "password",   // Full provider ID from Firebase
    createdAt: Timestamp,                  // When account was created
    lastLogin: Timestamp,                  // Last successful login
    loginCount: 5                          // Total number of logins
  },
  
  // ═══════════════════════════════════════════════════════════
  // BILLING & CREDITS
  // ═══════════════════════════════════════════════════════════
  billing: {
    credits: 200,                          // Current available credits
    totalCreditsEarned: 200,               // Lifetime credits earned (includes purchases + bonuses)
    totalCreditsSpent: 0,                  // Lifetime credits spent on generations
    subscriptionTier: "free",              // Current plan: 'free', 'starter', 'pro', 'studio'
    subscriptionStatus: "active",          // Status: 'active', 'cancelled', 'expired'
    nextBillingDate: null                  // Next billing date (Timestamp or null for free tier)
  },
  
  // ═══════════════════════════════════════════════════════════
  // USAGE STATISTICS
  // ═══════════════════════════════════════════════════════════
  stats: {
    totalGenerations: 0,                   // Total AI generations created (all types)
    backgroundChanges: 0,                  // Number of background changes created
    videosCreated: 0,                      // Number of videos created
    voiceovers: 0                          // Number of voiceovers created
  },
  
  // ═══════════════════════════════════════════════════════════
  // ACCOUNT STATUS
  // ═══════════════════════════════════════════════════════════
  status: {
    isActive: true,                        // Account is active/inactive
    isBanned: false,                       // Ban status
    isEmailVerified: true/false,           // Email verification complete
    accountType: "user"                    // Role: 'user', 'admin', 'moderator'
  },
  
  // ═══════════════════════════════════════════════════════════
  // TIMESTAMPS (Top-level for easy querying)
  // ═══════════════════════════════════════════════════════════
  createdAt: Timestamp,                    // Account creation date
  updatedAt: Timestamp,                    // Last profile update
  lastLogin: Timestamp                     // Last login (duplicate for easy access)
}
```

## Field Descriptions

### Account Identifiers

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `userId` | String | Firebase Authentication UID (immutable) | `"xR7k9mP3Q4..."` |
| `userNumber` | Number/Null | Sequential user number for admin purposes | `1234` or `null` |

### Profile Information (`profile.*`)

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| `profile.email` | String | User's email address | Google or user-provided |
| `profile.username` | String | Unique username (min 3 chars) | Auto-generated or user-chosen |
| `profile.displayName` | String | Display name for UI | Google name or username |
| `profile.photoURL` | String | Profile picture URL | Google photo or UI Avatars |
| `profile.bio` | String | User biography | Empty by default |
| `profile.emailVerified` | Boolean | Email verification status | From Firebase Auth |

### Authentication Info (`authentication.*`)

| Field | Type | Description | Values |
|-------|------|-------------|--------|
| `authentication.method` | String | Auth method used | `"google"` or `"email"` |
| `authentication.provider` | String | Firebase provider ID | `"google.com"` or `"password"` |
| `authentication.createdAt` | Timestamp | Account creation time | Server timestamp |
| `authentication.lastLogin` | Timestamp | Last login time | Server timestamp |
| `authentication.loginCount` | Number | Total login count | Increments on each login |

### Billing & Credits (`billing.*`)

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `billing.credits` | Number | Current credit balance | `200` |
| `billing.totalCreditsEarned` | Number | Lifetime credits earned | `200` |
| `billing.totalCreditsSpent` | Number | Lifetime credits spent | `0` |
| `billing.subscriptionTier` | String | Subscription plan | `"free"` |
| `billing.subscriptionStatus` | String | Subscription status | `"active"` |
| `billing.nextBillingDate` | Timestamp/Null | Next billing date | `null` |

**Subscription Tiers:**
- `"free"` - Free plan with 200 initial credits
- `"starter"` - $19/mo with 1,000 credits
- `"pro"` - $39/mo with 3,000 credits
- `"studio"` - $79/mo with 8,000 credits

**Subscription Statuses:**
- `"active"` - Currently active subscription
- `"cancelled"` - Cancelled but still valid until end date
- `"expired"` - Subscription has expired

### Usage Statistics (`stats.*`)

| Field | Type | Description | Increments When |
|-------|------|-------------|-----------------|
| `stats.totalGenerations` | Number | All AI generations | Any generation completes |
| `stats.backgroundChanges` | Number | Background changes | Background changer used |
| `stats.videosCreated` | Number | Videos created | Video generator used |
| `stats.voiceovers` | Number | Voiceovers created | Voice generator used |

### Account Status (`status.*`)

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `status.isActive` | Boolean | Account enabled/disabled | `true` |
| `status.isBanned` | Boolean | Ban status | `false` |
| `status.isEmailVerified` | Boolean | Email verified | From auth |
| `status.accountType` | String | User role | `"user"` |

**Account Types:**
- `"user"` - Regular user
- `"admin"` - Administrator
- `"moderator"` - Moderator

### Top-Level Timestamps

| Field | Type | Description | Updates When |
|-------|------|-------------|--------------|
| `createdAt` | Timestamp | Account creation | Only on creation |
| `updatedAt` | Timestamp | Last profile update | Any profile change |
| `lastLogin` | Timestamp | Last login time | Every login |

## Data Access Paths

### Reading User Data

```javascript
// Get full profile
const email = userData.profile.email;
const username = userData.profile.username;

// Get credits
const credits = userData.billing.credits;

// Get statistics
const totalGens = userData.stats.totalGenerations;

// Check status
const isActive = userData.status.isActive;
const isBanned = userData.status.isBanned;

// Get auth info
const authMethod = userData.authentication.method;
const loginCount = userData.authentication.loginCount;
```

### Updating User Data

```javascript
// Update credits
await updateDoc(userRef, {
  'billing.credits': increment(-15),
  'billing.totalCreditsSpent': increment(15),
  updatedAt: serverTimestamp()
});

// Update stats
await updateDoc(userRef, {
  'stats.totalGenerations': increment(1),
  'stats.backgroundChanges': increment(1),
  updatedAt: serverTimestamp()
});

// Update profile
await updateDoc(userRef, {
  'profile.displayName': 'New Name',
  'profile.bio': 'My bio',
  updatedAt: serverTimestamp()
});

// Update on login
await updateDoc(userRef, {
  lastLogin: serverTimestamp(),
  updatedAt: serverTimestamp(),
  'authentication.lastLogin': serverTimestamp(),
  'authentication.loginCount': increment(1)
});
```

## Backward Compatibility

The system supports **both new and legacy structures**:

```javascript
// New structure
const credits = userData.billing.credits;

// Legacy structure (fallback)
const creditsLegacy = userData.credits;

// Safe access with fallback
const credits = userData.billing?.credits ?? userData.credits ?? 200;
```

## Benefits of This Structure

### ✅ **Clear Organization**
- Related fields grouped together
- Easy to understand at a glance
- Scalable for future fields

### ✅ **Explicit Identifiers**
- Every field has a clear, descriptive name
- No ambiguous abbreviations
- Inline comments explain each field

### ✅ **Easy Querying**
- Top-level timestamps for Firestore queries
- Can query by `createdAt`, `lastLogin`, etc.
- Nested structure doesn't affect top-level queries

### ✅ **Analytics Ready**
- Stats grouped for easy reporting
- Can track usage patterns
- Billing data separate and secure

### ✅ **Role Management**
- Account types clearly defined
- Ban and active status separate
- Email verification tracked

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can update their profile (but not billing, stats, or status)
      allow update: if request.auth != null 
                    && request.auth.uid == userId
                    && !request.resource.data.diff(resource.data).affectedKeys()
                      .hasAny(['billing', 'status', 'authentication', 'userId']);
      
      // Only server can create users (via Firebase Auth trigger)
      allow create: if false;
      
      // Only admins can delete users
      allow delete: if request.auth != null 
                    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status.accountType == 'admin';
    }
  }
}
```

## Migration from Legacy Structure

If you have existing users with the old flat structure, run this migration:

```javascript
const migrateUser = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  
  const oldData = userSnap.data();
  
  // Check if already migrated
  if (oldData.profile) {
    console.log('Already migrated');
    return;
  }
  
  // Migrate to new structure
  const newData = {
    userId: userId,
    userNumber: null,
    
    profile: {
      email: oldData.email,
      username: oldData.username,
      displayName: oldData.displayName,
      photoURL: oldData.photoURL,
      bio: '',
      emailVerified: oldData.emailVerified || false
    },
    
    authentication: {
      method: oldData.authMethod || 'email',
      provider: oldData.authMethod === 'google' ? 'google.com' : 'password',
      createdAt: oldData.createdAt,
      lastLogin: oldData.lastLogin,
      loginCount: 1
    },
    
    billing: {
      credits: oldData.credits || 200,
      totalCreditsEarned: oldData.credits || 200,
      totalCreditsSpent: 0,
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      nextBillingDate: null
    },
    
    stats: {
      totalGenerations: 0,
      backgroundChanges: 0,
      videosCreated: 0,
      voiceovers: 0
    },
    
    status: {
      isActive: true,
      isBanned: false,
      isEmailVerified: oldData.emailVerified || false,
      accountType: 'user'
    },
    
    createdAt: oldData.createdAt,
    updatedAt: serverTimestamp(),
    lastLogin: oldData.lastLogin
  };
  
  await setDoc(userRef, newData);
  console.log(`Migrated user: ${userId}`);
};
```

---

**Last Updated**: 2026-02-04  
**Version**: 4.0 (Organized Structure with Clear IDs)  
**Author**: Antigravity AI Assistant
