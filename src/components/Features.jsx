import React from 'react';
import { Image, Video, Mic, Wand2 } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <div className="glass" style={{ padding: '2rem', transition: 'transform 0.3s ease', cursor: 'default' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{
            width: '60px', height: '60px', borderRadius: '1rem',
            background: `rgba(${color}, 0.1)`, dateColor: `rgb(${color})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.5rem', color: `rgb(${color})`
        }}>
            <Icon size={32} />
        </div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '700' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{description}</p>
    </div>
);

const Features = () => {
    const features = [
        {
            icon: Image,
            title: "Background Changer",
            description: "Instantly remove cluttered backgrounds and replace them with professional studio settings or creative scenes.",
            color: "99, 102, 241" // Indigo
        },
        {
            icon: Video,
            title: "Image to Video",
            description: "Turn your static product photos into dynamic videos that grab attention on social media feeds.",
            color: "244, 114, 182" // Pink
        },
        {
            icon: Mic,
            title: "Text to Voice",
            description: "Generate natural-sounding voiceovers for your product videos in seconds. No recording studio needed.",
            color: "16, 185, 129" // Emerald
        }
    ];

    return (
        <section id="features" className="section-padding" style={{ position: 'relative' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
                        Everything You Need to <span className="title-gradient">Sell More</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Powerful tools designed specifically for e-commerce growth.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {features.map((f, i) => (
                        <FeatureCard key={i} {...f} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
