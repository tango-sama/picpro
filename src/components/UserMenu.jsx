import React, { useState, useEffect } from 'react';
import { User, Coins } from 'lucide-react';
import AccountPanel from './AccountPanel';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const INITIAL_CREDITS = 200;

const UserMenu = ({ authData }) => {
    const [credits, setCredits] = useState(0);
    const [panelOpen, setPanelOpen] = useState(false);

    useEffect(() => {
        if (!authData || !authData.uid) {
            return;
        }

        const initializeUser = async () => {
            const userId = authData.uid;
            const userDocRef = doc(db, 'users', userId);

            try {
                // Check if user document exists, if not create it
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    console.log('✅ Creating new user account in database...');

                    // Determine authentication method
                    const authMethod = authData.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email';

                    // Generate or extract username
                    let username = authData.name || authData.displayName;
                    if (authMethod === 'google' && !username) {
                        // Auto-generate username from email
                        const baseName = authData.email.split('@')[0];
                        username = `${baseName}${Math.floor(Math.random() * 9999)}`;
                    }

                    // Generate default avatar if no photo provided
                    const defaultPhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'User')}&background=6366f1&color=fff&size=200`;

                    // Create structured user document with clear field organization
                    const newUserData = {
                        // === ACCOUNT IDENTIFIERS ===
                        userId: authData.uid,                    // Firebase UID (primary identifier)
                        userNumber: null,                        // Sequential user number (will be set by admin/cloud function)

                        // === PROFILE INFORMATION ===
                        profile: {
                            email: authData.email,               // User's email address
                            username: username,                  // Unique username
                            displayName: authData.name || username,  // Display name for UI
                            photoURL: authData.picture || authData.photoURL || defaultPhotoURL,  // Profile picture URL
                            bio: '',                             // User bio (empty by default)
                            emailVerified: authData.emailVerified || false  // Email verification status
                        },

                        // === AUTHENTICATION INFO ===
                        authentication: {
                            method: authMethod,                  // 'google' or 'email'
                            provider: authData.providerData?.[0]?.providerId || 'password',  // Full provider ID
                            createdAt: serverTimestamp(),        // Account creation timestamp
                            lastLogin: serverTimestamp(),        // Last login timestamp
                            loginCount: 1                        // Number of logins
                        },

                        // === BILLING & CREDITS ===
                        billing: {
                            credits: INITIAL_CREDITS,            // Current credit balance
                            totalCreditsEarned: INITIAL_CREDITS, // Lifetime credits earned
                            totalCreditsSpent: 0,                // Lifetime credits spent
                            subscriptionTier: 'free',            // 'free', 'starter', 'pro', 'studio'
                            subscriptionStatus: 'active',        // 'active', 'cancelled', 'expired'
                            nextBillingDate: null                // Next billing date (null for free tier)
                        },

                        // === USAGE STATISTICS ===
                        stats: {
                            totalGenerations: 0,                 // Total AI generations created
                            backgroundChanges: 0,                // Background changer usage count
                            videosCreated: 0,                    // Videos created count
                            voiceovers: 0                        // Voiceovers created count
                        },

                        // === ACCOUNT STATUS ===
                        status: {
                            isActive: true,                      // Account active status
                            isBanned: false,                     // Ban status
                            isEmailVerified: authData.emailVerified || false,  // Email verification
                            accountType: 'user'                  // 'user', 'admin', 'moderator'
                        },

                        // === TIMESTAMPS (Top-level for easy querying) ===
                        createdAt: serverTimestamp(),            // Account creation
                        updatedAt: serverTimestamp(),            // Last profile update
                        lastLogin: serverTimestamp()             // Last login
                    };

                    await setDoc(userDocRef, newUserData);
                    console.log(`✅ User account created successfully!`);
                    console.log(`   Email: ${authData.email}`);
                    console.log(`   Username: ${username}`);
                    console.log(`   Auth Method: ${authMethod}`);
                    console.log(`   Initial Credits: ${INITIAL_CREDITS}`);

                } else {
                    // User exists - update login information
                    const existingData = userDoc.data();
                    const loginCount = (existingData.authentication?.loginCount || 0) + 1;

                    await setDoc(userDocRef, {
                        lastLogin: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        'authentication.lastLogin': serverTimestamp(),
                        'authentication.loginCount': loginCount
                    }, { merge: true });

                    console.log(`✅ User logged in - Login count: ${loginCount}`);
                }

                // Listen to credit changes in real-time
                const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Support both new nested structure and legacy flat structure
                        const userCredits = data.billing?.credits ?? data.credits ?? INITIAL_CREDITS;
                        setCredits(userCredits);
                    }
                });

                return unsubscribe;
            } catch (error) {
                console.error('Error initializing user:', error);
            }
        };

        const unsubscribe = initializeUser();

        return () => {
            if (unsubscribe && typeof unsubscribe.then === 'function') {
                unsubscribe.then(unsub => unsub && unsub());
            }
        };
    }, [authData]);

    if (!authData) return null;

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }}>

            {/* Credits Counter */}
            <div className="glass" style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.8rem', borderRadius: '2rem',
                border: '1px solid rgba(255, 215, 0, 0.2)', background: 'rgba(255, 215, 0, 0.05)'
            }}>
                <Coins size={14} style={{ color: '#fbbf24' }} />
                <span style={{ fontWeight: '700', color: '#fbbf24', fontSize: '0.85rem' }}>{credits}</span>
            </div>

            {/* Profile */}
            <button
                onClick={() => setPanelOpen(!panelOpen)}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, display: 'flex', alignItems: 'center',
                    transition: 'transform 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {authData.picture ? (
                    <img
                        src={authData.picture}
                        alt="Profile"
                        style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            objectFit: 'cover', border: '2px solid var(--glass-border)'
                        }}
                    />
                ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} color="var(--text-secondary)" />
                    </div>
                )}
            </button>
            {panelOpen && <AccountPanel user={authData} onClose={() => setPanelOpen(false)} />}
        </div>
    );
};

export default UserMenu;
