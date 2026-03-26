import { useState } from 'react';

export default function Navigation({ activePage, onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const linkClass = (page) => {
    if (activePage !== page) return 'navbar-link';
    if (page === 'investor-guide') return 'navbar-link active-purple';
    if (page === 'macroeconomy') return 'navbar-link active-teal';
    return 'navbar-link active';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo" onClick={() => handleNav('home')}>
          <div className="navbar-logo-icon">📈</div>
          <div className="navbar-logo-text">
            <span className="navbar-logo-name">Investarn</span>
            <span className="navbar-logo-tagline">Learn. Invest. Earn.</span>
          </div>
        </div>

        <div className="navbar-links">
          <button className={linkClass('home')} onClick={() => handleNav('home')}>Home</button>
          <button className={linkClass('investor-guide')} onClick={() => handleNav('investor-guide')}>Investor Guide</button>
          <button className={linkClass('macroeconomy')} onClick={() => handleNav('macroeconomy')}>Macroeconomy</button>
          <button className={linkClass('blog')} onClick={() => handleNav('blog')}>Blog</button>
        </div>

        <div className="navbar-actions">
          <button className="btn-signin-nav" onClick={() => handleNav('signin')}>Sign In</button>
          <button className="btn-get-started" onClick={() => handleNav('wizard')}>Get Started</button>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ padding: '0.5rem 1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid var(--border)' }}>
          <button className={linkClass('home')} onClick={() => handleNav('home')}>Home</button>
          <button className={linkClass('investor-guide')} onClick={() => handleNav('investor-guide')}>Investor Guide</button>
          <button className={linkClass('macroeconomy')} onClick={() => handleNav('macroeconomy')}>Macroeconomy</button>
          <button className={linkClass('blog')} onClick={() => handleNav('blog')}>Blog</button>
          <button className="btn-signin-nav" onClick={() => handleNav('signin')} style={{ textAlign: 'left' }}>Sign In</button>
          <button className="btn-get-started" onClick={() => handleNav('wizard')} style={{ marginTop: '0.25rem', width: 'fit-content' }}>Get Started</button>
        </div>
      )}
    </nav>
  );
}
