import React, { useState } from 'react';
import { Sparkles, ArrowRight, Play, ShieldCheck, Zap } from 'lucide-react';
import AuthModal from './AuthModal';

const Hero = () => {
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const handleGetStarted = () => {
        setAuthModalOpen(true);
    };

    const handleScrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="animate-fadeIn" style={{
            paddingTop: 'clamp(120px, 20vw, 180px)',
            paddingBottom: 'clamp(60px, 10vw, 100px)',
            position: 'relative',
            overflow: 'hidden'
        }}>

            {/* Visual Deco */}
            <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '500px', height: '500px', background: 'var(--primary)', filter: 'blur(200px)', opacity: '0.1', borderRadius: '50%', pointerEvents: 'none' }}></div>

            <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>

                {/* Badge */}
                <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
                    <div className="glass" style={{
                        padding: '0.6rem 1.25rem', borderRadius: '3rem', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
                        color: 'var(--text-primary)', fontWeight: 600, display: 'inline-flex',
                        alignItems: 'center', gap: '0.75rem', border: '1px solid var(--glass-border)'
                    }}>
                        <span style={{
                            background: 'var(--primary)', padding: '0.2rem 0.6rem',
                            borderRadius: '1rem', fontSize: '0.7rem', color: 'white'
                        }}>NEW</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Sparkles size={14} className="text-gradient" /> Next-Gen AI Product Studio
                        </span>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="title-gradient" style={{
                    fontSize: 'clamp(2rem, 8vw, 5.5rem)', fontWeight: '800', lineHeight: '1.05',
                    marginBottom: 'clamp(1rem, 2vw, 2rem)', letterSpacing: '-0.04em'
                }}>
                    Content that sells <br />
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(0.5rem, 1.5vw, 1rem)', flexWrap: 'wrap' }}>
                        at <i style={{ fontWeight: 400, fontFamily: 'serif' }}>warp</i> speed
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid var(--glass-border)', display: 'inline-flex' }}>
                            <Zap size={24} className="text-gradient" />
                        </div>
                    </span>
                </h1>

                {/* Subtext */}
                <p style={{
                    fontSize: 'clamp(1rem, 2vw, 1.4rem)', color: 'var(--text-secondary)',
                    maxWidth: '800px', margin: '0 auto clamp(2rem, 4vw, 3.5rem)', lineHeight: '1.6', fontWeight: 400,
                    padding: '0 1rem'
                }}>
                    The all-in-one AI creative suite for e-commerce. Transform photos, generate commercials,
                    and create voiceovers in seconds.
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', padding: '0 1rem' }}>
                    <button className="btn btn-primary" onClick={handleGetStarted} style={{ padding: 'clamp(0.9rem, 1.5vw, 1rem) clamp(1.8rem, 3vw, 2.5rem)', fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)' }}>
                        Start Creating Free
                        <ArrowRight size={20} />
                    </button>
                    <button className="btn btn-secondary" onClick={handleScrollToFeatures} style={{ padding: 'clamp(0.9rem, 1.5vw, 1rem) clamp(1.8rem, 3vw, 2.5rem)', fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)' }}>
                        <Play size={18} fill="currentColor" />
                        See how it works
                    </button>
                </div>

                {/* Trust Markers */}
                <div style={{
                    marginTop: 'clamp(3rem, 6vw, 5rem)',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'clamp(1.5rem, 3vw, 3rem)',
                    flexWrap: 'wrap',
                    opacity: 0.6
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)' }}>
                        <ShieldCheck size={18} /> Reliable AI Ops
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)' }}>
                        <Zap size={18} /> Instant Processing
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)' }}>
                        <Sparkles size={18} /> 4K Output
                    </div>
                </div>
            </div>

            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </section>
    );
};

export default Hero;
