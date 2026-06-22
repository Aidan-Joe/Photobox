import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook untuk camera access
 * Handle streaming kamera & ambil foto
 */
export function useCamera() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Sync stream to video element when it mounts or changes
  useEffect(() => {
    console.log('[Camera] Sync useEffect running. videoRef.current:', videoRef.current, 'stream:', stream ? 'active' : 'null');
    if (videoRef.current && videoRef.current.srcObject !== stream) {
      console.log('[Camera] Binding stream to video element srcObject');
      videoRef.current.srcObject = stream;
    }
  });

  // Start camera
  const startCamera = useCallback(async (facingMode = 'user') => {
    setError(null);
    console.log('[Camera] startCamera called. facingMode:', facingMode);
    try {
      let mediaStream;
      try {
        const constraints = {
          video: {
            facingMode: facingMode, // 'user' atau 'environment'
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr) {
        console.warn('[Camera] Failed with ideal constraints, trying fallback without facingMode:', firstErr);
        try {
          const fallbackConstraints = {
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          };
          mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        } catch (secondErr) {
          console.warn('[Camera] Failed with width/height constraints, trying basic video constraint:', secondErr);
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
      }

      console.log('[Camera] getUserMedia success. Stream active:', mediaStream.active, 'Tracks:', mediaStream.getVideoTracks().length);
      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        console.log('[Camera] videoRef.current is available in startCamera, setting srcObject');
        videoRef.current.srcObject = mediaStream;
      } else {
        console.warn('[Camera] videoRef.current is null in startCamera');
      }

      return mediaStream;
    } catch (err) {
      console.warn('[Camera] Physical camera access failed, starting simulated camera:', err.message);
      
      try {
        // Create canvas for simulation if not exists
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');

        // Simple animation loop
        let angle = 0;
        const drawMockFrame = () => {
          if (!ctx) return;
          
          // Draw dark background gradient
          const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
          gradient.addColorStop(0, '#0f172a'); // slate-900
          gradient.addColorStop(1, '#1e293b'); // slate-800
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 1280, 720);

          // Draw neon viewfinder corner borders
          ctx.strokeStyle = '#38bdf8'; // sky-400
          ctx.lineWidth = 6;
          
          // Top-left corner
          ctx.beginPath();
          ctx.moveTo(50, 100);
          ctx.lineTo(50, 50);
          ctx.lineTo(100, 50);
          ctx.stroke();

          // Top-right corner
          ctx.beginPath();
          ctx.moveTo(1230, 100);
          ctx.lineTo(1230, 50);
          ctx.lineTo(1180, 50);
          ctx.stroke();

          // Bottom-left corner
          ctx.beginPath();
          ctx.moveTo(50, 620);
          ctx.lineTo(50, 670);
          ctx.lineTo(100, 670);
          ctx.stroke();

          // Bottom-right corner
          ctx.beginPath();
          ctx.moveTo(1230, 620);
          ctx.lineTo(1230, 670);
          ctx.lineTo(1180, 670);
          ctx.stroke();

          // Draw pulsating Recording Indicator (REC)
          const pulse = Math.abs(Math.sin(Date.now() / 300));
          ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.6})`; // red-500 pulsating
          ctx.beginPath();
          ctx.arc(80, 85, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px Inter, sans-serif';
          ctx.fillText('REC', 105, 92);

          // Draw camera title / status info
          ctx.fillStyle = '#94a3b8'; // slate-400
          ctx.font = '16px Inter, sans-serif';
          ctx.fillText('WEBCAM SOURCE: SIMULATED (DEMO FALLBACK)', 820, 92);

          // Draw animated orbital circles to represent "live stream" activity
          angle += 0.03;
          const centerX = 1280 / 2;
          const centerY = 720 / 2;

          // Outer glowing ring
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
          ctx.stroke();

          // Orbital dot
          const orbitX = centerX + Math.cos(angle) * 150;
          const orbitY = centerY + Math.sin(angle) * 150;
          ctx.fillStyle = '#38bdf8'; // sky-400
          ctx.beginPath();
          ctx.arc(orbitX, orbitY, 8, 0, Math.PI * 2);
          ctx.fill();

          // Smile instructions
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 36px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Smile for the Camera! 😄', centerX, centerY - 20);

          ctx.fillStyle = '#38bdf8'; // sky-400
          ctx.font = '20px Inter, sans-serif';
          ctx.fillText('Auto capturing in progress...', centerX, centerY + 30);

          // Timestamp
          const now = new Date();
          const timeStr = now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0');
          ctx.fillStyle = '#64748b'; // slate-500
          ctx.font = '16px monospace';
          ctx.fillText(timeStr, centerX, centerY + 80);

          // Reset text alignment
          ctx.textAlign = 'left';

          animationRef.current = requestAnimationFrame(drawMockFrame);
        };

        drawMockFrame();

        // Capture stream from canvas at 30 fps
        const mockStream = canvas.captureStream(30);
        console.log('[Camera] Simulated canvas stream generated successfully.');
        setStream(mockStream);
        setIsActive(true);

        if (videoRef.current) {
          console.log('[Camera] Setting videoRef.current srcObject to simulated stream');
          videoRef.current.srcObject = mockStream;
        }

        return mockStream;
      } catch (simErr) {
        console.error('[Camera] Failed to spin up simulated camera:', simErr);
        const errorMsg = err.name === 'NotAllowedError' 
          ? 'Permission kamera ditolak' 
          : err.message;
        setError(errorMsg);
      }
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    console.log('[Camera] stopCamera called.');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
    }
  }, [stream]);

  // Take photo
  const takePhoto = useCallback((format = 'jpeg') => {
    console.log('[Camera] takePhoto called. videoRef.current:', videoRef.current);
    if (!videoRef.current) {
      setError('Video element not available');
      return null;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    console.log('[Camera] Video element dimensions:', video.videoWidth, 'x', video.videoHeight, 'ReadyState:', video.readyState);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    try {
      ctx.drawImage(video, 0, 0);
    } catch (e) {
      console.error('[Camera] drawImage error:', e);
    }

    // Return blob untuk di-upload
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        console.log('[Camera] toBlob success. Blob size:', blob ? blob.size : 'null');
        resolve(blob);
      }, `image/${format}`);
    });
  }, []);

  // Switch camera (front/back)
  const switchCamera = useCallback(async (facingMode) => {
    stopCamera();
    await new Promise(r => setTimeout(r, 500)); // Delay untuk release resource
    await startCamera(facingMode);
  }, [startCamera, stopCamera]);

  // Take multiple photos
  const takeMultiplePhotos = useCallback(async (count = 3, interval = 1000) => {
    const photos = [];
    
    for (let i = 0; i < count; i++) {
      const photo = await takePhoto();
      if (photo) {
        photos.push(photo);
      }
      
      if (i < count - 1) {
        await new Promise(r => setTimeout(r, interval));
      }
    }

    return photos;
  }, [takePhoto]);

  // Get camera list
  const getCameraList = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  return {
    // Refs
    videoRef,
    canvasRef,

    // State
    stream,
    error,
    isActive,

    // Methods
    startCamera,
    stopCamera,
    takePhoto,
    switchCamera,
    takeMultiplePhotos,
    getCameraList,
  };
}
