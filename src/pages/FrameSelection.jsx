import { useState, useEffect } from 'react';

export default function FrameSelection({ frames, selectedFrame, onSelect, onProceed }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600 seconds)

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const categories = ['All', 'Minimalist', 'Cute', 'Seasonal', 'Pop Art'];

  const filteredFrames = selectedCategory === 'All' 
    ? frames 
    : frames.filter(f => f.category === selectedCategory);

  // Helper to render premium design preview based on ID
  const renderFramePreview = (id) => {
    switch(id) {
      case 1: // Soft Cloud
        return (
          <div className="frame-preview-box preview-soft-cloud">
            <div className="polaroid-wrapper">
              <div className="polaroid-img-box">
                <div className="cloud-bubble cloud-1" />
                <div className="cloud-bubble cloud-2" />
              </div>
            </div>
          </div>
        );
      case 2: // Midnight Neon
        return (
          <div className="frame-preview-box preview-midnight-neon">
            <div className="neon-border-wrapper">
              <div className="neon-inner-box" />
            </div>
          </div>
        );
      case 3: // Cherry Blossom
        return (
          <div className="frame-preview-box preview-cherry-blossom">
            <div className="cherry-border-wrapper">
              <div className="petal-shape petal-1" />
              <div className="petal-shape petal-2" />
              <div className="petal-shape petal-3" />
              <div className="petal-shape petal-4" />
              <div className="cherry-inner-box" />
            </div>
          </div>
        );
      case 4: // Classic White
        return (
          <div className="frame-preview-box preview-classic-white">
            <div className="phone-wrapper">
              <div className="phone-notch" />
              <div className="phone-screen" />
            </div>
          </div>
        );
      case 5: // Kawaii Kitty
        return (
          <div className="frame-preview-box preview-kawaii-kitty">
            <div className="kitty-wrapper">
              <div className="kitty-ear left" />
              <div className="kitty-ear right" />
              <div className="kitty-screen" />
            </div>
          </div>
        );
      case 6: // Retro Wave
        return (
          <div className="frame-preview-box preview-retro-wave">
            <div className="retro-sun" />
            <div className="retro-grid" />
          </div>
        );
      default:
        return (
          <div className="frame-preview-box preview-default" />
        );
    }
  };

  return (
    <div className="frame-selection-container">
      {/* Top Header Bar */}
      <div className="booking-header-bar">
        <h2 className="booking-header-title">SnapBox Studio</h2>
        <div className="frame-timer-capsule">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="frame-content-wrapper">
        <div className="frame-title-container">
          <h1 className="frame-selection-title">Choose Your Frame</h1>
          <p className="frame-selection-subtitle">
            Select a theme that matches your vibe.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="frame-categories-bar">
          <div className="frame-categories-capsule">
            {categories.map((category) => (
              <button
                key={category}
                className={`frame-category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Frames Grid */}
        <div className="frame-grid">
          {filteredFrames.map((frame) => {
            const isSelected = selectedFrame === frame.id;
            return (
              <div
                key={frame.id}
                onClick={() => onSelect(frame.id)}
                className={`frame-card-item ${isSelected ? 'selected' : ''}`}
              >
                <div className="frame-preview-container">
                  {renderFramePreview(frame.id)}
                  {isSelected && (
                    <div className="frame-selected-checkmark">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="frame-card-name">{frame.name}</h3>
                <p className="frame-card-desc">{frame.description}</p>
              </div>
            );
          })}
        </div>

        {/* Footer Actions Row */}
        <div className="frame-actions-footer">
          <button
            className="btn-lanjut"
            disabled={!selectedFrame}
            onClick={onProceed}
            style={{ 
              marginLeft: 'auto', 
              opacity: selectedFrame ? 1 : 0.6,
              cursor: selectedFrame ? 'pointer' : 'not-allowed'
            }}
          >
            Lanjut
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer bar */}
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
