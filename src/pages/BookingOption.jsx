export default function BookingOption({ onSelectOption, onBack, loading, error }) {
  return (
    <div className="frame-selection-container">
      {/* Top Header Bar */}
      <div className="booking-header-bar">
        <h2 className="booking-header-title">CuitBox</h2>
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

      {/* Main Content Area */}
      <div className="frame-content-wrapper">
        <div className="frame-title-container">
          <h1 className="frame-selection-title">Mulai Sesi Foto Anda</h1>
          <p className="frame-selection-subtitle">
            Pilih metode berfoto: verifikasi kode booking Anda atau langsung pesan di tempat (walk-in).
          </p>
        </div>

        {error && (
          <div
            className="kiosk-error"
            style={{
              marginBottom: "24px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fca5a5",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {error}
          </div>
        )}

        <div className="booking-option-grid">
          {/* Card 1: Sudah Booking */}
          <button 
            className="option-card" 
            onClick={() => onSelectOption('already_booked')}
            disabled={loading}
          >
            <div className="option-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <line x1="6" y1="15" x2="10" y2="15" />
                <line x1="14" y1="15" x2="18" y2="15" />
              </svg>
            </div>
            <h3 className="option-card-title">Sudah Booking</h3>
            <p className="option-card-desc">
              Masukkan 6 digit kode booking unik yang dikirimkan via email atau WhatsApp.
            </p>
            <div className="option-card-action">
              <span>Verifikasi Kode</span>
              <span className="arrow-step">→</span>
            </div>
          </button>

          {/* Card 2: Belum Booking */}
          <button 
            className="option-card" 
            onClick={() => onSelectOption('walkin')}
            disabled={loading}
          >
            <div className="option-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="3" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="option-card-title">Belum Booking (Walk-in)</h3>
            <p className="option-card-desc">
              Pilih paket foto & bayar langsung di sini menggunakan QRIS instan.
            </p>
            <div className="option-card-action">
              <span>Pesan Sekarang</span>
              <span className="arrow-step">→</span>
            </div>
          </button>
        </div>

        {/* Back Button */}
        <button 
          className="btn-kembali" 
          onClick={onBack}
          disabled={loading}
          style={{ width: 'auto', alignSelf: 'center', marginTop: '14px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {loading ? 'Sedang memproses...' : 'Kembali'}
        </button>
      </div>

      {/* Footer */}
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
