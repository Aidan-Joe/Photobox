export default function Done({ userEmail, onReset }) {
  return (
    <div className="done-page-container">
      <div className="done-card-wrapper">
        <div className="done-status-icon">🎉</div>
        <h1 className="done-title">SELESAI!</h1>
        <p className="done-text-success">Foto berhasil diupload!</p>
        <p className="done-text-email">
          Cek email Anda: <strong>{userEmail}</strong>
        </p>
        <p className="done-text-note">
          Hasil foto akan dikirim dalam beberapa menit. Silakan cek folder inbox atau spam Anda.
        </p>
        <button onClick={onReset} className="done-home-btn">
          🏠 Kembali ke Awal
        </button>
      </div>
    </div>
  );
}
