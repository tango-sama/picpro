import React, { useState, useEffect } from 'react';
import { Layout, Image, Video, Mic, Plus, Loader2, X, Download, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';

const Dashboard = () => {
    const navigate = useNavigate();
    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetch('/auth/me', { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.idToken) {
                    try {
                        const base64Url = data.idToken.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const payload = JSON.parse(window.atob(base64));
                        setCurrentUser({ uid: payload.sub, ...payload });
                    } catch (e) {
                        console.error('Failed to parse token', e);
                    }
                }
            })
            .catch(() => setCurrentUser(null));
    }, []);

    useEffect(() => {
        const fetchCreations = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }
            try {
                const q = query(
                    collection(db, `users/${currentUser.uid}/creations`),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                );
                const querySnapshot = await getDocs(q);
                const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCreations(docs);
            } catch (error) {
                console.error("Error fetching creations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCreations();
    }, [currentUser]);

    const tools = [
        { id: 'bg-changer', title: 'Background Changer', icon: <Image size={24} />, description: 'AI background transformation.', color: '#6366f1', type: 'background-changer', path: '/tool/background-changer' },
        { id: 'img-video', title: 'Image to Video', icon: <Video size={24} />, description: 'Static images to motion.', color: '#a855f7', type: 'image-to-video', path: null },
        { id: 'txt-voice', title: 'Text to Voice', icon: <Mic size={24} />, description: 'Human-like narration.', color: '#ec4899', type: 'text-to-voice', path: null },
    ];

    const groupedCreations = tools.map(tool => ({
        ...tool,
        items: creations.filter(c => c.type === tool.type)
    })).filter(group => group.items.length > 0);

    return (
        <div className="animate-fadeIn" style={{ padding: '160px 0 80px' }}>
            <div className="container">

                {/* Header */}
                <div style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>
                        Welcome back, <span className="text-gradient">{currentUser?.name?.split(' ')[0] || 'Creator'}</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Ready to push the limits of your product visuals?</p>
                </div>

                {/* Quick Launch */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
                    {tools.map((tool) => (
                        <div key={tool.id} className="glass" style={{
                            padding: '2.5rem', borderRadius: '2rem', cursor: 'pointer',
                            transition: 'all 0.3s var(--ease-out)', position: 'relative', overflow: 'hidden'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.borderColor = `${tool.color}44`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                            }}
                            onClick={() => {
                                if (tool.path) navigate(tool.path);
                                else navigate(`/feature/${tool.id}`);
                            }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '14px',
                                background: tool.color + '15', color: tool.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
                            }}>
                                {tool.icon}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{tool.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>{tool.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: tool.color, fontWeight: 700, fontSize: '0.9rem' }}>
                                Open Tool <ArrowRight size={16} />
                            </div>
                            {tool.path === null && <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }} className="badge-soon">Soon</div>}
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Recent Creations</h3>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setLoading(true); setCreations([]); setCurrentUser({ ...currentUser }); }} // Trigger re-fetch logic
                                style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" /></svg>
                                Refresh
                            </button>
                            <button className="btn btn-secondary" onClick={() => navigate('/my-creations')}>View All</button>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                        </div>
                    ) : groupedCreations.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
                            {creations.slice(0, 8).map((item) => (
                                <div key={item.id} className="glass" style={{
                                    borderRadius: '1.5rem', overflow: 'hidden', position: 'relative',
                                    aspectRatio: '1', cursor: 'pointer'
                                }} onClick={() => item.outputUrl && setSelectedImage(item)}>
                                    <img src={item.outputUrl || item.inputUrl} alt="Creation" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {item.status === 'processing' && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                            <Loader2 className="animate-spin" size={24} />
                                            <span style={{ fontSize: '0.9rem' }}>Processing...</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass" style={{ padding: '5rem 2rem', textAlign: 'center', borderRadius: '2.5rem' }}>
                            <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                <Sparkles size={32} color="var(--text-muted)" />
                            </div>
                            <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No creations yet</h4>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Start your first project with the Background Changer.</p>
                            <button className="btn btn-primary" onClick={() => navigate('/tool/background-changer')}>
                                Go to Background Changer
                            </button>
                        </div>
                    )}
                </section>
            </div>

            {/* Modal */}
            {selectedImage && (
                <div className="animate-fadeIn" onClick={() => setSelectedImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div className="glass" style={{ position: 'relative', maxWidth: '1000px', width: '100%', padding: '2rem', borderRadius: '2.5rem' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}><X size={24} /></button>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
                            <img src={selectedImage.outputUrl} alt="Result" style={{ width: '100%', borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
                            <div>
                                <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Details</h3>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Prompt Used</p>
                                    <p style={{ fontSize: '1.1rem', lineHeight: 1.5 }}>{selectedImage.prompt}</p>
                                </div>
                                <a href={selectedImage.outputUrl} download target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                    <Download size={20} /> Download High-Res
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
