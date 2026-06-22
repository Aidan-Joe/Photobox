import photostripChristmas from '../assets/photostrip_christmas.png';
import polaroidCouple from '../assets/polaroid_couple.png';
import photostripFriendsBlue from '../assets/photostrip_friends_blue.png';

export default function Welcome({ onStart }) {
  return (
    <div className="welcome-container">
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

      {/* Floating Polaroids */}
      <div className="polaroid-card card-christmas">
        <img 
          src={photostripChristmas} 
          alt="Christmas Photo Strip" 
          className="polaroid-photo"
          style={{ width: '130px', height: '280px' }}
        />
      </div>

      <div className="polaroid-card card-couple">
        <img 
          src={polaroidCouple} 
          alt="Couple Polaroid" 
          className="polaroid-photo"
          style={{ width: '160px', height: '160px' }}
        />
      </div>

      <div className="polaroid-card card-friends">
        <img 
          src={photostripFriendsBlue} 
          alt="Friends Photo Strip" 
          className="polaroid-photo"
          style={{ width: '130px', height: '280px' }}
        />
      </div>

      {/* Center Content */}
      <div className="welcome-content">
        <h1 className="welcome-title">SnapBox Studio</h1>
        <p className="welcome-subtitle">Touch to Start Your Aesthetic Journey</p>
        <button 
          className="welcome-btn"
          onClick={onStart}
        >
          Start Session
        </button>
      </div>

      {/* Welcome Footer */}
      <div className="welcome-footer">
        <div className="connection-status">
          <span className="wifi-icon"></span>
          <span>Connected</span>
        </div>
        <div>© 2026 PhotoBox. All rights reserved.</div>
      </div>
    </div>
  );
}
