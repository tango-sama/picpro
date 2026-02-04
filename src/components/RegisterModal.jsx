import React, { useState } from 'react';
import { X, Loader2, Mail, Lock, User } from 'lucide-react';
import { registerWithEmail } from '../firebase';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(null); // Clear error when user types
    };

    const validateForm = () => {
        if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return false;
        }

        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            await registerWithEmail(formData.email, formData.password, formData.username);
            // Close modal on success - the auth state change will be handled by App.jsx
            onClose();
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message || 'Failed to create account. Please try again.');
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
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Join PicPro and start creating</p>
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

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Email Field */}
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

                    {/* Username Field */}
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
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

                    {/* Password Field */}
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password (min. 6 characters)"
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

                    {/* Confirm Password Field */}
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
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

                    {/* Register Button */}
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
                            fontSize: '1rem',
                            marginTop: '0.5rem'
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent)',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '0.9rem'
                            }}
                        >
                            Sign in
                        </button>
                    </p>
                </div>

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

export default RegisterModal;
