import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import BackgroundChanger from './components/BackgroundChanger';
import MyCreationsPage from './components/MyCreationsPage';
import AboutPage from './components/AboutPage';
import FeatureBackgroundChanger from './components/FeatureBackgroundChanger';
import FeatureImageToVideo from './components/FeatureImageToVideo';
import FeatureTextToVoice from './components/FeatureTextToVoice';
import PricingPage from './components/PricingPage';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import RefundPolicy from './components/RefundPolicy';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Unauthorized');
      })
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>;
  }

  return (
    <div className="App animate-fadeIn">
      <Header user={user} />
      <main>
        <Routes>
          {/* Landing / Dashboard */}
          <Route path="/" element={
            user ? <Dashboard /> : (
              <>
                <Hero />
                <Features user={user} />
                <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                  <div className="container glass" style={{ padding: '6rem 2rem', borderRadius: '3rem' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Accelerate your growth.</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                      Join thousands of sellers who have scaled their product engagement by 300% using PicPro.
                    </p>
                    <button className="btn btn-primary" onClick={() => window.location.href = '/auth/google'} style={{ padding: '1.2rem 3rem', fontSize: '1.2rem' }}>
                      Start Designing for Free
                    </button>
                  </div>
                </div>
              </>
            )
          } />

          {/* Protected Tool Routes */}
          <Route path="/tool/background-changer" element={user ? <BackgroundChanger /> : <Navigate to="/feature/background-changer" />} />
          <Route path="/my-creations" element={user ? <MyCreationsPage /> : <Navigate to="/" />} />

          {/* Public Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/feature/background-changer" element={<FeatureBackgroundChanger />} />
          <Route path="/feature/image-to-video" element={<FeatureImageToVideo />} />
          <Route path="/feature/text-to-voice" element={<FeatureTextToVoice />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
