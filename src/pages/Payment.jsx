import { useState, useEffect } from 'react';

export default function Payment({ 
  bookingId, 
  paymentId, 
  qrCode, 
  selectedPackage, 
  onPaymentSuccess, 
  onCancel, 
  onRefresh, 
  checkPaymentStatus,
  mockMode,
  error 
}) {
  // 3-minute countdown timer (180 seconds)
  const [timeLeft, setTimeLeft] = useState(180);

  // Map package name to marketing title
  const getPackageDisplayName = (name) => {
    if (name === '2 Cetak') return 'Premium Duo Bundle';
    if (name === '3 Cetak') return 'Triple Fun Collage';
    if (name === '4 Cetak') return 'Party Pack Quad';
    if (name === '5 Cetak') return 'Super Party Pack';
    return name || 'Premium Duo Bundle';
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
  }, [qrCode]); // Reset timer when QR Code changes/refreshes

  // Polling Payment Status Effect
  useEffect(() => {
    if (!paymentId || timeLeft <= 0) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(paymentId);
        if (status === 'settlement' || status === 'paid') {
          clearInterval(pollInterval);
          onPaymentSuccess();
        }
      } catch (err) {
        console.error('Polling payment status failed:', err);
      }
    }, 2000); // Check status every 2 seconds

    return () => clearInterval(pollInterval);
  }, [paymentId, checkPaymentStatus, onPaymentSuccess, timeLeft]);

  // Refresh handler
  const handleRefreshClick = () => {
    setTimeLeft(180);
    onRefresh();
  };

  return (
    <div className="pay-split-container">
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

      {/* Main Content Workspace Wrapper */}
      <div className="pay-content-wrapper">
        
        {/* Centered Top Title & Description */}
        <div className="frame-title-container">
          <h1 className="frame-selection-title">Complete Your Payment</h1>
          <p className="frame-selection-subtitle">
            Scan the QR code using your mobile banking or e-wallet to finalize your photo session.
          </p>
        </div>

        {/* Left & Right Panels Container */}
        <div className="pay-columns-container">
          
          {/* Left Panel - QR Receipt Card */}
          <div className="pay-left-panel">
            <div className="pay-qr-card">
              <div className="pay-status-row">
                {timeLeft > 0 ? (
                  <>
                    <span className="status-dot-pulse"></span>
                    <span>Waiting for Payment</span>
                  </>
                ) : (
                  <span style={{ color: '#ef4444' }}>QR Code Expired</span>
                )}
              </div>

              {qrCode && timeLeft > 0 ? (
                <img src={qrCode} alt="QR Code" className="pay-qr-img" />
              ) : (
                <div className="pay-qr-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b' }}>
                  Expired
                </div>
              )}

              <p className="pay-price-label">Total Payment</p>
              <h1 className="pay-price-val">{selectedPackage?.price || 'Rp55.000'}</h1>

              {/* Expiration Timer Bar Embedded Inside Card Footer */}
              <div className="pay-timer-bar">
                <div className="pay-timer-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 2h14" />
                    <path d="M5 22h14" />
                    <path d="M19 2v4c0 3.3-2.7 6-6 6a6 6 0 0 0-6-6V2" />
                    <path d="M5 22v-4c0-3.3 2.7-6 6-6a6 6 0 0 1 6 6v4" />
                  </svg>
                  <span>QR code expires in</span>
                </div>
                <div className="pay-timer-val">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Session Summary, Help Box, Action Buttons */}
          <div className="pay-right-panel">
            {/* Summary Card */}
            <div className="pay-summary-card">
              <h3 className="pay-summary-title">Session Summary</h3>
              <div className="pay-summary-row">
                <span className="pay-summary-label">Selected Package</span>
                <span className="pay-summary-value">{getPackageDisplayName(selectedPackage?.name)}</span>
              </div>
              <div className="pay-summary-row">
                <span className="pay-summary-label">Print Quantity</span>
                <span className="pay-summary-value">{selectedPackage?.quantity || 2} Copies</span>
              </div>
              <div className="pay-summary-row">
                <span className="pay-summary-label">Process Estimate</span>
                <span className="pay-summary-value">~ 4 Minutes</span>
              </div>
            </div>

            {/* Help block */}
            <div className="pay-help-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '1px', flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="pay-help-text">
                Need help? Please call our attendant or scan the support QR on the booth frame.
              </p>
            </div>

            {/* Actions buttons Row */}
            <div className="pay-actions-row">
              <button className="btn-refresh" onClick={handleRefreshClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Refresh QR
              </button>

              <button className="btn-cancel" onClick={onCancel}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancel Payment
              </button>
            </div>

            {(mockMode || import.meta.env.DEV) && (
              <button 
                className="btn-success-mock" 
                onClick={onPaymentSuccess}
                style={{ 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 20px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  marginTop: '10px',
                  transition: 'background-color 0.2s'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                [Dev Mode] Bypass / Simulate Payment Success
              </button>
            )}

            {error && <p className="kiosk-error" style={{ marginTop: '15px' }}>{error}</p>}
          </div>

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
