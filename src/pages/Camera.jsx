import { useState, useEffect } from 'react';

// Sub-component to safely convert Blob data to Object URL and handle revoking to prevent memory leaks
function PhotoThumbnail({ photo }) {
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
    return <div className="camera-recent-shot-photo-placeholder" />;
  }

  return <img src={url} alt="Captured" className="camera-recent-shot-photo" />;
}

export default function Camera({ videoRef, photoIndex, countdown, selectedFrame, capturedPhotos = [], error, onCapture, isFlashing, activePreviewPhoto, isCountingDown, isTimerPaused, frames = [] }) {
  const [activePreviewUrl, setActivePreviewUrl] = useState('');

  useEffect(() => {
    if (!activePreviewPhoto) {
      setActivePreviewUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(activePreviewPhoto);
    setActivePreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [activePreviewPhoto]);

  const currentFrame = frames.find(f => String(f.id) === String(selectedFrame));

  const normalizeFrameId = (id) => {
    const idStr = String(id || '');
    const match = idStr.match(/FRM-0*(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      return ((num - 1) % 6) + 1;
    }
    if (idStr === '1' || idStr === 'frm_demo_001') return 1;
    if (idStr === '2' || idStr === 'frm_demo_002') return 2;
    if (idStr === '3' || idStr === 'frm_demo_003') return 3;
    if (idStr === '4' || idStr === 'frm_demo_004') return 4;
    if (idStr === '5' || idStr === 'frm_demo_005') return 5;
    if (idStr === '6' || idStr === 'frm_demo_006') return 6;
    return Number(idStr) || 1;
  };

  // Helper to determine the overlay class
  const getOverlayClass = (frameId) => {
    const frameNum = normalizeFrameId(frameId);
    switch (frameNum) {
      case 1: return 'overlay-soft-cloud';
      case 2: return 'overlay-midnight-neon';
      case 3: return 'overlay-cherry-blossom';
      case 4: return 'overlay-classic-white';
      case 5: return 'overlay-kawaii-kitty';
      case 6: return 'overlay-retro-wave';
      default: return 'overlay-default';
    }
  };

  return (
    <div className="camera-page-container">
      {/* Top Header Bar */}
      <div className="booking-header-bar">
        <h2 className="booking-header-title">SnapBox Studio</h2>
        <div className="photo-counter-badge">
          Photo {Math.min(photoIndex + 1, 10)} / 10
        </div>
      </div>

      {/* Success Toast */}
      {activePreviewPhoto && (
        <div className="camera-success-toast">
          <svg className="toast-check-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Photo Captured Successfully!</span>
        </div>
      )}

      {/* Main content wrapper */}
      <div className="camera-content-wrapper">
        <div className="frame-title-container">
          <h1 className="frame-selection-title">
            {countdown > 0 ? 'Get Ready!' : 'Smile!'}
          </h1>
          <p className="frame-selection-subtitle">
            Hold your pose, the camera captures automatically!
          </p>
        </div>

        {/* Sidebar + Camera Main Layout */}
        <div className="camera-main-layout">
          {/* Left Column - Captured Photos Sidebar */}
          <div className="camera-recent-shots-container">
            <h3 className="camera-recent-shots-title">RECENT SHOTS</h3>
            <div className="camera-recent-shots-grid">
              {capturedPhotos.map((photo, idx) => {
                const isLatest = idx === capturedPhotos.length - 1;
                return (
                  <div key={idx} className={`camera-recent-shot-card ${isLatest ? 'latest-captured' : ''}`}>
                    <PhotoThumbnail photo={photo} />
                    <div className="camera-recent-shot-badge">{idx + 1}</div>
                  </div>
                );
              })}
              
              {/* Exactly one active placeholder for the next shot */}
              {photoIndex < 10 && (
                <div className="camera-recent-shot-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Camera stream with frame overlay */}
          <div className="camera-view-container">
            <div className="camera-video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`camera-video-element ${countdown > 0 ? 'camera-video-blur' : ''}`}
              />
              {/* The selected frame border overlay */}
              <div className={`camera-frame-overlay ${getOverlayClass(selectedFrame)}`} />
              
              {/* Huge countdown overlay */}
              {countdown > 0 && (
                <div className="camera-countdown-overlay-simple">
                  <div className="countdown-number-simple">
                    {countdown}
                  </div>
                </div>
              )}

              {/* White flash overlay */}
              {isFlashing && <div className="camera-flash-overlay" />}
            </div>

            <button
              className="camera-shutter-btn"
              onClick={onCapture}
              disabled={photoIndex >= 10 || isCountingDown || isTimerPaused}
            >
              <span className="shutter-btn-dot" />
              {isCountingDown ? 'Siap-siap...' : 'Ambil Foto'}
            </button>
          </div>
        </div>

        {/* Bottom step progress indicators (dots) */}
        <div className="camera-step-dots">
          {Array.from({ length: 10 }).map((_, i) => {
            let dotClass = 'dot-future';
            if (i < photoIndex) {
              dotClass = 'dot-completed';
            } else if (i === photoIndex) {
              dotClass = 'dot-current';
            }
            return (
              <div key={i} className={`step-dot ${dotClass}`} />
            );
          })}
        </div>

        {error && <p className="kiosk-error" style={{ marginTop: '10px' }}>{error}</p>}
      </div>

      {/* Footer bar */}
      <div className="welcome-footer">
        <div className="camera-status-chip">
          <span className="status-dot green-dot" />
          Camera Connected
        </div>
        <div className="copyright-text">© 2026 PhotoBox. All rights reserved.</div>
      </div>

      {/* Instant Preview Overlay */}
      {activePreviewUrl && (
        <div className="camera-instant-preview-overlay">
          <div className="camera-instant-preview-card">
            <div className="camera-instant-preview-badge">Nice Shot!</div>
            <img src={activePreviewUrl} alt="Instant Preview" className="camera-instant-preview-image" />
          </div>
        </div>
      )}
    </div>
  );
}
