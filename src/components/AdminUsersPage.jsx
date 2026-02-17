import React, { useState, useEffect } from 'react';
import { Users, Hash, Mail, Calendar, Shield, Ban, CheckCircle } from 'lucide-react';
import { getUserStatistics, listAllUsers, migrateExistingUsers } from '../utils/userMigration';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [migrating, setMigrating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersList, userStats] = await Promise.all([
                listAllUsers(),
                getUserStatistics()
            ]);
            setUsers(usersList);
            setStats(userStats);
        } catch (error) {
            console.error('Error loading admin data:', error);
            alert('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const handleMigration = async () => {
        if (!window.confirm('Are you sure you want to migrate existing users? This will assign user numbers to users who don\'t have them yet.')) {
            return;
        }

        setMigrating(true);
        try {
            const result = await migrateExistingUsers();
            alert(`Migration complete!\nMigrated: ${result.migrated}\nSkipped: ${result.skipped}\nNext number: ${result.nextUserNumber}`);
            await loadData();
        } catch (error) {
            console.error('Migration error:', error);
            alert('Migration failed: ' + error.message);
        } finally {
            setMigrating(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
                    <h2>Loading User Data...</h2>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={32} />
                User Management Dashboard
            </h1>

            {/* Statistics Cards */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="glass" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Users</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.totalUsers}</div>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>With User Numbers</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>{stats.withUserNumbers}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {stats.withoutUserNumbers > 0 && `${stats.withoutUserNumbers} need migration`}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Credits</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fbbf24' }}>{stats.totalCreditsInCirculation.toLocaleString()}</div>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Auth Methods</div>
                        <div style={{ fontSize: '0.875rem' }}>
                            <div>Google: {stats.authMethods.google}</div>
                            <div>Email: {stats.authMethods.email}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Migration Button */}
            {stats && stats.withoutUserNumbers > 0 && (
                <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#fbbf24' }}>⚠️ Migration Required</h3>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        {stats.withoutUserNumbers} user(s) don't have user numbers assigned yet.
                    </p>
                    <button
                        onClick={handleMigration}
                        disabled={migrating}
                        className="btn-primary"
                        style={{ opacity: migrating ? 0.6 : 1 }}
                    >
                        {migrating ? 'Migrating...' : 'Run Migration'}
                    </button>
                </div>
            )}

            {/* Users Table */}
            <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <h2 style={{ marginBottom: '1rem' }}>All Users</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>#</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>User ID</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Username</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Credits</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tier</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Auth</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Created</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.firebaseUid} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '0.75rem' }}>
                                    {user.userDisplayId ? (
                                        <span style={{ fontWeight: '600', color: '#6366f1' }}>{user.userDisplayId}</span>
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>No ID</span>
                                    )}
                                </td>
                                <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {user.firebaseUid.substring(0, 8)}...
                                </td>
                                <td style={{ padding: '0.75rem' }}>{user.email}</td>
                                <td style={{ padding: '0.75rem' }}>{user.username}</td>
                                <td style={{ padding: '0.75rem', color: '#fbbf24', fontWeight: '600' }}>{user.credits}</td>
                                <td style={{ padding: '0.75rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem',
                                        background: user.tier === 'free' ? 'rgba(156, 163, 175, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                        color: user.tier === 'free' ? '#9ca3af' : '#6366f1'
                                    }}>
                                        {user.tier}
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem' }}>{user.authMethod}</span>
                                </td>
                                <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {user.createdAt?.toLocaleDateString()}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    {user.isBanned ? (
                                        <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>🚫 Banned</span>
                                    ) : user.isActive ? (
                                        <span style={{ color: '#10b981', fontSize: '0.75rem' }}>✓ Active</span>
                                    ) : (
                                        <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Inactive</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsersPage;
