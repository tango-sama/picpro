import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
            const body = mode === 'login'
                ? { email, password }
                : { email, password, name };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Success! Reload to get new session
            window.location.reload();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        window.location.href = '/auth/google';
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
        }} onClick={onClose}>
            <div
                className="glass animate-scaleIn"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: 'clamp(2rem, 4vw, 2.5rem)',
                    position: 'relative',
                    borderRadius: '2rem'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {mode === 'login' ? 'Sign in to continue to PicPro' : 'Start creating stunning visuals'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.75rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                                Name
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    required={mode === 'signup'}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 2.75rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '0.75rem',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                            Email
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 2.75rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                                required
                                minLength={mode === 'signup' ? 8 : undefined}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 2.75rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            height: '3.25rem',
                            fontSize: '1rem',
                            fontWeight: 700,
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {loading && <Loader2 size={20} className="animate-spin" />}
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div style={{ position: 'relative', textAlign: 'center', margin: '1.5rem 0' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--glass-border)' }} />
                    <span style={{ position: 'relative', background: 'var(--bg-card)', padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        OR
                    </span>
                </div>

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
                        marginBottom: '1.5rem',
                        height: '3.25rem',
                        fontSize: '1rem',
                        fontWeight: 600
                    }}
                    onClick={handleGoogleSignIn}
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        style={{ width: '20px', height: '20px' }}
                    />
                    Continue with Google
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <span
                        onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login');
                            setError('');
                        }}
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                    >
                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </span>
                </p>

                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                    By continuing, you agree to our{' '}
                    <a href="/terms" style={{ color: 'var(--primary)' }}>Terms</a> and{' '}
                    <a href="/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</a>
                </p>

                <style>{`
                    @keyframes scaleIn {
                        from { transform: scale(0.95); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    .animate-scaleIn {
                        animation: scaleIn 0.2s ease-out;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default AuthModal;
