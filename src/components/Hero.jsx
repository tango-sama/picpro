import React from 'react';
import { Sparkles, ArrowRight, Play, ShieldCheck, Zap } from 'lucide-react';

const Hero = () => {
    const handleGetStarted = () => {
        window.location.href = '/auth/google';
    };

    const handleScrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="animate-fadeIn" style={{ paddingTop: '180px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>

            {/* Visual Deco */}
            <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '500px', height: '500px', background: 'var(--primary)', filter: 'blur(200px)', opacity: '0.1', borderRadius: '50%', pointerEvents: 'none' }}></div>

            <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>

                {/* Badge */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div className="glass" style={{
                        padding: '0.6rem 1.25rem', borderRadius: '3rem', fontSize: '0.85rem',
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
                    fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: '800', lineHeight: '1.05',
                    marginBottom: '2rem', letterSpacing: '-0.04em'
                }}>
                    Content that sells <br />
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        at <i style={{ fontWeight: 400, fontFamily: 'serif' }}>warp</i> speed
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid var(--glass-border)', display: 'inline-flex' }}>
                            <Zap size={24} className="text-gradient" />
                        </div>
                    </span>
                </h1>

                {/* Subtext */}
                <p style={{
                    fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--text-secondary)',
                    maxWidth: '800px', margin: '0 auto 3.5rem', lineHeight: '1.6', fontWeight: 400
                }}>
                    The all-in-one AI creative suite for e-commerce. Transform photos, generate commercials,
                    and create voiceovers in seconds.
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button className="btn btn-primary" onClick={handleGetStarted} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        Start Creating Free
                        <ArrowRight size={20} />
                    </button>
                    <button className="btn btn-secondary" onClick={handleScrollToFeatures} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        <Play size={18} fill="currentColor" />
                        See how it works
                    </button>
                </div>

                {/* Trust Markers */}
                <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', opacity: 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <ShieldCheck size={18} /> Reliable AI Ops
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <Zap size={18} /> Instant Processing
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <Sparkles size={18} /> 4K Output
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
