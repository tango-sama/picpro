import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, LogOut, Settings, Image as ImageIcon, User, Loader2, Download, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';

const INITIAL_CREDITS = 200;

const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const AccountPanel = ({ onClose, user }) => {
    const [activeTab, setActiveTab] = useState('account');
    const [creations, setCreations] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [credits, setCredits] = useState(0);
    const navigate = useNavigate();

    // Fetch credits on mount
    useEffect(() => {
        const fetchCredits = async () => {
            const userId = user?.uid || auth.currentUser?.uid;
            if (userId) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', userId));
                    if (userDoc.exists()) {
                        setCredits(userDoc.data().credits ?? INITIAL_CREDITS);
                    }
                } catch (err) {
                    console.error('Failed to fetch credits:', err);
                }
            }
        };
        fetchCredits();
    }, [user]);

    // Fetch creations when Gallery tab is active
    useEffect(() => {
        if (activeTab === 'gallery') {
            const fetchCreations = async () => {
                setLoadingGallery(true);
                try {
                    const userId = user?.uid || auth.currentUser?.uid || 'anonymous';

                    const q = query(
                        collection(db, `users/${userId}/creations`),
                        orderBy('createdAt', 'desc')
                    );
                    const querySnapshot = await getDocs(q);
                    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setCreations(docs);
                } catch (error) {
                    console.error("Error fetching gallery:", error);
                } finally {
                    setLoadingGallery(false);
                }
            };
            fetchCreations();
        }
    }, [activeTab, user]);

    const handleLogout = async () => {
        try {
            // Sign out from Firebase client
            const { signOut } = await import('../firebase');
            await signOut();

            // Clear server session cookie
            await fetch('/auth/logout', { credentials: 'include' });

            // Reload to clear all state
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            // Even if Firebase signout fails, still clear session and reload
            window.location.href = '/';
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'account':
                return (
                    <div>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>My Account</h3>
                        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {user && user.picture ? (
                                <img
                                    src={user.picture}
                                    alt={user.name || "Profile"}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid rgba(255,255,255,0.2)'
                                    }}
                                />
                            ) : (
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={24} />
                                </div>
                            )}
                            <div>
                                <p style={{ fontWeight: '600', fontSize: '1rem' }}>{user?.name || 'User'}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</p>
                            </div>
                        </div>
                        {/* Credits Display */}
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1rem',
                            background: 'rgba(255, 215, 0, 0.1)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 215, 0, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Coins size={20} style={{ color: '#ffd700' }} />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Available Credits</span>
                            </div>
                            <span style={{ fontWeight: '700', color: '#ffd700', fontSize: '1.1rem' }}>{credits}</span>
                        </div>
                        <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(50, 255, 50, 0.1)', borderRadius: '8px', border: '1px solid rgba(50, 255, 50, 0.2)' }}>
                            <p style={{ color: '#4ade80', fontSize: '0.8rem', textAlign: 'center' }}>✓ Signed in with Google</p>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Settings</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Preferences coming soon.</p>
                    </div>
                );
            case 'gallery':
                return (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>My Gallery</h3>
                        {loadingGallery ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <Loader2 className="animate-spin" size={24} />
                            </div>
                        ) : creations.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', overflowY: 'auto', paddingBottom: '1rem' }}>
                                {creations.map((item) => (
                                    <div
                                        key={item.id}
                                        className="glass"
                                        style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                                        onClick={() => item.outputUrl && setSelectedImage(item)}
                                    >
                                        <img
                                            src={item.outputUrl || item.inputUrl}
                                            alt={item.prompt || "Creation"}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {item.status === 'processing' && (
                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Loader2 className="animate-spin" size={20} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                                <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <p>No creations yet.</p>
                                <p style={{ fontSize: '0.8rem' }}>Use the Background Changer to create something new!</p>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return ReactDOM.createPortal(
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 9998,
                }}
            />

            <div
                className="glass"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '320px',
                    padding: '0',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideIn 0.3s ease-out',
                    borderLeft: '1px solid var(--glass-border)',
                    borderRight: 'none',
                    borderRadius: 0
                }}
            >
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Menu</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '1rem', flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                        {tabs.map(t => {
                            const Icon = t.icon;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        justifyContent: 'flex-start',
                                        padding: '0.75rem 1rem',
                                        border: activeTab === t.id ? 'none' : '1px solid transparent'
                                    }}
                                >
                                    <Icon size={18} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ padding: '0 0.5rem', height: '100%' }}>
                        {renderContent()}
                    </div>
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <button
                        onClick={handleLogout}
                        className="btn btn-secondary"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            color: '#ff4444',
                            borderColor: 'rgba(255, 68, 68, 0.3)',
                            background: 'rgba(255, 68, 68, 0.1)'
                        }}
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.9)',
                        zIndex: 10000,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '50%'
                        }}
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={selectedImage.outputUrl}
                        alt={selectedImage.prompt || "Creation"}
                        style={{ maxWidth: '90%', maxHeight: '70vh', borderRadius: '12px', objectFit: 'contain' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '500px' }}>
                        {selectedImage.prompt || 'No description'}
                    </p>
                    <a
                        href={selectedImage.outputUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Download size={18} /> Download
                    </a>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </>,
        document.body
    );
};

export default AccountPanel;
