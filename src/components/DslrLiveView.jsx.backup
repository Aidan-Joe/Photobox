import { useState, useEffect, useRef } from 'react';

// Live view DSLR via MJPEG stream digiCamControl (port 5514).
// PENTING: <img src="...5514/live"> yang pasif TIDAK reliable untuk
// mendeteksi stream yang "diam" (server berhenti kirim frame tapi koneksi
// tetap terbuka) -- onError browser umumnya cuma trigger kalau koneksi
// benar-benar refused/closed, bukan kalau cuma stall. Makanya di sini kita
// pakai fetch() + AbortController supaya bisa mendeteksi timeout secara
// eksplisit dan paksa reconnect kalau tidak ada data baru dalam waktu wajar.
//
// Root cause asli bug "live view hitam setelah jepretan pertama": capture
// foto butuh akses eksklusif ke sensor kamera sesaat, yang membuat live
// view engine internal digiCamControl berhenti sesaat. Stream MJPEG di
// port 5514 lalu berhenti kirim frame baru, TAPI koneksi HTTP-nya tetap
// terbuka -- <img src> pasif tidak pernah tahu ini terjadi karena tidak
// ada event "stall" di browser, cuma event "error" (connection refused)
// yang jarang terjadi di kasus ini. Komponen ini membaca stream secara
// manual byte-per-byte supaya bisa mendeteksi kapan terakhir kali frame
// baru diterima, dan reconnect paksa kalau sudah melewati batas wajar.
export default function DslrLiveView({ className, style }) {
  const imgRef = useRef(null);
  const abortControllerRef = useRef(null);
  const objectUrlRef = useRef(null);
  const mountedRef = useRef(true);
  const [connectionKey, setConnectionKey] = useState(0);
  const [hasFrame, setHasFrame] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let stallTimeout;
    let cancelled = false;

    const cleanupObjectUrl = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };

    const connect = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Watchdog: kalau tidak ada satu frame pun berhasil didapat dalam
      // 2 detik sejak koneksi dibuka, anggap stream diam/stuck -> paksa
      // reconnect (bukan menunggu browser onError yang tidak reliable).
      stallTimeout = setTimeout(() => {
        if (!cancelled) {
          console.warn('[DSLR Live View] Stream stall terdeteksi, reconnecting...');
          controller.abort();
        }
      }, 2000);

      try {
        const response = await fetch(`http://127.0.0.1:5514/live?t=${Date.now()}`, {
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Live view stream response tidak ok: ${response.status}`);
        }

        const reader = response.body.getReader();
        const eoiMarker = [0xff, 0xd9]; // JPEG EOI (End Of Image) marker
        let buffer = new Uint8Array(0);

        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;

          // Reset watchdog setiap kali ada data baru masuk (stream sehat)
          clearTimeout(stallTimeout);
          stallTimeout = setTimeout(() => {
            if (!cancelled) {
              console.warn('[DSLR Live View] Stream stall terdeteksi (tidak ada frame baru), reconnecting...');
              controller.abort();
            }
          }, 2000);

          const merged = new Uint8Array(buffer.length + value.length);
          merged.set(buffer);
          merged.set(value, buffer.length);
          buffer = merged;

          // Cari akhir frame JPEG (marker FF D9) di dalam buffer, lalu
          // render frame itu langsung sebagai object URL ke <img>.
          for (let i = 0; i < buffer.length - 1; i++) {
            if (buffer[i] === eoiMarker[0] && buffer[i + 1] === eoiMarker[1]) {
              const frameEnd = i + 2;
              // Cari awal JPEG (FF D8) sebelum EOI ini, di dalam buffer yang sama
              let frameStart = -1;
              for (let j = frameEnd - 2; j >= 1; j--) {
                if (buffer[j] === 0xff && buffer[j + 1] === 0xd8) {
                  frameStart = j;
                  break;
                }
              }

              if (frameStart !== -1) {
                const frameBytes = buffer.slice(frameStart, frameEnd);
                const blob = new Blob([frameBytes], { type: 'image/jpeg' });
                const url = URL.createObjectURL(blob);

                cleanupObjectUrl();
                objectUrlRef.current = url;

                if (mountedRef.current && imgRef.current) {
                  imgRef.current.src = url;
                  setHasFrame(true);
                }
              }

              buffer = buffer.slice(frameEnd);
              break;
            }
          }

          // Cegah buffer membengkak tanpa batas kalau format stream tidak
          // sesuai dugaan (safety net).
          if (buffer.length > 5 * 1024 * 1024) {
            buffer = new Uint8Array(0);
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[DSLR Live View] Stream error, reconnecting...', err.message);
        }
      } finally {
        clearTimeout(stallTimeout);
        if (!cancelled) {
          // Reconnect segera (200ms jeda kecil supaya tidak spam request
          // kalau digiCamControl sendiri sedang benar-benar mati).
          setTimeout(() => {
            if (!cancelled) {
              setConnectionKey((k) => k + 1);
            }
          }, 200);
        }
      }
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(stallTimeout);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      cleanupObjectUrl();
    };
  }, [connectionKey]);

  return (
    <img
      ref={imgRef}
      alt="DSLR Live View"
      className={className}
      style={{ ...style, backgroundColor: hasFrame ? 'transparent' : '#000' }}
    />
  );
}
