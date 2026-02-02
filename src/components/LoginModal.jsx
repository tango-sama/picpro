import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

const LoginModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);

        try {
            await signInWithGoogle();
            // Close modal on success - the auth state change will be handled by App.jsx
            onClose();
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Failed to sign in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div
                className="glass"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '2rem',
                    position: 'relative',
                    animation: 'scaleUp 0.3s ease'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        color: 'var(--text-muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Sign in to continue to PicPro</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        color: '#ef4444',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <button
                    className="btn"
                    style={{
                        width: '100%',
                        background: 'white',
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        height: '3.5rem',
                        fontSize: '1rem',
                        position: 'relative'
                    }}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={24} />
                            Signing in...
                        </>
                    ) : (
                        <>
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google"
                                style={{ width: '24px', height: '24px' }}
                            />
                            Continue with Google
                        </>
                    )}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>

                <style>
                    {`
            @keyframes scaleUp {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}
                </style>
            </div>
        </div>
    );
};

export default LoginModal;
