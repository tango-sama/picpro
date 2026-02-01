import React from 'react';
import { Check, Zap, Rocket, Crown } from 'lucide-react';

const PricingCard = ({ title, price, credits, features, recommended, icon: Icon, color }) => (
    <div className={`glass pricing-card ${recommended ? 'recommended' : ''}`} style={{
        padding: '3rem 2rem',
        borderRadius: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        transition: 'all 0.3s ease',
        border: recommended ? `2px solid ${color}` : '1px solid var(--glass-border)',
        background: recommended ? `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(${color === 'var(--primary)' ? '99, 102, 241' : '168, 85, 247'}, 0.05) 100%)` : 'var(--glass-bg)'
    }}>
        {recommended && (
            <div style={{
                position: 'absolute',
                top: '-1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: color,
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '2rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                letterSpacing: '0.05em'
            }}>MOST POPULAR</div>
        )}

        <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '1.25rem',
            background: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
        }}>
            <Icon size={32} />
        </div>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{price}</span>
            <span style={{ color: 'var(--text-secondary)' }}>/month</span>
        </div>
        <p style={{ color: color, fontWeight: '700', fontSize: '1.1rem', marginBottom: '2rem' }}>{credits} Credits</p>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', flex: 1 }}>
            {features.map((feature, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <div style={{ color: color }}><Check size={18} /></div>
                    {feature}
                </li>
            ))}
        </ul>

        <button className={`btn ${recommended ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
            Subscribe Now
        </button>
    </div>
);

const PricingPage = () => {
    const plans = [
        {
            title: "Starter",
            price: "$19",
            credits: "1,000",
            icon: Zap,
            color: "#94a3b8",
            features: [
                "1,000 AI Credits / mo",
                "Standard Processing",
                "HD Exports",
                "Email Support",
                "30-day Storage"
            ]
        },
        {
            title: "Pro",
            price: "$39",
            credits: "3,000",
            icon: Rocket,
            color: "var(--primary)",
            recommended: true,
            features: [
                "3,000 AI Credits / mo",
                "Priority Processing",
                "4K Ultra-HD Exports",
                "Advanced AI Tools",
                "Priority Support"
            ]
        },
        {
            title: "Studio",
            price: "$79",
            credits: "8,000",
            icon: Crown,
            color: "#a855f7",
            features: [
                "8,000 AI Credits / mo",
                "Instant Processing",
                "Full Commercial Rights",
                "Magic Motion Beta",
                "24/7 Dedicated Support"
            ]
        }
    ];

    return (
        <div className="animate-fadeIn" style={{ paddingTop: '160px', paddingBottom: '100px' }}>
            <div className="container">
                <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 5rem' }}>
                    <h1 className="title-gradient" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', marginBottom: '1.5rem' }}>
                        Choose Your Plan
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
                        Fuel your e-commerce growth with flexible monthly credit plans.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2.5rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {plans.map((plan, i) => (
                        <PricingCard key={i} {...plan} />
                    ))}
                </div>

                <div style={{ marginTop: '6rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '3rem' }}>Plan Details & FAQ</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>How do credits work?</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Credits are your currency in PicPro. 1 background removal = 15 credits. Credits refill every month based on your plan.</p>
                        </div>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>What is the refund policy?</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>We offer a 14-day refund window for technical failures. If the AI doesn't work as expected, we'll make it right.</p>
                        </div>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Is my data safe?</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Yes. Images are stored for 30 days and then automatically deleted. We never sell your data to third parties.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
