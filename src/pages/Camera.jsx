import { useState, useEffect } from 'react';
import DslrLiveView from '../components/DslrLiveView.jsx';

// Sub-component to safely convert Blob data to Object URL and handle revoking to prevent memory leaks
function PhotoThumbnail({ photo }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!photo) {
      setUrl('');
      return;
    }
    if (typeof photo === 'string') {
      setUrl(photo);
      return;
    }
    // Jika objek placeholder unduhan latar belakang, gunakan properti URL secara langsung
    if (photo && photo.url) {
      setUrl(photo.url);
      return;
    }
    if (photo instanceof Blob) {
      const objectUrl = URL.createObjectURL(photo);
      setUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setUrl('');
    }
  }, [photo]);

  if (!url) {
    return <div className="camera-recent-shot-photo-placeholder" />;
  }

  return <img src={url} alt="Captured" className="camera-recent-shot-photo" />;
}

export default function Camera({
  videoRef,
  photoIndex,
  countdown,
  selectedFrame,
  capturedPhotos = [],
  error,
  onCapture,
  onRetake,
  onKeep,
  canRetake = true,
  reviewCountdown,
  captureDelay,
  setCaptureDelay,
  isFlashing,
  activePreviewPhoto,
  isCountingDown,
  isTimerPaused,
  frames = [],
  cameraDevices = [],
  selectedDeviceId = '',
  onSelectCameraDevice,
  liveViewTimestamp,
  isCapturing
}) {
  const [activePreviewUrl, setActivePreviewUrl] = useState('');
  // NOTE: watchdog reconnect (polling-based dan interval-based) yang dulu
  // ada di sini sudah tidak diperlukan lagi -- komponen <DslrLiveView>
  // sekarang menangani deteksi stall + reconnect-nya sendiri secara
  // internal via fetch() streaming, jadi lebih akurat daripada mengandalkan
  // event onLoad/onError dari <img> yang tidak reliable untuk MJPEG stream.

  useEffect(() => {
    if (!activePreviewPhoto) {
      setActivePreviewUrl('');
      return;
    }
    if (typeof activePreviewPhoto === 'string') {
      setActivePreviewUrl(activePreviewPhoto);
      return;
    }
    if (activePreviewPhoto instanceof Blob) {
      const objectUrl = URL.createObjectURL(activePreviewPhoto);
      setActivePreviewUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setActivePreviewUrl('');
    }
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
        <h2 className="booking-header-title">CuitBox</h2>
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
            {!isTimerPaused && (
              <div className="camera-timer-outer-container">
                <div className="camera-timer-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="timer-icon">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <select
                    value={captureDelay}
                    onChange={(e) => setCaptureDelay(Number(e.target.value))}
                    disabled={isCountingDown}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#64748b',
                      cursor: isCountingDown ? 'not-allowed' : 'pointer',
                      outline: 'none',
                      padding: 0
                    }}
                  >
                    <option value={3}>3s</option>
                    <option value={5}>5s</option>
                    <option value={10}>10s</option>
                  </select>
                </div>
              </div>
            )}

            <div className="camera-video-wrapper">
              {selectedDeviceId === 'dslr_liveview' ? (
                !activePreviewPhoto && !isCapturing ? (
                  <DslrLiveView
                    className="camera-video-element"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="camera-video-element" style={{ width: '100%', height: '100%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="preview-spinner" />
                  </div>
                )
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video-element"
                />
              )}
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

              {/* Floating shutter button inside camera card */}
              <button
                className="camera-shutter-btn-round"
                onClick={onCapture}
                disabled={photoIndex >= 10 || isTimerPaused}
                title="Ambil Foto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shutter-icon-svg">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>
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
        <div className="copyright-text">© 2026 CuitBox. All rights reserved.</div>
      </div>

      {/* Instant Preview Overlay */}
      {activePreviewUrl && (
        <div className="camera-instant-preview-overlay">
          <div className="camera-instant-preview-card">
            <div className="camera-instant-preview-badge">Nice Shot!</div>
            {activePreviewUrl === 'loading' ? (
              <div className="camera-instant-preview-loading">
                <div className="preview-spinner" />
                <span>Mengambil foto dari kamera...</span>
              </div>
            ) : (
              <img src={activePreviewUrl} alt="Instant Preview" className="camera-instant-preview-image" />
            )}
            
            {/* Review Decision Panel */}
            <div className="preview-decision-panel">
              <div className="preview-timer-text">
                {activePreviewUrl === 'loading' ? (
                  <span>Sinkronisasi gambar...</span>
                ) : (
                  <>Simpan otomatis dalam <strong className="preview-countdown-sec">{reviewCountdown}s</strong></>
                )}
              </div>
              <div className="preview-decision-buttons">
                <button
                  className="preview-btn-retake"
                  onClick={onRetake}
                  disabled={activePreviewUrl === 'loading' || !canRetake}
                  style={{
                    opacity: (activePreviewUrl === 'loading' || !canRetake) ? 0.5 : 1,
                    cursor: (activePreviewUrl === 'loading' || !canRetake) ? 'not-allowed' : 'pointer',
                    backgroundColor: !canRetake ? '#e2e8f0' : undefined,
                    color: !canRetake ? '#94a3b8' : undefined,
                    border: !canRetake ? '1px solid #cbd5e1' : undefined
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                  </svg>
                  {canRetake ? "Ambil Ulang" : "Jatah Retake Habis"}
                </button>
                <button
                  className="preview-btn-keep"
                  onClick={onKeep}
                  disabled={activePreviewUrl === 'loading'}
                  style={{
                    opacity: activePreviewUrl === 'loading' ? 0.5 : 1,
                    cursor: activePreviewUrl === 'loading' ? 'not-allowed' : 'pointer'
                  }}
                >
                  Lanjut
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
