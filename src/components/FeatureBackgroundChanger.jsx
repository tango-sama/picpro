import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image, Sparkles, Check, Play, Zap, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureBackgroundChanger = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetch('/auth/me', { credentials: 'include' })
            .then(res => setIsLoggedIn(res.ok))
            .catch(() => setIsLoggedIn(false));
    }, []);

    const handleGetStarted = () => {
        if (isLoggedIn) navigate('/tool/background-changer');
        else window.location.href = '/auth/google';
    };

    return (
        <div className="animate-fadeIn" style={{ padding: '160px 0 80px' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '3rem' }}>
                    <ArrowLeft size={18} /> Back
                </button>

                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '1.5rem',
                        background: 'var(--primary-glow)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem', border: '1px solid var(--primary-glow)'
                    }}>
                        <Image size={40} />
                    </div>
                    <h1 className="title-gradient" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
                        Studio Quality. <br /> Zero Studio <span style={{ fontFamily: 'serif', fontWeight: 400 }}>Fees</span>.
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', maxWidth: '700px', margin: '0 auto' }}>
                        Transform ordinary product shots into high-end brand assets using PicPro's next-gen Background AI.
                    </p>
                </div>

                {/* Value Props */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
                    {[
                        { icon: Zap, title: "Speed to Market", text: "Launch products in minutes instead of weeks. Instant AI iterations." },
                        { icon: DollarSign, title: "Unbeatable ROI", text: "Save 90% on professional photography costs without sacrificing quality." },
                        { icon: Clock, title: "24/7 Production", text: "Your personal lighting and set crew, available whenever you need them." }
                    ].map((item, i) => (
                        <div key={i} className="glass" style={{ padding: '2.5rem', borderRadius: '2rem', textAlign: 'center' }}>
                            <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                                <item.icon size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.text}</p>
                        </div>
                    ))}
                </div>

                {/* Features List */}
                <div className="glass" style={{ padding: '4rem', borderRadius: '3rem', marginBottom: '6rem' }}>
                    <h2 style={{ fontSize: '2.2rem', marginBottom: '3rem', textAlign: 'center' }}>Engineered for Perfection</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {[
                            'Advanced semantic edge detection',
                            'Neural lighting matched to new scenes',
                            'Commercial-ready 4K high-res outputs',
                            'Unlimited AI scene variations',
                            'Cloud storage for all original assets'
                        ].map((feature, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                                <div style={{ color: 'var(--success)' }}><ShieldCheck size={20} /></div>
                                <span style={{ fontWeight: 500 }}>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div className="glass" style={{
                    padding: '6rem 3rem', textAlign: 'center', borderRadius: '4rem',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))',
                    border: '1px solid var(--primary-glow)'
                }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
                        {isLoggedIn ? 'Ready to Create?' : 'Join the Revolution.'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        {isLoggedIn
                            ? 'Your studio is open. Start transforming your assets now.'
                            : 'Sign up today and get 200 free coins to power your first campaign.'}
                    </p>
                    <button className="btn btn-primary" onClick={handleGetStarted} style={{ padding: '1.2rem 4rem', fontSize: '1.2rem' }}>
                        {isLoggedIn ? <><Play size={20} /> Launch Tool</> : <><Sparkles size={20} /> Start for Free</>}
                    </button>
                    {!isLoggedIn && <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>No credit card required.</p>}
                </div>
            </div>
        </div>
    );
};

export default FeatureBackgroundChanger;
