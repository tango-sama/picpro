import React from 'react';
import UserMenu from './UserMenu';

const Header = ({ onLoginClick }) => {
  return (
    <header className="fixed top-0 w-full z-50 glass" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
        <div className="logo">
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Pic<span style={{ color: 'var(--primary)' }}>Pro</span>
          </h1>
        </div>

        <nav className="desktop-nav">
          <ul style={{ display: 'flex', gap: '2rem' }}>
            <li><a href="#features" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--text-main)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}>Features</a></li>
            <li><a href="#creation" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = 'var(--text-main)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}>My Creation</a></li>
          </ul>
        </nav>

        <div className="auth-buttons">
          <button className="btn btn-primary" onClick={onLoginClick} style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
            Get Started
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
