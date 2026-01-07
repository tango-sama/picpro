import React, { useState } from 'react';
import { X } from 'lucide-react';

const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'settings', label: 'Settings' },
    { id: 'gallery', label: 'Gallery' },
];

const AccountPanel = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('account');

    const renderContent = () => {
        switch (activeTab) {
            case 'account':
                return <p>Your account details would appear here.</p>;
            case 'settings':
                return <p>App settings and preferences.</p>;
            case 'gallery':
                return <p>Saved product images and creations.</p>;
            default:
                return null;
        }
    };

    return (
        <div
            className="glass"
            style={{
                position: 'absolute',
                top: '60px',
                right: 0,
                width: '300px',
                maxHeight: '400px',
                overflow: 'auto',
                padding: '1rem',
                zIndex: 1000,
            }}
        >
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                }}
                aria-label="Close panel"
            >
                <X size={20} />
            </button>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {tabs.map(t => (
                    <button
                        key={t.id}
                        className={activeTab === t.id ? 'btn btn-primary' : 'btn btn-secondary'}
                        onClick={() => setActiveTab(t.id)}
                        style={{ flex: 1, fontSize: '0.9rem' }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div>{renderContent()}</div>
        </div>
    );
};

export default AccountPanel;
