import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import AccountPanel from './AccountPanel';

const UserMenu = () => {
    const [user, setUser] = useState(null);
    const [panelOpen, setPanelOpen] = useState(false);

    useEffect(() => {
        // Attempt to fetch user info; if not logged in, response will be 401
        fetch('/auth/me', { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Not logged in');
                return res.json();
            })
            .then(data => {
                // For demo we just store the raw id token; in a real app you'd decode it
                setUser({ idToken: data.idToken });
            })
            .catch(() => setUser(null));
    }, []);

    if (!user) return null; // hide icon when not logged in

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setPanelOpen(!panelOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    padding: 0,
                    marginRight: '1rem'
                }}
                aria-label="User menu"
            >
                <User size={28} />
            </button>
            {panelOpen && <AccountPanel onClose={() => setPanelOpen(false)} />}
        </div>
    );
};

export default UserMenu;
