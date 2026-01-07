import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const Hero = ({ onLoginClick }) => {
    return (
        <section className="section-padding" style={{ paddingTop: '160px', minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative' }}>

            {/* Background Elements */}
            <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: '0.2', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '300px', height: '300px', background: 'var(--accent)', filter: 'blur(150px)', opacity: '0.2', borderRadius: '50%' }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <span className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={16} />
                        AI-Powered E-commerce Magic
                    </span>
                </div>

                <h1 className="title-gradient" style={{ fontSize: '4rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                    Make Your Products <br /> Look Irresistible
                </h1>

                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
                    Stop struggling with expensive photography. Create professional backgrounds, videos, and voiceovers instantly.
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={onLoginClick}>
                        Get Perfect Products Shots
                        <ArrowRight size={20} />
                    </button>
                    <button className="btn btn-secondary">
                        Explore Features
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
