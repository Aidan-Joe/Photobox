export default function BookingOption({ onSelectOption, onBack, loading, error }) {
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

      {/* Main Content Area */}
      <div className="booking-option-container">
        <div className="booking-badge" style={{ alignSelf: 'center', marginBottom: '16px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Pilih Metode Mulai</span>
        </div>
        <h1 className="booking-option-title">Mulai Sesi Foto Anda</h1>
        <p className="booking-option-description">
          Apakah Anda sudah memiliki kode booking/pembayaran sebelumnya atau ingin langsung berfoto di sini?
        </p>

        {error && <p className="kiosk-error" style={{ marginBottom: '24px', fontWeight: '600' }}>{error}</p>}

        <div className="booking-option-grid">
          {/* Card 1: Sudah Booking */}
          <button 
            className="option-card" 
            onClick={() => onSelectOption('already_booked')}
            disabled={loading}
          >
            <div className="option-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#aa3bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <line x1="2" y1="14" x2="22" y2="14" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="18" y1="18" x2="18.01" y2="18" />
              </svg>
            </div>
            <h3 className="option-card-title">Sudah Booking</h3>
            <p className="option-card-desc">
              Masukkan 6 digit kode booking Anda yang dikirimkan via email untuk verifikasi.
            </p>
          </button>

          {/* Card 2: Belum Booking */}
          <button 
            className="option-card" 
            onClick={() => onSelectOption('walkin')}
            disabled={loading}
          >
            <div className="option-card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="option-card-title">Belum Booking (Walk-in)</h3>
            <p className="option-card-desc">
              Pesan dan bayar paket foto Anda langsung di sini menggunakan pembayaran QRIS.
            </p>
          </button>
        </div>

        {/* Back Button */}
        <button 
          className="btn-kembali" 
          onClick={onBack}
          disabled={loading}
          style={{ width: 'auto', alignSelf: 'center', marginTop: '10px' }}
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
        <div>© 2026 PhotoBox. All rights reserved.</div>
      </div>
    </div>
  );
}
