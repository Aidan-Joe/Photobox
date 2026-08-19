import welcomeGradientBg from '../assets/welcome_gradient_bg.png';
import polaroidFriends from '../assets/welcome_polaroid_1.png';
import polaroidChristmas from '../assets/welcome_polaroid_2.png';
import polaroidCouple from '../assets/welcome_polaroid_3.png';

export default function Welcome({ onStart }) {
  return (
    <div className="welcome-container aesthetic-theme">
      {/* Background Image Layer */}
      <div
        className="aesthetic-bg-image-layer"
        style={{ backgroundImage: `url(${welcomeGradientBg})` }}
      />

      {/* Decorative Polaroid Overlays */}
      <div className="aesthetic-polaroid polaroid-christmas">
        <img src={polaroidChristmas} alt="Christmas Polaroid" />
      </div>
      <div className="aesthetic-polaroid polaroid-couple">
        <img src={polaroidCouple} alt="Couple Polaroid" />
      </div>
      <div className="aesthetic-polaroid polaroid-friends">
        <img src={polaroidFriends} alt="Friends Polaroid" />
      </div>


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

      {/* Center Content */}
      <div className="welcome-content">
        <h1 className="aesthetic-title">
          Cuitbox Studio
        </h1>
        <p className="aesthetic-subtitle">
          Tap here to start your photoshoot
        </p>
        <button
          className="aesthetic-btn"
          onClick={onStart}
        >
          <span>Start Session</span>
        </button>
      </div>

      {/* Welcome Footer */}
      <div className="welcome-footer">
        <div className="connection-status">
          <span className="wifi-icon"></span>
          <span>Connected</span>
        </div>
        <div>© 2026 CuitBox. All rights reserved.</div>
      </div>
    </div>
  );
}
