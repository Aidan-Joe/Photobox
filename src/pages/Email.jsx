import { useState, useEffect } from 'react';

export default function Email({ userEmail, onInputEmail, setUserEmail, onSubmit, onBack, loading, error }) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (key) => {
    if (key === 'Backspace') {
      setUserEmail(prev => prev.slice(0, -1));
    } else if (key === 'Space') {
      setUserEmail(prev => prev + ' ');
    } else if (key === '.com') {
      setUserEmail(prev => prev + '.com');
    } else {
      setUserEmail(prev => prev + key.toLowerCase());
    }
  };

  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Backspace', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', '_', '-'],
    ['@', 'Space', '.com']
  ];

  return (
    <div className="email-page-container">
      {/* Top Header Bar */}
      <div className="booking-header-bar">
        <h2 className="booking-header-title">SnapBox Studio</h2>
        <div className="email-timer-capsule">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="email-content-wrapper">
        <div className="email-title-container">
          <h1 className="email-main-title">Get Your Digital Copies</h1>
          <p className="email-main-subtitle">
            Masukkan alamat email Anda di bawah ini untuk menerima salinan digital berkualitas tinggi dari kenangan sesi Anda secara instan.
          </p>
        </div>

        {/* Custom modern Email Input Pill */}
        <div className="email-input-pill-wrapper">
          <div className="email-icon-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <input
            type="email"
            placeholder="example@email.com"
            value={userEmail}
            onChange={onInputEmail}
            className="email-pill-input"
            required
            autoFocus
          />
        </div>

        {/* On-Screen Virtual Keyboard */}
        <div className="virtual-keyboard-card">
          {keyboardRows.map((row, rowIdx) => (
            <div key={rowIdx} className="keyboard-row">
              {row.map((key) => {
                let keyClass = "keyboard-key";
                let keyLabel = key;

                if (key === 'Backspace') {
                   keyClass += " key-backspace";
                   keyLabel = (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                      <line x1="18" y1="9" x2="12" y2="15" />
                      <line x1="12" y1="9" x2="18" y2="15" />
                    </svg>
                  );
                } else if (key === 'Space') {
                  keyClass += " key-space";
                  keyLabel = "Space";
                } else if (key === '@' || key === '.com') {
                  keyClass += " key-utility";
                }

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyPress(key)}
                    className={keyClass}
                  >
                    {keyLabel}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Proceed & Back Buttons */}
        <div className="email-actions-container" style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', width: '100%', maxWidth: '840px' }}>
          <button 
            type="button"
            onClick={onBack}
            className="btn-kembali-email"
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '18px',
              fontWeight: '750',
              padding: '16px 44px',
              borderRadius: '50px',
              border: '2px solid #e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali
          </button>

          <button 
            onClick={onSubmit} 
            className="btn-lanjut-email" 
            disabled={loading || !userEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)}
          >
            {loading ? 'Mengirim...' : 'Lanjut'}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
        {error && <p className="kiosk-error" style={{ marginTop: '12px', width: '100%', textAlign: 'right', maxWidth: '840px' }}>{error}</p>}
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
