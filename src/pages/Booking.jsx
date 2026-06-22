import { useEffect } from 'react';

export default function Booking({ bookingCode = '', setBookingCode, onSubmit, loading, error }) {
  // Ensure bookingCode is always string
  const codeStr = String(bookingCode || '');

  // Keypad click handlers
  const handleNumClick = (num) => {
    if (codeStr.length < 6) {
      setBookingCode(codeStr + num);
    }
  };

  const handleBackspace = () => {
    setBookingCode(codeStr.slice(0, -1));
  };

  const handleClear = () => {
    setBookingCode('');
  };

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        if (codeStr.length < 6) {
          setBookingCode(codeStr + e.key);
        }
      } else if (e.key === 'Backspace') {
        setBookingCode(codeStr.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (codeStr.length === 6 && !loading) {
          onSubmit(e);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [codeStr, loading, onSubmit, setBookingCode]);

  // Submit trigger
  const handleFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (codeStr.length === 6 && !loading) {
      onSubmit(e);
    }
  };

  // 6 boxes display helper
  const digitBoxes = [];
  for (let i = 0; i < 6; i++) {
    const char = codeStr[i];
    const isFilled = char !== undefined;
    digitBoxes.push(
      <div key={i} className={`digit-box ${isFilled ? 'filled' : 'placeholder-dot'}`}>
        {isFilled ? char : '•'}
      </div>
    );
  }

  return (
    <div className="booking-split-container">
      {/* Top Header Bar */}
      <div className="booking-header-bar">
        <h2 className="booking-header-title">SnapBox Studio</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
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
      </div>

      {/* Left Panel */}
      <div className="booking-left-panel">
        <div className="booking-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Verifikasi Kode</span>
        </div>
        <h1 className="booking-left-title">Masukan kode anda</h1>
        <p className="booking-left-description">
          Silakan masukkan kode verifikasi 6 digit yang dikirimkan ke email Anda untuk memulai sesi foto Anda.
        </p>
        {error && <p className="kiosk-error" style={{ fontSize: '15px', marginTop: '24px', fontWeight: '600' }}>{error}</p>}
      </div>

      {/* Right Panel */}
      <div className="booking-right-panel">
        <div className="booking-card-wrapper">
          {/* Digit Inputs Display */}
          <div className="digit-input-container">
            {digitBoxes}
          </div>

          {/* Virtual Numeric Keypad */}
          <div className="keypad-grid">
            <button className="keypad-btn" onClick={() => handleNumClick('1')}>1</button>
            <button className="keypad-btn" onClick={() => handleNumClick('2')}>2</button>
            <button className="keypad-btn" onClick={() => handleNumClick('3')}>3</button>

            <button className="keypad-btn" onClick={() => handleNumClick('4')}>4</button>
            <button className="keypad-btn" onClick={() => handleNumClick('5')}>5</button>
            <button className="keypad-btn" onClick={() => handleNumClick('6')}>6</button>

            <button className="keypad-btn" onClick={() => handleNumClick('7')}>7</button>
            <button className="keypad-btn" onClick={() => handleNumClick('8')}>8</button>
            <button className="keypad-btn" onClick={() => handleNumClick('9')}>9</button>

            {/* Backspace Button */}
            <button className="keypad-btn" onClick={handleBackspace} title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>

            <button className="keypad-btn" onClick={() => handleNumClick('0')}>0</button>

            {/* Clear Button */}
            <button className="keypad-btn" onClick={handleClear} title="Clear All">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Submit Button */}
          <button 
            className="booking-submit-btn" 
            onClick={handleFormSubmit}
            disabled={codeStr.length !== 6 || loading}
          >
            {loading ? '⏳ Memverifikasi...' : 'Masukkan Kode'}
          </button>
        </div>
      </div>

      {/* Footer */}
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
