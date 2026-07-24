export default function PrintOption({ 
  printOptions, 
  selectedPrintOption, 
  onSelect, 
  onProceed, 
  onBack, 
  error 
}) {
  return (
    <div className="pkg-container">
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
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="frame-content-wrapper">
        {/* Main Title & Subtitle */}
        <div className="frame-title-container">
          <h1 className="frame-selection-title">Choose Your Package</h1>
          <p className="frame-selection-subtitle">Select the print style and quantity for your session memories.</p>
        </div>

        {/* Package Selection Grid */}
        <div className="pkg-grid">
          {Array.isArray(printOptions) && printOptions.map((opt) => {
            const isSelected = selectedPrintOption === opt.id;
            const quantity = opt.quantity || Number(opt.copies) || 2;
            const name = opt.name || `${quantity} Cetak`;
            const description = opt.description || `Mendapatkan ${quantity} lembar cetak foto strip fisik.`;
            
            // Format price: try total_amount, extra_price, or opt.price
            let price = opt.price;
            if (!price) {
              const amount = opt.total_amount || opt.extra_price;
              price = amount !== undefined ? `Rp ${Number(amount).toLocaleString('id-ID')}` : 'Rp 0';
            }

            return (
              <div
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className={`pkg-card ${isSelected ? 'selected' : ''}`}
              >
                {/* Popular Badge */}
                {opt.isPopular && (
                  <div className="pkg-badge-popular">MOST POPULAR</div>
                )}

                {/* CSS Drawn Thumbnail */}
                <div className="pkg-thumb-container">
                  {/* CSS Drawn Strips based on quantity */}
                  {Array.from({ length: quantity }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`pkg-strip-graphic strip-${quantity}-${i + 1}`}
                    >
                      <div className="pkg-strip-frame"></div>
                      <div className="pkg-strip-frame"></div>
                      <div className="pkg-strip-frame"></div>
                    </div>
                  ))}
                </div>

                <h3 className="pkg-card-title">{name}</h3>
                <p className="pkg-card-desc">{description}</p>
                <p className="pkg-card-price">{price}</p>
              </div>
            );
          })}
        </div>

        {/* Dynamic loading fallback if printOptions empty */}
        {(!printOptions || printOptions.length === 0) && (
          <p style={{ marginTop: '20px' }}>Loading paket cetak...</p>
        )}

        {/* Bottom Errors */}
        {error && <p className="kiosk-error" style={{ marginBottom: '15px' }}>{error}</p>}

        {/* Bottom Actions Panel */}
        <div className="pkg-actions">
          <button className="btn-kembali" onClick={onBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali
          </button>

          {selectedPrintOption && (
            <button className="btn-lanjut" onClick={onProceed}>
              Lanjut
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}
        </div>
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
