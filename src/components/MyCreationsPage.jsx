import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image, Video, Mic, Loader2, X, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './CreationCard.css';

const INITIAL_CREDITS = 200;

const tools = [
    { id: 'all', title: 'All', icon: null, color: '#6366f1', type: null },
    { id: 'bg-changer', title: 'Background Changer', icon: <Image size={18} />, color: '#6366f1', type: 'background-changer' },
    { id: 'img-video', title: 'Image to Video', icon: <Video size={18} />, color: '#a855f7', type: 'image-to-video' },
    { id: 'txt-voice', title: 'Text to Voice', icon: <Mic size={18} />, color: '#ec4899', type: 'text-to-voice' },
];

const MyCreationsPage = ({ user }) => {
    const navigate = useNavigate();
    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedImage, setSelectedImage] = useState(null);

    // Fetch creations when user is available
    useEffect(() => {
        const fetchCreations = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const q = query(
                    collection(db, `users/${user.uid}/creations`),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log('Loaded creations:', docs);
                setCreations(docs);
            } catch (error) {
                console.error("Error fetching creations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCreations();
    }, [user]);

    // Filter creations by type
    const filteredCreations = activeFilter === 'all'
        ? creations
        : creations.filter(c => c.type === tools.find(t => t.id === activeFilter)?.type);

    // Get counts for each category
    const getCategoryCount = (type) => {
        if (type === null) return creations.length;
        return creations.filter(c => c.type === type).length;
    };

    const handleDelete = async (creationId) => {
        if (!confirm('Are you sure you want to delete this creation?')) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/creations`, creationId));
            setCreations(creations.filter(c => c.id !== creationId));
            setSelectedImage(null);
        } catch (error) {
            console.error("Error deleting creation:", error);
            alert("Failed to delete creation.");
        }
    };

    return (
        <div className="container" style={{ padding: '120px 2rem 60px' }}>
            <button
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}
            >
                <ArrowLeft size={20} /> Back to Dashboard
            </button>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Creations</h2>
                <p style={{ color: 'var(--text-muted)' }}>View and manage all your generated content</p>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveFilter(tool.id)}
                        className={`btn ${activeFilter === tool.id ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        {tool.icon}
                        {tool.title}
                        <span style={{
                            background: activeFilter === tool.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                            padding: '0.1rem 0.5rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem'
                        }}>
                            {getCategoryCount(tool.type)}
                        </span>
                    </button>
                ))}
                <button
                    onClick={() => window.location.reload()}
                    className="btn btn-secondary"
                    style={{
                        marginLeft: 'auto', // Push to right
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" /></svg>
                    Refresh
                </button>
            </div>

            {/* Creations Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className="animate-spin" size={40} />
                </div>
            ) : filteredCreations.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 250px))', gap: '1.5rem' }}>
                    {filteredCreations.map((item) => (
                        <div
                            key={item.id}
                            className="creation-card glass"
                            style={{
                                aspectRatio: '1',
                                borderRadius: '1rem',
                                overflow: 'hidden',
                                position: 'relative',
                                cursor: item.outputUrl ? 'pointer' : 'default'
                            }}
                            onClick={() => item.outputUrl && setSelectedImage(item)}
                        >
                            {item.outputUrl || item.inputUrl ? (
                                <img
                                    src={item.outputUrl || item.inputUrl}
                                    alt={item.prompt || "Creation"}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML += '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: rgba(255,255,255,0.05);"><p style="color: var(--text-muted);">Image not available</p></div>';
                                    }}
                                />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(255,255,255,0.05)' }}>
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                                        {item.status === 'processing' ? 'Processing...' : 'No preview'}
                                    </p>
                                </div>
                            )}
                            <div className="creation-overlay" style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '1.5rem 1rem 1rem',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            }}>
                                <p style={{
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    {item.status === 'processing' ? '⏳ Processing...' : (item.prompt || 'Untitled')}
                                </p>

                                {item.outputUrl && (
                                    <div style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'auto' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImage(item);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                background: 'rgba(99, 102, 241, 0.8)',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => e.target.style.background = 'rgba(99, 102, 241, 1)'}
                                            onMouseLeave={e => e.target.style.background = 'rgba(99, 102, 241, 0.8)'}
                                        >
                                            👁️ View
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                background: 'rgba(239, 68, 68, 0.8)',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 1)'}
                                            onMouseLeave={e => e.target.style.background = 'rgba(239, 68, 68, 0.8)'}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                            {item.status === 'processing' && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader2 className="animate-spin" size={24} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        {activeFilter === 'all'
                            ? "You haven't created anything yet."
                            : `No creations in this category.`}
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/tool/background-changer')}>
                        Try Background Changer
                    </button>
                </div>
            )}

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
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(selectedImage.id);
                        }}
                        className="btn btn-secondary"
                        style={{
                            marginTop: '1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginLeft: '1rem',
                            color: 'var(--error)',
                            borderColor: 'rgba(239, 68, 68, 0.2)',
                            background: 'rgba(239, 68, 68, 0.1)'
                        }}
                    >
                        <Trash2 size={18} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyCreationsPage;
