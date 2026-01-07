import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import MyCreation from './components/MyCreation';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import Dashboard from './components/Dashboard';
import BackgroundChanger from './components/BackgroundChanger';

import { app, analytics } from './firebase';

function AppContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Check session on mount and after login modal closes
  useEffect(() => {
    console.log("🔥 Firebase App initialized:", app.name);
    console.log("CAUTION: If you see this, Firebase is connected!", analytics);

    fetch('/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then(() => setLoggedIn(true))
      .catch(() => setLoggedIn(false));
  }, [isLoginModalOpen]);

  return (
    <div className="App">
      <Header onLoginClick={openLoginModal} />
      <main>
        <Routes>
          <Route path="/" element={
            loggedIn ? (
              <Dashboard />
            ) : (
              <>
                <Hero onLoginClick={openLoginModal} />
                <Features />
                <MyCreation />
              </>
            )
          } />
          <Route path="/tool/background-changer" element={<BackgroundChanger />} />
        </Routes>
      </main>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
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
