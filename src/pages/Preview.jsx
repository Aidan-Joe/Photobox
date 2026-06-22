import { useState, useEffect } from 'react';

function PreviewPhotoThumbnail({ photo }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!photo) return;
    const objectUrl = URL.createObjectURL(photo);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photo]);

  if (!url) {
    return <div className="preview-photo-thumbnail-placeholder" />;
  }

  return <img src={url} alt="Captured Preview" className="preview-gallery-photo" />;
}

export default function Preview({ 
  previewTimer, 
  formatTime, 
  selectedPhotos, 
  capturedPhotos, 
  onSelectPhoto, 
  onProceed, 
  selectedFrame,
  error 
}) {
  // Helper to render photo inside a frame slot
  const renderFrameSlot = (slotIndex) => {
    const photoIdx = selectedPhotos[slotIndex];
    if (photoIdx !== undefined && capturedPhotos[photoIdx]) {
      return <PreviewPhotoThumbnail photo={capturedPhotos[photoIdx]} />;
    }
    return (
      <div className="preview-frame-slot-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  };

  // Helper to determine frame style classes based on selectedFrame
  const getFrameThemeClass = () => {
    switch (selectedFrame) {
      case 1: return 'theme-soft-cloud';
      case 2: return 'theme-midnight-neon';
      case 3: return 'theme-cherry-blossom';
      case 4: return 'theme-classic-white';
      case 5: return 'theme-kawaii-kitty';
      case 6: return 'theme-retro-wave';
      default: return 'theme-soft-cloud';
    }
  };

  return (
    <div className="preview-page-container">
      {/* Top Header Bar */}
      <div className="booking-header-bar">
        <h2 className="booking-header-title">SnapBox Studio</h2>
        <div className="email-timer-capsule">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{formatTime(previewTimer)}</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="preview-main-layout">
        {/* Left Column: Interactive Live Frame Preview */}
        <div className="preview-left-column">
          <div className={`preview-sheet-mockup ${getFrameThemeClass()}`}>
            
            {/* Soft Cloud specific background elements */}
            {selectedFrame === 1 && (
              <>
                <div className="deco-pixel-yellow left-top">★</div>
                <div className="deco-mushroom left-mid">🍄</div>
                <div className="deco-pixel-yellow right-mid">★</div>
                <div className="deco-mushroom right-bottom">🍄</div>
                <div className="deco-green-blob left-bottom"></div>
                <div className="deco-green-blob right-bottom-blob"></div>
              </>
            )}

            {/* Midnight Neon specific background elements */}
            {selectedFrame === 2 && (
              <>
                <div className="neon-circle c-1"></div>
                <div className="neon-circle c-2"></div>
              </>
            )}

            {/* Cherry Blossom specific background elements */}
            {selectedFrame === 3 && (
              <>
                <div className="deco-petal p-1">🌸</div>
                <div className="deco-petal p-2">🌸</div>
                <div className="deco-petal p-3">🌸</div>
              </>
            )}

            {/* Kawaii Kitty specific background elements */}
            {selectedFrame === 5 && (
              <>
                <div className="kitty-whiskers l"></div>
                <div className="kitty-whiskers r"></div>
              </>
            )}

            {/* Retro Wave specific background elements */}
            {selectedFrame === 6 && (
              <>
                <div className="retro-grid-bg"></div>
                <div className="retro-sun-bg"></div>
              </>
            )}

            {/* We render a 2x3 grid of slots representing the layout */}
            <div className="preview-slots-grid">
              <div className="grid-slot">{renderFrameSlot(0)}</div>
              <div className="grid-slot">{renderFrameSlot(1)}</div>
              <div className="grid-slot">{renderFrameSlot(2)}</div>
              <div className="grid-slot">{renderFrameSlot(3)}</div>
              <div className="grid-slot">{renderFrameSlot(4)}</div>
              <div className="grid-slot">{renderFrameSlot(5)}</div>
            </div>

            <div className="sheet-footer-text">
              <span className="footer-brand">frame</span>
              <span className="footer-sub">YOUR JOY</span>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Subtitle, Grid, Timer and Shutter/Proceed button */}
        <div className="preview-right-column">
          <div className="preview-control-panel">
            <h1 className="preview-main-title">Choose Your Favorite Shots</h1>
            <p className="preview-main-subtitle">
              Pilih momen-momen terbaik untuk dicetak dan disimpan selamanya.
            </p>

            <div className="preview-timer-container" style={{ justifyContent: 'flex-end' }}>
              <span className="preview-selection-counter">
                ({selectedPhotos.length}/6 dipilih)
              </span>
            </div>

            {/* Photo Grid */}
            <div className="preview-photo-gallery-grid">
              {capturedPhotos.map((photo, idx) => {
                const isSelected = selectedPhotos.includes(idx);
                const orderIndex = selectedPhotos.indexOf(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => onSelectPhoto(idx)}
                    className={`preview-gallery-item ${isSelected ? 'selected' : ''}`}
                  >
                    <PreviewPhotoThumbnail photo={photo} />
                    {isSelected && (
                      <div className="preview-selection-badge">
                        {orderIndex + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button 
              onClick={onProceed} 
              className="preview-submit-btn" 
              disabled={selectedPhotos.length !== 6}
            >
              Lanjut ke Email
            </button>
            
            {error && <p className="kiosk-error" style={{ marginTop: '16px' }}>{error}</p>}
          </div>
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
