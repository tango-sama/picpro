import React from 'react';
import { Image, Video, Mic, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description, color, path, infoPath, user }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (user && path) navigate(path);
        else navigate(infoPath);
    };

    return (
        <div className="glass"
            style={{
                padding: '2.5rem', borderRadius: '2rem', transition: 'all 0.4s var(--ease-out)',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', height: '100%'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px)';
                e.currentTarget.style.borderColor = `rgba(${color}, 0.3)`;
                e.currentTarget.style.boxShadow = `0 20px 40px -10px rgba(${color}, 0.2)`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.3)';
            }}
            onClick={handleClick}
        >
            <div style={{
                width: '64px', height: '64px', borderRadius: '1.25rem',
                background: `linear-gradient(135deg, rgba(${color}, 0.2), rgba(${color}, 0.05))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '2rem', color: `rgb(${color})`, border: `1px solid rgba(${color}, 0.2)`
            }}>
                <Icon size={32} />
            </div>

            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '2rem', flex: 1 }}>{description}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: `rgb(${color})` }}>
                Learn more <ArrowUpRight size={16} />
            </div>
        </div>
    );
};

const Features = ({ user }) => {
    const features = [
        {
            icon: Image,
            title: "Background AI",
            description: "Remove messy backgrounds and replace them with studio-quality scenes instantly.",
            color: "99, 102, 241",
            path: "/tool/background-changer",
            infoPath: "/feature/background-changer"
        },
        {
            icon: Video,
            title: "Magic Motion",
            description: "Convert any product photo into a high-converting video commercial.",
            color: "168, 85, 247",
            path: null,
            infoPath: "/feature/image-to-video"
        },
        {
            icon: Mic,
            title: "AI Voiceover",
            description: "Add human-like narration to your ads in 100+ languages.",
            color: "236, 72, 153",
            path: null,
            infoPath: "/feature/text-to-voice"
        }
    ];

    return (
        <section id="features" className="section-padding" style={{ position: 'relative' }}>
            <div className="container">
                <div style={{ maxWidth: '800px', margin: '0 auto 5rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.04em' }}>
                        The Creative <span className="text-gradient">Engine</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
                        One suite, infinite possibilities. Everything you need to scale your brand's visuals.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                    {features.map((f, i) => (
                        <FeatureCard key={i} {...f} user={user} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
