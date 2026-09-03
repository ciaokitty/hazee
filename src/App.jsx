import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BusinessCard from './components/BusinessCard';
import TeamDirectory from './components/TeamDirectory';
import QRCodeModal from './components/QRCodeModal';

import { loadTeamMembers } from './services/teamService';

const STORAGE_KEY_THEME = 'mindyourbiz_theme';

export default function App() {
  const [currentView, setCurrentView] = useState('directory');
  const [selectedMember, setSelectedMember] = useState(null);
  const [qrModalMember, setQrModalMember] = useState(null);
  const [teamMembers, setTeamMembers] = useState(null);

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_THEME) || 'light';
    } catch {
      return 'light';
    }
  });

  const baseUrl = window.location.origin + window.location.pathname;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {
      // storage unavailable; theme simply won't persist
    }
  }, [theme]);

  useEffect(() => {
    let active = true;
    loadTeamMembers().then(({ members }) => {
      if (active) setTeamMembers(members);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!teamMembers) return;

    const applyRoute = () => {
      const hash = window.location.hash;
      const userParam = new URLSearchParams(window.location.search).get('user');

      let slug = null;
      if (hash.startsWith('#/card/')) {
        slug = hash.slice('#/card/'.length);
      } else if (userParam) {
        slug = userParam;
      }

      if (slug) {
        const found = teamMembers.find(m => m.slug.toLowerCase() === slug.toLowerCase());
        if (found) {
          setSelectedMember(found);
          setCurrentView('card');
          return;
        }
      }

      setSelectedMember(null);
      setCurrentView('directory');
    };

    applyRoute();
    window.addEventListener('hashchange', applyRoute);
    return () => window.removeEventListener('hashchange', applyRoute);
  }, [teamMembers]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setCurrentView('card');
    window.location.hash = `#/card/${member.slug}`;
  };

  const getCardUrl = (slug) => `${baseUrl}#/card/${slug || selectedMember?.slug || ''}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main style={{ flex: 1 }}>
        {!teamMembers ? (
          <div className="loading-screen" role="status">
            <div className="loading-spinner" aria-hidden="true" />
            <p>Loading team...</p>
          </div>
        ) : currentView === 'card' && selectedMember ? (
          <BusinessCard
            member={selectedMember}
            cardUrl={getCardUrl(selectedMember.slug)}
            onOpenQR={(m) => setQrModalMember(m || selectedMember)}
          />
        ) : (
          <TeamDirectory
            teamMembers={teamMembers}
            baseUrl={baseUrl}
            onSelectMember={handleSelectMember}
            onOpenQR={(m) => setQrModalMember(m)}
          />
        )}
      </main>

      <QRCodeModal
        isOpen={Boolean(qrModalMember)}
        onClose={() => setQrModalMember(null)}
        member={qrModalMember}
        cardUrl={getCardUrl(qrModalMember?.slug)}
      />
    </div>
  );
}
