import React from 'react';
import { Twitter, Instagram, Linkedin, Github } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ borderTop: '1px solid var(--glass-border)', marginTop: '4rem', padding: '4rem 0 2rem' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                            Pic<span style={{ color: 'var(--primary)' }}>Pro</span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Empowering e-commerce brands with AI-driven visual tools.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Product</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <li><a href="#" className="hover:text-white">Features</a></li>
                            <li><a href="#" className="hover:text-white">Pricing</a></li>
                            <li><a href="#" className="hover:text-white">Gallery</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Company</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <li><a href="#" className="hover:text-white">About</a></li>
                            <li><a href="#" className="hover:text-white">Blog</a></li>
                            <li><a href="#" className="hover:text-white">Careers</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Connect</h4>
                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
                            <Twitter size={20} style={{ cursor: 'pointer' }} />
                            <Instagram size={20} style={{ cursor: 'pointer' }} />
                            <Linkedin size={20} style={{ cursor: 'pointer' }} />
                            <Github size={20} style={{ cursor: 'pointer' }} />
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <p>© 2024 PicPro. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
