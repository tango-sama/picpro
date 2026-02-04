import React, { useState } from 'react';
import { X, Loader2, Mail, Lock } from 'lucide-react';
import { signInWithGoogle, signInWithEmail } from '../firebase';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
    const [authMethod, setAuthMethod] = useState('google'); // 'google' or 'email'
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(null);
    };

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

    const handleEmailSignIn = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await signInWithEmail(formData.email, formData.password);
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
                    maxWidth: '420px',
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

                {/* Auth Method Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '0.25rem',
                    borderRadius: '0.5rem'
                }}>
                    <button
                        onClick={() => setAuthMethod('google')}
                        style={{
                            flex: 1,
                            padding: '0.625rem',
                            background: authMethod === 'google' ? 'var(--accent)' : 'transparent',
                            color: authMethod === 'google' ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Google
                    </button>
                    <button
                        onClick={() => setAuthMethod('email')}
                        style={{
                            flex: 1,
                            padding: '0.625rem',
                            background: authMethod === 'email' ? 'var(--accent)' : 'transparent',
                            color: authMethod === 'email' ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Email
                    </button>
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

                {/* Google Sign In */}
                {authMethod === 'google' && (
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
                            height: '3.5rem',
                            fontSize: '1rem'
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
                )}

                {/* Email/Password Sign In */}
                {authMethod === 'email' && (
                    <form onSubmit={handleEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 3rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 3rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn"
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                height: '3rem',
                                fontSize: '1rem'
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Don't have an account?{' '}
                        <button
                            onClick={onSwitchToRegister}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent)',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '0.9rem'
                            }}
                        >
                            Create account
                        </button>
                    </p>
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
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
