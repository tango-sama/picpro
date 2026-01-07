import React, { useEffect, useState } from 'react';

const AccountManagement = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/auth/me', { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Not authenticated');
                return res.json();
            })
            .then(data => {
                // For demo we just show the raw ID token; in a real app you would decode it
                setUserInfo({ idToken: data.idToken });
            })
            .catch(err => setError(err.message));
    }, []);

    const handleLogout = () => {
        fetch('/auth/logout', { credentials: 'include' })
            .then(() => {
                // reload page to reflect logged‑out state
                window.location.reload();
            })
            .catch(console.error);
    };

    if (error) {
        return <p style={{ color: 'var(--text-muted)' }}>{error}</p>;
    }

    if (!userInfo) {
        return <p style={{ color: 'var(--text-muted)' }}>Loading user info…</p>;
    }

    return (
        <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Account Details</h3>
            <pre style={{ background: 'var(--glass-bg)', padding: '0.5rem', borderRadius: '0.5rem', overflowX: 'auto' }}>
                {JSON.stringify(userInfo, null, 2)}
            </pre>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ marginTop: '1rem' }}>
                Log Out
            </button>
        </div>
    );
};

export default AccountManagement;
