import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Image, Video, Mic, ChevronDown, Rocket, Layout, Info } from 'lucide-react';
import UserMenu from './UserMenu';

const tools = [
  { id: 'bg-changer', title: 'Background Changer', icon: <Image size={18} />, description: 'AI background removal', path: '/tool/background-changer', infoPath: '/feature/background-changer', color: '#6366f1' },
  { id: 'img-video', title: 'Image to Video', icon: <Video size={18} />, description: 'AI video generation', path: null, infoPath: '/feature/image-to-video', color: '#a855f7' },
  { id: 'txt-voice', title: 'Text to Voice', icon: <Mic size={18} />, description: 'AI voiceovers', path: null, infoPath: '/feature/text-to-voice', color: '#ec4899' },
];

const Header = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!featuresOpen) return;
    const handleGlobalClick = (e) => {
      if (!e.target.closest('.features-dropdown-container')) setFeaturesOpen(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [featuresOpen]);

  const handleToolClick = (tool) => {
    setFeaturesOpen(false);
    if (user) {
      if (tool.path) navigate(tool.path);
      else alert(`${tool.title} is coming soon!`);
    } else {
      navigate(tool.infoPath);
    }
  };

  const handleLogin = () => {
    window.location.href = '/auth/google';
  };

  return (
    <header className={`fixed top-0 w-full z-1000 transition-all duration-300 ${scrolled ? 'glass pt-4 pb-6' : 'pt-8 pb-10'}`}
      style={{ borderBottom: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        {/* Logo */}
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Rocket size={18} color="white" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.04em' }}>
            Pic<span className="text-gradient">Pro</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="desktop-nav">
          <ul style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>

            {/* Features */}
            <li style={{ position: 'relative' }} className="features-dropdown-container">
              <span
                onClick={(e) => { e.stopPropagation(); setFeaturesOpen(!featuresOpen); }}
                style={{
                  color: featuresOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => !featuresOpen && (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Features
                <ChevronDown size={14} style={{ transform: featuresOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </span>

              {featuresOpen && (
                <div className="glass" style={{
                  position: 'absolute', top: 'calc(100% + 1rem)', right: '-120px',
                  minWidth: '320px', padding: '1rem', zIndex: 1001, animation: 'fadeInUp 0.2s ease',
                  borderRadius: '1.25rem', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)'
                }} onClick={(e) => e.stopPropagation()}>
                  {tools.map((tool) => (
                    <div key={tool.id} onClick={() => handleToolClick(tool)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                        borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '12px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', background: tool.color + '15', color: tool.color
                      }}> {tool.icon} </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '2px' }}>{tool.title}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.2' }}>{tool.description}</p>
                      </div>
                      {user && !tool.path && <span className="badge-soon">Soon</span>}
                    </div>
                  ))}
                </div>
              )}
            </li>

            {user && (
              <li>
                <span onClick={() => navigate('/my-creations')}
                  style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                  onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>My Creations</span>
              </li>
            )}

            <li>
              <span onClick={() => navigate('/about')}
                style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>About</span>
            </li>
          </ul>
        </nav>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!user && (
            <button className="btn btn-primary" onClick={handleLogin}>
              Get Started
            </button>
          )}
          <UserMenu authData={user} />
        </div>
      </div>
    </header>
  );
};

export default Header;
