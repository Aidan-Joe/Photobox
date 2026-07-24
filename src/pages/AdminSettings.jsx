import { useState, useEffect, useRef } from 'react';

export default function AdminSettings({ onSave, onCancel }) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  // Fetch camera list
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then((allDevices) => {
        const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
        setDevices(videoDevices);
        
        // Load saved device or default to first
        const saved = localStorage.getItem('kiosk_camera_device_id');
        if (saved && videoDevices.some(d => d.deviceId === saved)) {
          setSelectedDevice(saved);
        } else if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      })
      .catch((err) => {
        setError('Gagal membaca daftar kamera: ' + err.message);
      });
  }, []);

  // Sync stream to video ref
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Start camera preview when selected device changes
  useEffect(() => {
    if (!selectedDevice) return;

    let activeStream = null;

    const constraints = {
      video: {
        deviceId: { exact: selectedDevice },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((mediaStream) => {
        activeStream = mediaStream;
        setStream(mediaStream);
        setError(null);
      })
      .catch((err) => {
        setError('Gagal mengakses kamera fisik ini: ' + err.message);
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [selectedDevice]);

  const handleSave = () => {
    localStorage.setItem('kiosk_camera_device_id', selectedDevice);
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    onSave(selectedDevice);
  };

  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    onCancel();
  };

  return (
    <div className="admin-settings-container" style={{
      width: '100vw',
      height: '100vh',
      background: '#0f172a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box',
      padding: '40px'
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '720px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', color: '#e2f952' }}>KIOSK SETUP & ADMIN</h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#94a3b8' }}>Konfigurasi sumber kamera utama untuk Kiosk Photo Booth</p>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#f87171',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            width: '100%',
            marginBottom: '20px',
            boxSizing: 'border-box'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Camera Selector */}
        <div style={{ width: '100%', marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>
            Pilih Sumber Kamera Kiosk:
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: '2px solid #334155',
              background: '#0f172a',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {devices.map((device, idx) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>

        {/* Live Preview Monitor */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1.77',
          background: '#000000',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '3px solid #334155',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ color: '#64748b', fontSize: '14px' }}>Kamera tidak aktif</div>
          )}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(0,0,0,0.6)',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '1px',
            color: '#e2f952'
          }}>
            LIVE MONITOR
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '16px 0',
              borderRadius: '14px',
              border: 'none',
              background: '#e2f952',
              color: '#0f172a',
              fontSize: '16px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(226,249,82,0.25)',
              transition: 'all 0.2s'
            }}
          >
            Simpan Konfigurasi
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: '16px 32px',
              borderRadius: '14px',
              border: '2px solid #334155',
              background: 'transparent',
              color: '#94a3b8',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
