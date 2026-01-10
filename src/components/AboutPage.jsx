import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Zap, Shield, Heart, Target, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetch('/auth/me', { credentials: 'include' })
            .then(res => setIsLoggedIn(res.ok))
            .catch(() => setIsLoggedIn(false));
    }, []);

    return (
        <div className="container" style={{ padding: '160px 2rem 80px', maxWidth: '1000px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                style={{ marginBottom: '3rem' }}
            >
                <ArrowLeft size={18} /> Back Home
            </button>

            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '4rem', marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
                    Visual Content <br /> Reimagined.
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                    PicPro is building the ultimate AI creative studio for the next generation of e-commerce brands.
                </p>
            </div>

            {/* Mission Statement */}
            <div className="glass" style={{ padding: '4rem 3rem', marginBottom: '5rem', textAlign: 'center', borderRadius: '3rem' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--primary-glow)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--primary)' }}>
                    <Sparkles size={32} />
                </div>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Our Mission</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1.8 }}>
                    We believe that <strong style={{ color: 'var(--text-primary)' }}>every product deserves to shine</strong>.
                    PicPro puts the power of professional-grade AI tools in your hands — making professional-quality
                    content creation accessible to everyone, from solo entrepreneurs to global brands.
                </p>
            </div>

            {/* Values Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
                {[
                    { icon: Zap, title: "Lightning Fast", text: "Generate stunning product visuals in seconds, keeping your creative momentum alive.", color: "var(--primary)" },
                    { icon: Target, title: "Precision First", text: "Our AI is tuned for e-commerce, ensuring pixel-perfect results that look authentic.", color: "var(--secondary)" },
                    { icon: Shield, title: "Total Privacy", text: "Your data and creations are yours. We provide a secure environment for your brand assets.", color: "var(--accent)" }
                ].map((item, i) => (
                    <div key={i} className="glass" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem', color: item.color, display: 'flex', justifyContent: 'center' }}>
                            <item.icon size={40} strokeWidth={1.5} />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>{item.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>{item.text}</p>
                    </div>
                ))}
            </div>

            {/* Story Section */}
            <div style={{ marginBottom: '6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ height: '2px', flex: 1, background: 'linear-gradient(to right, transparent, var(--glass-border))' }}></div>
                    <h2 style={{ fontSize: '2rem' }}>The PicPro Story</h2>
                    <div style={{ height: '2px', flex: 1, background: 'linear-gradient(to left, transparent, var(--glass-border))' }}></div>
                </div>
                <div className="glass" style={{ padding: '3rem', borderRadius: '2.5rem', lineHeight: 1.9, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    <p style={{ marginBottom: '1.5rem' }}>
                        It started with a simple observation: professional photography is often the biggest bottleneck for growing brands.
                        Expensive equipment, complex software, and studio logistics hold back creativity.
                    </p>
                    <p style={{ marginBottom: '1.5rem' }}>
                        We knew AI could solve this. We built PicPro to be the creative partner humans actually want to use—one
                        that understands lighting, composition, and brand aesthetic effortlessly.
                    </p>
                    <p>
                        Today, we're helping thousands of creators tell their product's story without the friction.
                        This is just the beginning.
                    </p>
                </div>
            </div>

            {/* Final CTA */}
            <div className="glass" style={{
                padding: '6rem 3rem',
                textAlign: 'center',
                borderRadius: '4rem',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(244, 114, 182, 0.1))',
                border: '1px solid var(--primary-glow)'
            }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Ready to Scale?</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3.5rem', fontSize: '1.25rem' }}>
                    Join the future of creative e-commerce production.
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/auth/google'}
                    style={{ padding: '1.2rem 3.5rem', fontSize: '1.2rem' }}
                >
                    <Rocket size={20} /> Get Started Now
                </button>
            </div>
        </div>
    );
};

export default AboutPage;
