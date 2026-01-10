import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, Sparkles, Check, Play, Zap, Globe, MessageSquare, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureTextToVoice = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetch('/auth/me', { credentials: 'include' })
            .then(res => setIsLoggedIn(res.ok))
            .catch(() => setIsLoggedIn(false));
    }, []);

    return (
        <div className="animate-fadeIn" style={{ padding: '160px 0 80px' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '3rem' }}>
                    <ArrowLeft size={18} /> Back
                </button>

                <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '1.5rem',
                        background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem', border: '1px solid rgba(236, 72, 153, 0.2)'
                    }}>
                        <Mic size={40} />
                    </div>
                    <h1 className="title-gradient" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
                        Voices That <span style={{ fontFamily: 'serif', fontWeight: 400 }}>Resonate</span>. <br /> Global scale.
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', maxWidth: '700px', margin: '0 auto' }}>
                        Generate human-like narration for your marketing content in 100+ languages and dialects.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
                    {[
                        { icon: Globe, title: "100+ Languages", text: "Reach customers worldwide with localized accents and natural phonetics." },
                        { icon: MessageSquare, title: "Emotional Intelligence", text: "Choose from various tones: Exciting, Calm, Professional, or Energetic." },
                        { icon: Zap, title: "Instant Sync", text: "Match your narration perfectly to your video commercials in one workflow." }
                    ].map((item, i) => (
                        <div key={i} className="glass" style={{ padding: '2.5rem', borderRadius: '2rem', textAlign: 'center' }}>
                            <div style={{ color: '#ec4899', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                <item.icon size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.text}</p>
                        </div>
                    ))}
                </div>

                <div className="glass" style={{
                    padding: '6rem 3rem', textAlign: 'center', borderRadius: '4rem',
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.05))',
                    border: '1px solid rgba(236, 72, 153, 0.2)'
                }}>
                    <Rocket size={48} className="text-gradient" style={{ marginBottom: '2rem' }} />
                    <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Coming Soon</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
                        Our vocal synthesizer is in final training. Get early access by joining the list.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/')} style={{ padding: '1.2rem 4rem', fontSize: '1.2rem' }}>
                        Join the Waitlist
                    </button>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Founding members get 1,000 free coins.</p>
                </div>
            </div>
        </div>
    );
};

export default FeatureTextToVoice;
