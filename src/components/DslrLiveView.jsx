import { useState, useEffect, useRef } from 'react';

/**
 * Live View DSLR via digiCamControl Native Web Server (Port 5513).
 *
 * Endpoint utama digiCamControl adalah:
 * http://127.0.0.1:5513/liveview.jpg
 *
 * Komponen ini mengambil frame gambar secara kontinu dengan kecepatan ~25 FPS.
 * Saat capture berlangsung, frame terakhir ditahan (freeze-frame) sehingga layar
 * TIDAK PERNAH menjadi hitam.
 */
export default function DslrLiveView({ className, style, liveViewTimestamp, active = true }) {
  const imgRef = useRef(null);
  const isRunningRef = useRef(false);
  const lastObjectUrlRef = useRef(null);
  const [hasFrame, setHasFrame] = useState(false);

  // Pastikan LiveView window di digiCamControl aktif hanya SEKALI saat komponen pertama kali mount.
  // JANGAN panggil CMD=LiveViewWnd_Show di setiap ganti foto karena command tersebut
  // me-reset DirectShow filter di digiCamControl yang menyebabkan jeda/delay 3 detik (di detik 10-7).
  const initializedOnceRef = useRef(false);
  useEffect(() => {
    if (!initializedOnceRef.current) {
      initializedOnceRef.current = true;
      fetch('http://127.0.0.1:5513/liveview.html?CMD=LiveViewWnd_Show', { mode: 'no-cors' })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    isRunningRef.current = active;
    let activeController = null;

    const cleanupUrl = () => {
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
        lastObjectUrlRef.current = null;
      }
    };

    if (!active) {
      return () => {
        isCancelled = true;
      };
    }

    const fetchNextFrame = async () => {
      if (isCancelled || !isRunningRef.current) return;

      try {
        activeController = new AbortController();
        const timeoutId = setTimeout(() => activeController?.abort(), 1200);

        const res = await fetch(`http://127.0.0.1:5513/liveview.jpg?t=${Date.now()}`, {
          signal: activeController.signal,
          cache: 'no-store'
        });
        clearTimeout(timeoutId);

        if (res.ok && !isCancelled && isRunningRef.current) {
          const blob = await res.blob();
          if (blob && blob.size > 100 && !isCancelled && isRunningRef.current) {
            const newUrl = URL.createObjectURL(blob);
            
            if (imgRef.current) {
              imgRef.current.src = newUrl;
            }
            
            if (lastObjectUrlRef.current) {
              URL.revokeObjectURL(lastObjectUrlRef.current);
            }
            lastObjectUrlRef.current = newUrl;
            setHasFrame(true);
          }
        }
      } catch (err) {
        // Abaikan abort/error saat jepret, frame sebelumnya tetap tampil
      }

      // Frame interval 60ms (~16 FPS): sangat mulus dan ramah resource kamera
      if (!isCancelled && isRunningRef.current) {
        setTimeout(fetchNextFrame, 60);
      }
    };

    fetchNextFrame();

    return () => {
      isCancelled = true;
      isRunningRef.current = false;
      if (activeController) {
        activeController.abort();
      }
      cleanupUrl();
    };
  }, [active, liveViewTimestamp]);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      try {
        window.__dslrStream = canvasRef.current.captureStream(25);
      } catch (e) {
        console.warn("captureStream error:", e);
      }
    }
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }} className={className}>
      <img
        ref={imgRef}
        alt="DSLR Live View"
        crossOrigin="anonymous"
        onLoad={() => {
          if (canvasRef.current && imgRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.drawImage(imgRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: hasFrame ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
      />
      {/* Hidden canvas for MediaStream recording */}
      <canvas
        ref={canvasRef}
        width={1024}
        height={680}
        style={{ display: 'none' }}
      />
      {!hasFrame && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#94a3b8',
          gap: '10px',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2.5px solid #334155',
            borderTopColor: '#e2f952',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span>Menghubungkan ke DSLR Canon 600D (digiCamControl)...</span>
        </div>
      )}
    </div>
  );
}
