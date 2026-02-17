# 🔢 User ID System Documentation

## Overview
PicPro uses a **dual ID system** for clear user identification and database organization:

1. **Firebase UID** - Immutable, cryptographic identifier
2. **User Number** - Readable, sequential number for admin/analytics

---

## Dual ID System

### 1. Firebase UID (Primary Key)
```javascript
userId: "xR7k9mP3Q4aB8cD2eF6..."
```
- **Format**: Alphanumeric string (28 characters)
- **Source**: Firebase Authentication
- **Unique**: Guaranteed by Firebase
- **Use Case**: Security, database operations, authentication

### 2. User Number (Human-Readable ID)
```javascript
userNumber: 1234
```
- **Format**: Sequential integer (1, 2, 3, 4...)
- **Source**: Auto-incremented counter in Firestore
- **Unique**: Yes
- **Use Case**: Admin panel, analytics, customer support, user badges

---

## How It Works

### Auto-Incrementing Counter

We use a Firestore counter document to track the next available user number:

```javascript
// Database path: /metadata/counters
{
  nextUserNumber: 1234,
  totalUsers: 1233,
  lastUpdated: Timestamp
}
```

### User Creation Flow

```
1. User signs up with Google/Email
2. Firebase Auth creates account → generates UID
3. System requests next user number from counter
4. Counter increments atomically
5. User document created with both IDs:
   - userId: "xR7k9mP3Q4..."  (Firebase UID)
   - userNumber: 1234          (Sequential)
6. Both IDs stored in user profile
```

---

## Database Structure

### User Document
```javascript
/users/{firebase-uid}/
{
  // === IDENTIFIERS ===
  userId: "xR7k9mP3Q4aB8cD2eF6...",     // Firebase UID
  userNumber: 1234,                      // Sequential ID
  userDisplayId: "USER_1234",            // Formatted: USER_0001
  
  // === PROFILE ===
  profile: {
    email: "user@example.com",
    username: "johndoe",
    displayName: "John Doe",
    ...
  },
  ...
}
```

### Counter Document
```javascript
/metadata/counters
{
  nextUserNumber: 1235,                  // Next available number
  totalUsers: 1234,                      // Total users created
  lastUpdated: Timestamp,                // Last increment time
  createdAt: Timestamp                   // Counter creation time
}
```

---

## Display Formats

You can format the user number in different ways:

| Format | Example | Use Case |
|--------|---------|----------|
| Raw Number | `1234` | Database queries, calculations |
| Padded | `0001234` | Fixed-width displays |
| Prefixed | `USER_1234` | Customer support tickets |
| Hash-Style | `#1234` | Social media, badges |

### Implementation

```javascript
// Generate user display ID
function formatUserDisplayId(userNumber) {
  return `USER_${String(userNumber).padStart(4, '0')}`;
}

// Examples:
formatUserDisplayId(1)     // "USER_0001"
formatUserDisplayId(42)    // "USER_0042"
formatUserDisplayId(1234)  // "USER_1234"
formatUserDisplayId(99999) // "USER_99999"
```

---

## Benefits

### ✅ Security + Usability
- **Firebase UID**: Secure, non-guessable (for authentication)
- **User Number**: Readable, memorable (for humans)

### ✅ Customer Support
```
Support: "What's your user ID?"
Customer: "USER_1234"
Support: *finds user instantly*
```

### ✅ Analytics & Reports
```sql
-- Easy to generate reports
SELECT * FROM users 
WHERE userNumber BETWEEN 1000 AND 2000
ORDER BY userNumber ASC
```

### ✅ Achievements & Badges
```
🎉 Congratulations! You're user #1000!
🌟 Early adopter badge (USER_0001 - USER_0100)
```

### ✅ Growth Tracking
```javascript
// Track growth over time
const usersThisMonth = users.filter(u => {
  return u.userNumber >= monthStartNumber && 
         u.userNumber <= monthEndNumber;
});
```

---

## Implementation Code

### Creating Counter (One-Time Setup)
```javascript
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Initialize counter (run once)
async function initializeCounter(db) {
  const counterRef = doc(db, 'metadata', 'counters');
  await setDoc(counterRef, {
    nextUserNumber: 1,
    totalUsers: 0,
    lastUpdated: serverTimestamp(),
    createdAt: serverTimestamp()
  });
}
```

### Getting Next User Number
```javascript
import { doc, runTransaction } from 'firebase/firestore';

async function getNextUserNumber(db) {
  const counterRef = doc(db, 'metadata', 'counters');
  
  const userNumber = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    
    if (!counterDoc.exists()) {
      // Initialize if doesn't exist
      transaction.set(counterRef, {
        nextUserNumber: 2,
        totalUsers: 1,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      return 1;
    }
    
    const currentNumber = counterDoc.data().nextUserNumber;
    
    // Increment for next user
    transaction.update(counterRef, {
      nextUserNumber: currentNumber + 1,
      totalUsers: currentNumber,
      lastUpdated: serverTimestamp()
    });
    
    return currentNumber;
  });
  
  return userNumber;
}
```

### Creating User with Both IDs
```javascript
async function createUserProfile(db, user, authMethod) {
  // Get sequential user number
  const userNumber = await getNextUserNumber(db);
  
  // Format display ID
  const userDisplayId = `USER_${String(userNumber).padStart(4, '0')}`;
  
  // Create user document
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    // Identifiers
    userId: user.uid,                    // Firebase UID
    userNumber: userNumber,              // Sequential: 1, 2, 3...
    userDisplayId: userDisplayId,        // Formatted: USER_0001
    
    // Profile
    profile: {
      email: user.email,
      username: generateUsername(user),
      displayName: user.displayName || generateUsername(user),
      photoURL: user.photoURL || generateDefaultAvatar(user),
      bio: '',
      emailVerified: user.emailVerified
    },
    
    // Authentication
    authentication: {
      method: authMethod,
      provider: authMethod === 'google' ? 'google.com' : 'password',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      loginCount: 1
    },
    
    // Billing
    billing: {
      credits: 200,
      totalCreditsEarned: 200,
      totalCreditsSpent: 0,
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      nextBillingDate: null
    },
    
    // Stats
    stats: {
      totalGenerations: 0,
      backgroundChanges: 0,
      videosCreated: 0,
      voiceovers: 0
    },
    
    // Status
    status: {
      isActive: true,
      isBanned: false,
      isEmailVerified: user.emailVerified,
      accountType: 'user'
    },
    
    // Timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  });
  
  console.log(`✅ Created user #${userNumber} (${userDisplayId}): ${user.email}`);
}
```

---

## Query Examples

### Find User by Number
```javascript
const q = query(
  collection(db, 'users'), 
  where('userNumber', '==', 1234)
);
```

### Get Recent Users
```javascript
const q = query(
  collection(db, 'users'),
  orderBy('userNumber', 'desc'),
  limit(10)
);
```

### Get Users in Range
```javascript
const q = query(
  collection(db, 'users'),
  where('userNumber', '>=', 1000),
  where('userNumber', '<=', 2000)
);
```

### Get Total User Count
```javascript
const counterRef = doc(db, 'metadata', 'counters');
const counterSnap = await getDoc(counterRef);
const totalUsers = counterSnap.data().totalUsers;
console.log(`Total users: ${totalUsers}`);
```

---

## Display in UI

### User Profile Badge
```jsx
function UserBadge({ userNumber }) {
  const displayId = `USER_${String(userNumber).padStart(4, '0')}`;
  
  return (
    <div className="user-badge">
      <span className="badge-id">{displayId}</span>
      <span className="badge-label">Member</span>
    </div>
  );
}
```

### Admin Panel
```jsx
function AdminUserRow({ user }) {
  return (
    <tr>
      <td>{user.userNumber}</td>
      <td>{user.userDisplayId}</td>
      <td>{user.profile.email}</td>
      <td>{user.profile.username}</td>
      <td>{user.billing.credits}</td>
    </tr>
  );
}
```

---

## Security Considerations

### ✅ Safe to Display
- User numbers are sequential and public
- Not security-sensitive (unlike UIDs)
- Can be shown in public profiles, leaderboards

### ⚠️ Keep UIDs Private
- Never expose Firebase UIDs publicly
- Used only for authentication and database operations
- Critical for security

### 🔒 Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can see their own userNumber
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
    
    // Counter is read-only for clients
    match /metadata/counters {
      allow read: if request.auth != null;
      allow write: if false;  // Only server can write
    }
  }
}
```

---

## Migration for Existing Users

If you have existing users without `userNumber`, use this migration:

```javascript
async function migrateExistingUsers(db) {
  // Get all users
  const usersRef = collection(db, 'users');
  const usersSnap = await getDocs(usersRef);
  
  // Sort by creation date
  const users = usersSnap.docs.sort((a, b) => {
    return a.data().createdAt?.toMillis() - b.data().createdAt?.toMillis();
  });
  
  // Assign numbers in order
  let userNumber = 1;
  
  for (const userDoc of users) {
    const userData = userDoc.data();
    
    // Skip if already has userNumber
    if (userData.userNumber) {
      userNumber = Math.max(userNumber, userData.userNumber + 1);
      continue;
    }
    
    // Assign user number
    const userDisplayId = `USER_${String(userNumber).padStart(4, '0')}`;
    
    await updateDoc(userDoc.ref, {
      userNumber: userNumber,
      userDisplayId: userDisplayId,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Migrated: ${userData.profile.email} → ${userDisplayId}`);
    userNumber++;
  }
  
  // Update counter
  const counterRef = doc(db, 'metadata', 'counters');
  await setDoc(counterRef, {
    nextUserNumber: userNumber,
    totalUsers: userNumber - 1,
    lastUpdated: serverTimestamp(),
    createdAt: serverTimestamp()
  });
  
  console.log(`✅ Migration complete. Next user number: ${userNumber}`);
}
```

---

## Best Practices

### ✅ DO
- Use `userNumber` for display, reports, customer support
- Use `userId` (Firebase UID) for authentication and security
- Store both IDs in every user document
- Use transactions when incrementing counter

### ❌ DON'T
- Don't use `userNumber` for authentication
- Don't skip numbers (keep sequential)
- Don't allow clients to modify counter directly
- Don't expose Firebase UIDs publicly

---

**Last Updated**: 2026-02-06  
**Version**: 1.0  
**Status**: Ready for Implementation
