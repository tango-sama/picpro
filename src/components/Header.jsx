import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Image, Video, Mic, ChevronDown, Rocket, X, Menu, Home, Info as InfoIcon, Sparkles } from 'lucide-react';
import UserMenu from './UserMenu';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const tools = [
  { id: 'bg-changer', title: 'Background Changer', icon: <Image size={20} />, description: 'AI background removal', path: '/tool/background-changer', infoPath: '/feature/background-changer', color: '#6366f1' },
  { id: 'img-video', title: 'Image to Video', icon: <Video size={20} />, description: 'AI video generation', path: null, infoPath: '/feature/image-to-video', color: '#a855f7' },
  { id: 'txt-voice', title: 'Text to Voice', icon: <Mic size={20} />, description: 'AI voiceovers', path: null, infoPath: '/feature/text-to-voice', color: '#ec4899' },
];

const Header = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Listen for login modal trigger from Hero component
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setLoginModalOpen(true);
    };
    window.addEventListener('openLoginModal', handleOpenLoginModal);
    return () => window.removeEventListener('openLoginModal', handleOpenLoginModal);
  }, []);

  const handleToolClick = (tool) => {
    setFeaturesOpen(false);
    setMobileMenuOpen(false);
    if (user) {
      if (tool.path) navigate(tool.path);
      else alert(`${tool.title} is coming soon!`);
    } else {
      navigate(tool.infoPath);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    setMobileMenuOpen(false);
    setLoginModalOpen(true);
  };

  const handleRegister = () => {
    setMobileMenuOpen(false);
    setRegisterModalOpen(true);
  };

  const switchToRegister = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(true);
  };

  const switchToLogin = () => {
    setRegisterModalOpen(false);
    setLoginModalOpen(true);
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-1000 transition-all duration-300 ${scrolled ? 'glass pt-4 pb-6' : 'pt-8 pb-10'}`}
        style={{ borderBottom: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          {/* Logo */}
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="PicPro Logo" style={{ width: '64px', height: '64px', borderRadius: '0.5rem', objectFit: 'cover' }} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.04em' }}>
              Pic<span className="text-gradient">Pro</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
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
                <span onClick={() => navigate('/pricing')}
                  style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                  onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Pricing</span>
              </li>

              <li>
                <span onClick={() => navigate('/about')}
                  style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                  onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>About</span>
              </li>
            </ul>
          </nav>

          {/* Right Side: Auth + Mobile Menu Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!user && (
              <button className="btn btn-primary desktop-only-btn" onClick={handleLogin}>
                Get Started
              </button>
            )}
            <UserMenu authData={user} />

            {/* Mobile Hamburger Button */}
            <button
              className={`hamburger-btn ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="hamburger-icon"></div>
            </button>
          </div>
        </div>
      </header >

      {/* Mobile Menu Slider */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-backdrop animate-fadeIn" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="mobile-menu-overlay animate-slideInRight">
            {/* Mobile Menu Header */}
            <div className="mobile-menu-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="/logo.png" alt="PicPro Logo" style={{ width: '56px', height: '56px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>
                  Pic<span className="text-gradient">Pro</span>
                </h2>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={24} color="var(--text-primary)" />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <div className="mobile-menu-items">
              {/* Home */}
              <div className="mobile-menu-item" onClick={() => handleNavigation('/')}>
                <div className="mobile-menu-item-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                  <Home size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '1rem' }}>Home</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Dashboard & Overview</div>
                </div>
              </div>

              {/* Tools Section */}
              <div className="mobile-menu-section-title">AI TOOLS</div>
              {tools.map((tool) => (
                <div key={tool.id} className="mobile-menu-item" onClick={() => handleToolClick(tool)}>
                  <div className="mobile-menu-item-icon" style={{ background: tool.color + '15', color: tool.color }}>
                    {tool.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{tool.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tool.description}</div>
                  </div>
                  {user && !tool.path && <span className="badge-soon">Soon</span>}
                </div>
              ))}

              {/* My Creations - Only show for logged in users */}
              {user && (
                <>
                  <div className="mobile-menu-section-title">MY WORK</div>
                  <div className="mobile-menu-item" onClick={() => handleNavigation('/my-creations')}>
                    <div className="mobile-menu-item-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                      <Sparkles size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '1rem' }}>My Creations</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>View all your projects</div>
                    </div>
                  </div>
                </>
              )}

              {/* About */}
              <div className="mobile-menu-section-title">INFO</div>
              <div className="mobile-menu-item" onClick={() => handleNavigation('/about')}>
                <div className="mobile-menu-item-icon" style={{ background: 'rgba(244, 114, 182, 0.15)', color: '#f472b6' }}>
                  <InfoIcon size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '1rem' }}>About</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Learn more about PicPro</div>
                </div>
              </div>
            </div>

            {/* Login Button for non-authenticated users */}
            {!user && (
              <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <button className="btn btn-primary" onClick={handleLogin} style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem' }}>
                  Get Started Free
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Auth Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToRegister={switchToRegister}
      />
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={switchToLogin}
      />
    </>
  );
};

export default Header;
