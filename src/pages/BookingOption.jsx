import lightBlueGradientBg from '../assets/light_blue_gradient_bg.png';

export default function BookingOption({ onSelectOption, onBack, loading, error }) {
  return (
    <div className="frame-selection-container booking-option-theme">
      {/* Background Image Layer */}
      <div
        className="aesthetic-bg-image-layer"
        style={{ backgroundImage: `url(${lightBlueGradientBg})` }}
      />
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
          <h1 className="frame-selection-title">Choose Your Booking Method</h1>
          <p className="frame-selection-subtitle">
            Pilih cara berfoto: Masukkan kode booking atau langsung bayar di tempat.
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
            <div className="pkg-thumb-container">
              <div className="phone-graphic-container">
                <svg className="booking-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
                  <rect x="28" y="10" width="44" height="80" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
                  <rect x="33" y="15" width="34" height="66" rx="4" fill="#f8fafc" />
                  <rect x="42" y="15" width="16" height="3" rx="1" fill="#cbd5e1" />
                  <circle cx="50" cy="36" r="12" fill="#f0fbf6" />
                  <path d="M44 36l4 4 8-8" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="38" y1="62" x2="38" y2="74" stroke="#64748b" strokeWidth="2" />
                  <line x1="42" y1="62" x2="42" y2="74" stroke="#64748b" strokeWidth="1.5" />
                  <line x1="45" y1="62" x2="45" y2="74" stroke="#64748b" strokeWidth="3" />
                  <line x1="50" y1="62" x2="50" y2="74" stroke="#64748b" strokeWidth="1" />
                  <line x1="53" y1="62" x2="53" y2="74" stroke="#64748b" strokeWidth="2" />
                  <line x1="57" y1="62" x2="57" y2="74" stroke="#64748b" strokeWidth="3" />
                  <line x1="62" y1="62" x2="62" y2="74" stroke="#64748b" strokeWidth="1.5" />
                </svg>
              </div>
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
            <div className="pkg-thumb-container">
              <div className="photobox-graphic-container">
                <svg className="kiosk-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
                  {/* Photo Box Cabinet on Stand */}
                  <g transform="translate(4, 4)">
                    {/* Stand post */}
                    <line x1="26" y1="46" x2="26" y2="76" stroke="#cbd5e1" strokeWidth="3" />
                    {/* Stand base legs */}
                    <line x1="26" y1="76" x2="16" y2="90" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                    <line x1="26" y1="76" x2="36" y2="90" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />

                    {/* Kiosk Head Cabinet */}
                    <rect x="9" y="10" width="34" height="36" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
                    {/* Camera Lens */}
                    <circle cx="26" cy="20" r="5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
                    <circle cx="26" cy="20" r="2" fill="#64748b" />
                    {/* Screen */}
                    <rect x="14" y="29" width="24" height="12" rx="1.5" fill="#e2e8f0" />
                    {/* Screen Person silhouette */}
                    <circle cx="26" cy="33.5" r="2.2" fill="#94a3b8" />
                    <path d="M21 39c0-1.8 2-2.5 5-2.5s5 0.7 5 2.5" fill="#94a3b8" />

                    {/* Slot for photo strip */}
                    <line x1="15" y1="42" x2="37" y2="42" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Emerging printed photo strip */}
                    <g className="emerging-photo-g">
                      <rect x="20" y="43" width="12" height="24" rx="0.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                      <rect x="22.5" y="45.5" width="7" height="4.5" rx="0.3" fill="#f1f5f9" />
                      <rect x="22.5" y="51.5" width="7" height="4.5" rx="0.3" fill="#f1f5f9" />
                      <rect x="22.5" y="57.5" width="7" height="4.5" rx="0.3" fill="#f1f5f9" />
                    </g>
                  </g>

                  {/* Posing Character next to Photo Box */}
                  <g transform="translate(4, 4)">
                    {/* Head */}
                    <circle cx="68" cy="30" r="7.5" fill="#64748b" />
                    {/* Torso */}
                    <path d="M59 42h18a4 4 0 0 1 4 4v20H55V46a4 4 0 0 1 4-4z" fill="#94a3b8" />
                    {/* Legs */}
                    <rect x="61" y="66" width="3.5" height="18" rx="1.5" fill="#cbd5e1" />
                    <rect x="71" y="66" width="3.5" height="18" rx="1.5" fill="#cbd5e1" />
                    {/* Left arm waving */}
                    <path d="M55 46c-3-3-6-7-4-11s6-4 8-1l2 12" fill="none" stroke="#64748b" strokeWidth="2.8" strokeLinecap="round" />
                    {/* Right arm posing */}
                    <path d="M81 46c3 1 6 3 5 7s-4 4-6 1l-3-9" fill="none" stroke="#64748b" strokeWidth="2.8" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
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
