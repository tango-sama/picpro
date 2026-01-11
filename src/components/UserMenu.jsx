import React, { useState, useEffect } from 'react';
import { User, Coins } from 'lucide-react';
import AccountPanel from './AccountPanel';
import { auth, signInWithCredential, GoogleAuthProvider, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

const INITIAL_CREDITS = 200;

const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to parse JWT", e);
        return null;
    }
};

const UserMenu = ({ authData }) => {
    const [user, setUser] = useState(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [credits, setCredits] = useState(0);

    useEffect(() => {
        if (!authData || !authData.idToken) {
            setUser(null);
            return;
        }

        const processAuth = async () => {
            const data = authData;
            if (data.idToken) {
                const decoded = parseJwt(data.idToken);
                if (decoded) {
                    const userId = decoded.sub;
                    setUser({ ...decoded, uid: userId, idToken: data.idToken });

                    const userDocRef = doc(db, 'users', userId);
                    const userDoc = await getDoc(userDocRef);

                    if (!userDoc.exists()) {
                        await setDoc(userDocRef, { credits: INITIAL_CREDITS, createdAt: serverTimestamp() });
                    }

                    onSnapshot(userDocRef, (docSnap) => {
                        if (docSnap.exists()) {
                            setCredits(docSnap.data().credits ?? INITIAL_CREDITS);
                        }
                    });

                    try {
                        const credential = GoogleAuthProvider.credential(data.idToken);
                        await signInWithCredential(auth, credential);
                    } catch (err) { }
                }
            }
        };

        processAuth();
    }, [authData]);

    if (!user) return null;

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
                {user.picture ? (
                    <img
                        src={user.picture}
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
            {panelOpen && <AccountPanel user={user} onClose={() => setPanelOpen(false)} />}
        </div>
    );
};

export default UserMenu;
