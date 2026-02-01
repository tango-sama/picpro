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
                <p style={{ color: 'var(--text-muted)' }}>Need a refund? Contact us at <a href="mailto:support@picpro.ai" style={{ color: 'var(--primary)', textDecoration: 'none' }}>support@picpro.ai</a></p>
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

const RefundPolicy = () => {
    return (
        <PolicyLayout title="Refund Policy" lastUpdated="February 1, 2026">
            <h2>1. Refund Eligibility</h2>
            <p>At PicPro AI, we strive for perfection but understand that technical issues can occur. You are eligible to request a refund within <strong>14 days</strong> of your purchase under the following conditions:</p>
            <ul>
                <li><strong>Technical Failures:</strong> The AI tool consistently fails to generate a usable result due to system errors.</li>
                <li><strong>Billing Errors:</strong> You were charged incorrectly or double-charged for a subscription.</li>
            </ul>

            <h2>2. Non-Refundable Items</h2>
            <p>The following are not eligible for refunds:</p>
            <ul>
                <li><strong>Unused Credits:</strong> Monthly subscription credits that were not used during the billing cycle.</li>
                <li><strong>Subjective Quality:</strong> Dissatisfaction with AI artistic output where the tool functioned correctly according to technical specifications.</li>
                <li><strong>Account Termination:</strong> Any credits remaining on an account terminated for violation of our Terms of Service.</li>
            </ul>

            <h2>3. Subscription Cancellations</h2>
            <p>You may cancel your subscription at any time through your dashboard. Cancellation prevents future billing but does not trigger an automatic refund of the current month's fee unless eligibility criteria in Section 1 are met.</p>

            <h2>4. Process</h2>
            <p>To request a refund, please email <strong>support@picpro.ai</strong> with your account email and a description of the technical failure, including screenshots if possible. We process all requests within 5-7 business days.</p>

            <h2>5. Jurisdiction</h2>
            <p>This policy is governed by the laws of the <strong>State of Delaware, United States</strong>.</p>
        </PolicyLayout>
    );
};

export default RefundPolicy;
