import React from 'react';

const PolicyLayout = ({ title, lastUpdated, children }) => (
    <div className="animate-fadeIn" style={{ paddingTop: '160px', paddingBottom: '100px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
            <h1 className="title-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>{title}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Last Updated: {lastUpdated}</p>
            <div className="glass legal-content" style={{ padding: '3rem', borderRadius: '2rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                {children}
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Questions? Contact us at <a href="mailto:support@picpro.ai" style={{ color: 'var(--primary)', textDecoration: 'none' }}>support@picpro.ai</a></p>
            </div>
        </div>
        <style>{`
            .legal-content h2 { color: var(--text-primary); margin: 2rem 0 1rem; font-size: 1.5rem; }
            .legal-content h3 { color: var(--text-primary); margin: 1.5rem 0 1rem; font-size: 1.25rem; }
            .legal-content p { margin-bottom: 1.5rem; }
            .legal-content ul { margin-bottom: 1.5rem; padding-left: 1.5rem; }
            .legal-content li { margin-bottom: 0.5rem; }
            .legal-content strong { color: var(--text-primary); }
        `}</style>
    </div>
);

const TermsOfService = () => {
    return (
        <PolicyLayout title="Terms of Service" lastUpdated="February 1, 2026">
            <h2>1. Agreement to Terms</h2>
            <p>By accessing or using PicPro AI ("the Service"), provided by PicPro AI ("Company", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</p>

            <h2>2. Description of Service</h2>
            <p>PicPro AI provides AI-powered visual editing tools, including but not limited to background removal, image-to-video generation, and text-to-voice services. The Service is credit-based and requires a monthly subscription or credit purchase.</p>

            <h2>3. Subscriptions and Credits</h2>
            <ul>
                <li><strong>Starter:</strong> $19/month (1,000 credits)</li>
                <li><strong>Pro:</strong> $39/month (3,000 credits)</li>
                <li><strong>Studio:</strong> $79/month (8,000 credits)</li>
            </ul>
            <p>Credits are deducted per operation. Unused credits at the end of a billing cycle do not roll over unless explicitly stated. Subscriptions auto-renew unless cancelled via account settings.</p>

            <h2>4. Use of Service</h2>
            <p>You agree not to use the Service for any illegal purposes or to generate content that violates third-party rights, is defamatory, or is otherwise harmful. You are solely responsible for the content you upload and generate.</p>

            <h2>5. Intellectual Property</h2>
            <p>You retain ownership of the original content you upload. PicPro AI grants you a license to use the generated output for your business purposes. You grant PicPro AI a limited license to process your content solely to provide the Service.</p>

            <h2>6. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the <strong>State of Delaware, United States</strong>, without regard to its conflict of law provisions.</p>

            <h2>7. Limitation of Liability</h2>
            <p>PicPro AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service.</p>
        </PolicyLayout>
    );
};

export default TermsOfService;
