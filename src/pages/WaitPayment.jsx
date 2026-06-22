export default function WaitPayment({ paymentStatus }) {
  return (
    <div className="kiosk-container">
      <h1 className="kiosk-title">⏳ Menunggu Pembayaran</h1>
      <div className="kiosk-card">
        <h2>Status: {paymentStatus}</h2>
        <p>Silakan selesaikan pembayaran...</p>
        <div style={{ fontSize: '48px', marginTop: '20px' }}>⌛</div>
      </div>
    </div>
  );
}
