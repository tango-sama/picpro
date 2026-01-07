import React from 'react';

const CreationCard = ({ image, title, delay }) => (
    <div className="glass" style={{
        overflow: 'hidden', padding: 0,
        animation: 'fadeInUp 0.8s ease forwards',
        animationDelay: `${delay}s`,
        opacity: 0,
        transform: 'translateY(20px)'
    }}>
        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1' }}>
            <img src={image} alt={title} style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.5s ease'
            }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            />
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                color: 'white'
            }}>
                <p style={{ fontWeight: 600 }}>{title}</p>
            </div>
        </div>
    </div>
);

const MyCreation = () => {
    const creations = [
        { image: '/images/perfume.png', title: 'Luxury Perfume Campaign', delay: 0.1 },
        { image: '/images/sneakers.png', title: 'Viral Video Content', delay: 0.2 },
        { image: '/images/coffee.png', title: 'Cozy Brand Aesthetics', delay: 0.3 }
    ];

    return (
        <section id="creation" className="section-padding">
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '3rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
                            Made with <span className="title-gradient">PicPro</span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            See what others are creating in seconds.
                        </p>
                    </div>
                    <button className="btn btn-secondary">
                        View Gallery
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <style>
                        {`
              @keyframes fadeInUp {
                to { opacity: 1; transform: translateY(0); }
              }
            `}
                    </style>
                    {creations.map((c, i) => (
                        <CreationCard key={i} {...c} />
                    ))}
                </div>

                <div style={{ marginTop: '4rem', textAlign: 'center', padding: '3rem', background: 'var(--glass-bg)', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to transform your visual content?</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Start your free trial today. No credit card required.</p>
                    <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                        Start Creating Now
                    </button>
                </div>
            </div>
        </section>
    );
};

export default MyCreation;
