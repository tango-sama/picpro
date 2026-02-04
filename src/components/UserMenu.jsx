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
                    console.log('Creating new user document with initial credits');

                    // Determine auth method (Google or Email/Password)
                    const authMethod = authData.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email';

                    // Generate username if using Google (or use displayName if available)
                    let username = authData.name || authData.displayName;
                    if (authMethod === 'google' && !username) {
                        // Generate from email
                        const baseName = authData.email.split('@')[0];
                        username = `${baseName}${Math.floor(Math.random() * 9999)}`;
                    }

                    // Default profile picture if none provided
                    const defaultPhotoURL = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(username || 'User') + '&background=6366f1&color=fff&size=200';

                    await setDoc(userDocRef, {
                        email: authData.email,
                        displayName: authData.name || username,
                        username: username,
                        photoURL: authData.picture || authData.photoURL || defaultPhotoURL,
                        authMethod: authMethod,
                        credits: INITIAL_CREDITS,
                        createdAt: serverTimestamp(),
                        lastLogin: serverTimestamp()
                    });
                } else {
                    // Update last login
                    await setDoc(userDocRef, {
                        lastLogin: serverTimestamp()
                    }, { merge: true });
                }

                // Listen to credit changes in real-time
                const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setCredits(data.credits ?? INITIAL_CREDITS);
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
