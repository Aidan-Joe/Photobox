import y2kCyberBg from '../assets/y2k_cyber_bg.png';

export default function Welcome({ onStart }) {
  return (
    <div className="welcome-container y2k-theme">
      {/* Y2K Cyber Background Image Layer */}
      <div
        className="y2k-bg-image-layer"
        style={{ backgroundImage: `url(${y2kCyberBg})` }}
      />
      <div className="y2k-bg-overlay" />

      {/* Electric Lightning Bolts Overlay */}
      <div className="y2k-lightning lightning-1">
        <svg viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 0L20 90H55L15 200L85 85H45L75 0H50Z" fill="url(#lightningGrad1)" opacity="0.85" />
          <defs>
            <linearGradient id="lightningGrad1" x1="0" y1="0" x2="100" y2="200">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#e2f952" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="y2k-lightning lightning-2">
        <svg viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 0L10 100H50L5 200L90 75H45L80 0H45Z" fill="url(#lightningGrad2)" opacity="0.8" />
          <defs>
            <linearGradient id="lightningGrad2" x1="100" y1="0" x2="0" y2="200">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Prismatic Orbs & Liquid Chrome Elements */}
      <div className="y2k-orb orb-pink" />
      <div className="y2k-orb orb-cyan" />
      <div className="y2k-orb orb-lime" />

      {/* Top Header Icons */}
      <div className="welcome-header">
        <button className="welcome-header-icon" title="Help">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="welcome-header-svg">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
        <button className="welcome-header-icon" title="Language">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="welcome-header-svg">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </button>
      </div>

      {/* Center Content (without card background) */}
      <div className="welcome-content">
        <h1 
          className="welcome-title y2k-chrome-title" 
          style={{ fontSize: '64px', maxWidth: '850px', textAlign: 'center', lineHeight: '1.15' }}
        >
          Touch to Start Your Aesthetic Journey
        </h1>
        <button
          className="welcome-btn y2k-neon-btn"
          onClick={onStart}
          style={{ marginTop: '36px' }}
        >
          <span>Start Session</span>
        </button>
      </div>

      {/* Welcome Footer */}
      <div className="welcome-footer y2k-footer">
        <div className="connection-status">
          <span className="wifi-icon"></span>
          <span>Connected</span>
        </div>
        <div>© 2026 CuitBox. All rights reserved.</div>
      </div>
    </div>
  );
}
