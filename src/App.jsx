import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import { useCamera } from "./hooks/useCamera.js";
import { useFetch } from "./hooks/useFetch.js";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { usePhotoboxWorkflow } from "./hooks/usePhotoboxWorkflow.js";
import { CONFIG, ENDPOINTS } from "./config.js";

// Page Components
import Welcome from "./pages/Welcome.jsx";
import BookingOption from "./pages/BookingOption.jsx";
import Booking from "./pages/Booking.jsx";
import PrintOption from "./pages/PrintOption.jsx";
import Payment from "./pages/Payment.jsx";
import WaitPayment from "./pages/WaitPayment.jsx";
import FrameSelection from "./pages/FrameSelection.jsx";
import Camera from "./pages/Camera.jsx";
import Preview from "./pages/Preview.jsx";
import Email from "./pages/Email.jsx";
import Done from "./pages/Done.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";

const grabLiveViewFrame = () => {
  const element = document.querySelector(".camera-video-element");
  if (!element) return null;

  try {
    const canvas = document.createElement("canvas");
    if (element.tagName === "IMG") {
      canvas.width = element.naturalWidth || element.width || 1024;
      canvas.height = element.naturalHeight || element.height || 768;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.85);
    } else if (element.tagName === "VIDEO") {
      canvas.width = element.videoWidth || 1024;
      canvas.height = element.videoHeight || 768;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.85);
    }
  } catch (err) {
    console.warn("Gagal mengambil freeze frame:", err);
  }
  return null;
};

function App() {
  // Hooks
  const camera = useCamera();
  const {
    startCamera,
    stopCamera,
    takePhoto,
    getCameraList,
    stream: cameraStream,
    videoRef: cameraVideoRef,
    error: cameraError,
  } = camera;
  const workflow = usePhotoboxWorkflow();
  const [bookingCode, setBookingCode] = useLocalStorage("bookingCode", "");
  const [userEmail, setUserEmail] = useLocalStorage("userEmail", "");
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]); // Selected dari preview
  const paymentPollRef = useRef(null);
  const isCapturingRef = useRef(false);
  const activeCaptureControllerRef = useRef(null);

  // Get data
  const { data: printOptions } = useFetch(
    workflow.bookingId
      ? `${CONFIG.API_URL}${ENDPOINTS.PRINT_OPTIONS}?booking_code=${bookingCode}`
      : null,
  );
  const { data: frames } = useFetch(
    workflow.bookingId ? `${CONFIG.API_URL}${ENDPOINTS.FRAMES}` : null,
  );

  // Page states
  const [currentPage, setCurrentPage] = useState("welcome");
  // welcome → booking → printOption → payment → waitPayment → frame → camera → preview → email → uploading → done

  // UI States
  const [selectedPrintOption, setSelectedPrintOption] = useState(null);
  const [paymentQrCode, setPaymentQrCode] = useState("");
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [previewTimer, setPreviewTimer] = useState(420); // 7 menit = 420 detik
  const [error, setError] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [activePreviewPhoto, setActivePreviewPhoto] = useState(null);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [croppedPhotos, setCroppedPhotos] = useState([]);
  const [finalImage, setFinalImage] = useState(null);
  const [finalVideoTransition, setFinalVideoTransition] = useState(null);
  const [finalVideoLoop, setFinalVideoLoop] = useState(null);
  const [reviewCountdown, setReviewCountdown] = useState(0);
  const [retakeCounts, setRetakeCounts] = useState({});
  const [captureDelay, setCaptureDelay] = useState(10); // default 10s capture delay
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(() => {
    return localStorage.getItem('kiosk_camera_device_id') || 'dslr_liveview';
  });
  const [liveViewTimestamp, setLiveViewTimestamp] = useState(() => Date.now());
  
  // Live Photo (Secret Boomerang short video) states
  const [livePhotos, setLivePhotos] = useState([]);
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const [isCapturingDslr, setIsCapturingDslr] = useState(false);

  const currentFrameObj =
    workflow.frames &&
    workflow.frames.find((f) => String(f.id) === String(selectedFrame));
  const maxPhotos = currentFrameObj
    ? parseInt(currentFrameObj.layout_photo_count || currentFrameObj.photo_count, 10) || 6
    : 6;

  // ============ BOOKING PAGE ============
  const handleVerifyBooking = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    try {
      const result = await workflow.verifyBooking(bookingCode);
      if (result.booking && result.booking.status !== "paid") {
        throw new Error("Booking belum lunas! Silakan lakukan pembayaran online terlebih dahulu.");
      }
      setCurrentPage("frame");
    } catch (err) {
      setError(err.message);
    }
  };

  // ============ PRINT OPTION PAGE ============
  const handleSelectPrintOption = async (optionId) => {
    setSelectedPrintOption(optionId);
    setError(null);
    try {
      const result = await workflow.generatePaymentQR(optionId);
      setCurrentPage("payment");
    } catch (err) {
      setError(err.message);
    }
  };

  // ============ PAYMENT PAGE ============
  const handleWaitForPayment = () => {
    setCurrentPage("waitPayment");
    setPaymentStatus("waiting");

    // Poll payment status setiap 2 detik
    paymentPollRef.current = setInterval(async () => {
      try {
        const status = await workflow.checkPaymentStatus(workflow.paymentId);
        setPaymentStatus(status);

        if (status === "settlement" || status === "paid") {
          clearInterval(paymentPollRef.current);
          setCurrentPage("frame");
        }
      } catch (err) {
        console.error("Payment check error:", err);
      }
    }, 2000);
  };

  // ============ FRAME SELECTION PAGE ============
  const handleSelectFrame = (frameId) => {
    setSelectedFrame(frameId);
  };

  const triggerStartLiveView = useCallback(async () => {
    try {
      await fetch(`${CONFIG.API_URL}/session/liveview/start`, { method: 'POST' });
      // Tidak perlu delay lagi karena backend tidak melakukan Hide->Show toggle
      setLiveViewTimestamp(Date.now());
    } catch (err) {
      console.warn('Failed to start live view:', err);
    }
  }, []);

  const handleProceedFromFrame = async (overrideFrameId) => {
    const frameIdToUse = overrideFrameId || selectedFrame;
    if (!frameIdToUse) return;
    try {
      await workflow.startSession(frameIdToUse, 1); // filter_id = 1 default
      setCurrentPage("camera");
      setPhotoIndex(0);
      setCapturedPhotos([]);
      setLivePhotos([]); // Reset secret live photos
      setRetakeCounts({});

      // Start camera
      if (selectedDeviceId === 'dslr_liveview') {
        triggerStartLiveView();
      } else {
        await startCamera(selectedDeviceId || "user");
      }

      // Auto start first countdown
      setCountdown(captureDelay);
      setIsCountingDown(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTriggerCountdown = () => {
    if (
      photoIndex >= 10 ||
      isTimerPaused ||
      isCapturingRef.current
    )
      return;
    
    if (isCountingDown) {
      // If already counting down, trigger capture immediately
      setIsCountingDown(false);
      capturePhoto();
    } else {
      setIsCountingDown(true);
      setCountdown(captureDelay);
    }
  };

  const handleKeepPhoto = useCallback(() => {
    setReviewCountdown(0);
    setActivePreviewPhoto(null);
    setIsTimerPaused(false);
    isCapturingRef.current = false;
    setIsCapturingDslr(false);

    if (selectedDeviceId === 'dslr_liveview') {
      setLiveViewTimestamp(Date.now());
    }

    // Mulai unduhan latar belakang untuk foto yang baru saja disimpan (kept)
    const lastPhotoIdx = capturedPhotos.length - 1;
    const lastPhoto = capturedPhotos[lastPhotoIdx];
    if (lastPhoto && typeof lastPhoto === 'object' && lastPhoto.isPendingDownload) {
      setCapturedPhotos((prev) => {
        const next = [...prev];
        next[lastPhotoIdx] = {
          ...lastPhoto,
          isPendingDownload: false,
          isDownloading: true,
        };
        return next;
      });

      const rawUrl = lastPhoto.url;
      const downloadController = lastPhoto.controller;

      (async () => {
        try {
          const downloadTimeoutId = setTimeout(() => downloadController.abort(), 15000);
          const imgRes = await fetch(rawUrl, {
            signal: downloadController.signal
          });
          clearTimeout(downloadTimeoutId);

          if (!imgRes.ok) {
            throw new Error(`Gagal mengunduh gambar DSLR dari backend. Status: ${imgRes.status}`);
          }
          
          const blob = await imgRes.blob();

          if (blob) {
            setCapturedPhotos((prev) => {
              return prev.map((item) => {
                if (item && item.url === rawUrl) {
                  return blob; // ganti placeholder dengan Blob biner asli
                }
                return item;
              });
            });
            console.log(`[DSLR Background Download] Selesai mengunduh foto ke-${lastPhotoIdx + 1}`);
          }
        } catch (err) {
          if (err.name === 'AbortError') {
            console.log(`[DSLR Background Download] Unduhan untuk foto ke-${lastPhotoIdx + 1} dibatalkan.`);
          } else {
            console.error(`[DSLR Background Download] Gagal mengunduh foto ke-${lastPhotoIdx + 1}:`, err);
          }
        }
      })();
    }

    if (photoIndex >= 10) {
      // Periksa apakah ada unduhan latar belakang DSLR yang masih berjalan atau proses jepret aktif
      const stillDownloading = capturedPhotos.some(p => p && typeof p === 'object' && (p.isDownloading || p.isPendingDownload || p.isDslrPlaceholder));
      if (stillDownloading) {
        setIsTimerPaused(true);
        setError("Menyinkronkan foto resolusi tinggi DSLR, mohon tunggu sebentar...");
        
        const checkInterval = setInterval(() => {
          setCapturedPhotos((currentPhotos) => {
            const finished = !currentPhotos.some(p => p && typeof p === 'object' && (p.isDownloading || p.isPendingDownload || p.isDslrPlaceholder));
            if (finished) {
              clearInterval(checkInterval);
              setError(null);
              setIsTimerPaused(false);
              
              if (selectedDeviceId === 'dslr_liveview') {
                // Jangan hentikan Live View
              } else {
                stopCamera();
              }
              setCurrentPage("preview");
              setPreviewTimer(420);
            }
            return currentPhotos;
          });
        }, 300);
        return;
      }

      if (selectedDeviceId === 'dslr_liveview') {
        // Jangan hentikan Live View agar kamera DSLR/digiCamControl tidak hang/beku saat transisi sesi!
        // Aliran stream tetap aktif di background sehingga sesi berikutnya langsung menyala instan.
      } else {
        stopCamera();
      }
      setCurrentPage("preview");
      setPreviewTimer(420); // Reset 7 menit timer
    } else {
      setCountdown(captureDelay);
      setIsCountingDown(true);
    }
  }, [photoIndex, stopCamera, captureDelay, selectedDeviceId, triggerStartLiveView, capturedPhotos]);

  // Start secret live photo video recording
  const startRecording = useCallback(() => {
    const stream = cameraStream || window.__dslrStream;
    if (!stream) {
      console.warn("No stream available to record live photo.");
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      return;
    }

    videoChunksRef.current = [];
    try {
      let options = { mimeType: 'video/mp4;codecs=avc1' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/mp4' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp9' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp8' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = {};
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      console.log("Started secret live photo recording...", options.mimeType);
    } catch (e) {
      console.error("Failed to start MediaRecorder for live photo:", e);
    }
  }, [cameraStream]);

  // preTriggerDslrCapture DIHAPUS: Fungsi ini sebelumnya memicu shutter
  // kamera 1 detik sebelum countdown habis (di countdown=1), lalu capturePhoto()
  // memicu lagi di countdown=0, mengakibatkan kamera "jepret 2 kali".
  // Sekarang hanya capturePhoto() yang memicu shutter, tepat 1 kali saja.

  const capturePhoto = useCallback(async () => {
    if (photoIndex >= 10 || isTimerPaused || isCapturingRef.current) return;

    // Stop recording secret live photo and retrieve video blob
    let videoBlob = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        const stopPromise = new Promise((resolve) => {
          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(videoChunksRef.current, { type: 'video/mp4' });
            resolve(blob);
          };
        });
        mediaRecorderRef.current.stop();
        videoBlob = await stopPromise;
        console.log("Stopped secret live photo recording. Blob size:", videoBlob?.size);
      } catch (e) {
        console.error("Error stopping MediaRecorder:", e);
      }
    }

    isCapturingRef.current = true;
    setIsCapturingDslr(true);
    setError(null);

    try {
      let photo;
      if (selectedDeviceId === 'dslr_liveview') {
        const currentPhotoIdx = photoIndex; // catat index saat ini
        const downloadController = new AbortController();
        const captureController = new AbortController();
        activeCaptureControllerRef.current = captureController;

        const captureId = Date.now(); // Unique ID for this capture attempt to prevent race conditions on retake

        // 1. Trigger flash effect instantly
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 150);

        try {
          let result;
          // SINGLE TRIGGER: Langsung kirim 1 perintah capture ke backend.
          // Tidak ada lagi pre-trigger yang menyebabkan "jepret 2 kali".
          console.log("[DSLR Capture] Triggering single DSLR capture...");
          const timeoutId = setTimeout(() => captureController.abort(), 30000);

          const response = await fetch(`${CONFIG.API_URL}/session/${workflow.sessionId}/capture-dslr`, {
            method: "POST",
            signal: captureController.signal
          });
          
          clearTimeout(timeoutId);
          activeCaptureControllerRef.current = null;
          
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || errData.messages?.error || errData.message || `Gagal memicu DSLR (${response.status})`);
          }

          result = await response.json();

          if (!result.status || !result.data?.image_url) {
            throw new Error(result.message || "Gagal menjepret gambar.");
          }

          const rawUrl = result.data.image_url;
          const previewUrl = result.data.preview_url || rawUrl;
          
          // 3. Tampilkan pratinjau Nice Shot setelah gambar benar-benar didapatkan dari DSLR
          setActivePreviewPhoto(previewUrl);
          setIsTimerPaused(true);
          setReviewCountdown(10);

          // 4. Tambahkan foto ke capturedPhotos dengan url yang sudah siap
          const newPhotoPlaceholder = {
            id: captureId,
            url: rawUrl,
            isDownloading: true, // Mulai download langsung di background
            isPendingDownload: false,
            isDslrPlaceholder: false,
            controller: downloadController
          };

          setCapturedPhotos((prev) => [...prev, newPhotoPlaceholder]);
          setLivePhotos((prev) => [...prev, videoBlob || null]);
          
          // Update index foto
          const nextIndex = currentPhotoIdx + 1;
          setPhotoIndex(nextIndex);

          // Jalankan download biner
          (async () => {
            try {
              const downloadTimeoutId = setTimeout(() => downloadController.abort(), 15000);
              const imgRes = await fetch(rawUrl, {
                signal: downloadController.signal
              });
              clearTimeout(downloadTimeoutId);

              if (!imgRes.ok) {
                throw new Error(`Gagal mengunduh gambar DSLR dari backend. Status: ${imgRes.status}`);
              }
              
              const blob = await imgRes.blob();

              if (blob) {
                setCapturedPhotos((prev) => {
                  return prev.map((item) => {
                    if (item && item.id === captureId) {
                      return blob; // ganti placeholder dengan Blob biner asli
                    }
                    return item;
                  });
                });
                console.log(`[DSLR Background Download] Selesai mengunduh foto ke-${currentPhotoIdx + 1}`);
              }
            } catch (err) {
              if (err.name === 'AbortError') {
                console.log(`[DSLR Background Download] Unduhan untuk foto ke-${currentPhotoIdx + 1} dibatalkan.`);
              } else {
                console.error(`[DSLR Background Download] Gagal mengunduh foto ke-${currentPhotoIdx + 1}:`, err);
              }
            }
          })();

        } catch (dslrErr) {
          activeCaptureControllerRef.current = null;
          console.warn("DSLR capture failed or timed out:", dslrErr);
          
          // Jika di-abort oleh user (karena menekan Retake), diamkan error-nya
          if (dslrErr.name === 'AbortError' && !isCapturingRef.current) {
            console.log("DSLR capture fetch aborted silently by user retake action.");
            return;
          }

          let userFriendlyMsg = dslrErr.message;
          if (dslrErr.name === 'AbortError' || dslrErr.message?.includes('abort')) {
            userFriendlyMsg = "DSLR Capture timed out (kamera tidak merespons). Pastikan kamera menyala dan kabel USB terhubung dengan benar.";
          }
          setError(userFriendlyMsg || "Gagal menjepret gambar dengan DSLR. Pastikan kamera menyala.");

          // Bersihkan state jika gagal
          setActivePreviewPhoto(null);
          setIsTimerPaused(false);
          isCapturingRef.current = false;
          setIsCapturingDslr(false);
        }
      } else {
        // Jika menggunakan webcam biasa atau capture card, langsung ambil dari stream video browser
        photo = await takePhoto();
        if (photo) {
          setCapturedPhotos((prev) => [...prev, photo]);
          setLivePhotos((prev) => [...prev, videoBlob || null]);
          setActivePreviewPhoto(photo);
          setIsTimerPaused(true);
          const nextIndex = photoIndex + 1;
          setPhotoIndex(nextIndex);
          setReviewCountdown(10);
        } else {
          isCapturingRef.current = false;
        }
      }
    } catch (err) {
      console.error("Capture error:", err);
      setError(err.message || "Gagal mengambil foto.");
      isCapturingRef.current = false;
      setIsCapturingDslr(false);
    }
  }, [photoIndex, isTimerPaused, workflow.sessionId, takePhoto, selectedDeviceId, triggerStartLiveView]);

  const handleRetakePhoto = useCallback(() => {
    if (capturedPhotos.length === 0) return;
    
    setReviewCountdown(0);
    setActivePreviewPhoto(null);
    setIsTimerPaused(false);
    isCapturingRef.current = false;
    setIsCapturingDslr(false);

    if (selectedDeviceId === 'dslr_liveview') {
      setLiveViewTimestamp(Date.now());
    }

    // (pre-trigger sudah dihapus, tidak perlu dibatalkan lagi)

    // Batalkan request capture jika masih berjalan
    if (activeCaptureControllerRef.current) {
      try {
        activeCaptureControllerRef.current.abort();
        console.log("[DSLR Capture] Menghentikan request pemicu DSLR karena user mengambil ulang (retake) foto.");
      } catch (e) {
        console.error("Gagal menghentikan capture request:", e);
      }
      activeCaptureControllerRef.current = null;
    }

    // Ambil item terakhir dan batalkan proses unduhan jika masih berjalan
    const lastPhoto = capturedPhotos[capturedPhotos.length - 1];
    if (lastPhoto && typeof lastPhoto === 'object' && lastPhoto.controller) {
      try {
        lastPhoto.controller.abort();
        console.log("[DSLR Capture] Menghentikan unduhan background karena user mengambil ulang (retake) foto.");
      } catch (e) {
        console.error("Gagal menghentikan unduhan:", e);
      }
    }

    setCapturedPhotos((prev) => prev.slice(0, -1));
    setLivePhotos((prev) => prev.slice(0, -1)); // Discard corresponding secret video
    setPhotoIndex((prev) => Math.max(0, prev - 1));
    
    setCountdown(captureDelay);
    setIsCountingDown(true);
  }, [capturedPhotos, captureDelay, selectedDeviceId, triggerStartLiveView, retakeCounts]);

  // Load and switch camera devices
  useEffect(() => {
    if (currentPage === "camera") {
      getCameraList().then((devices) => {
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setCameraDevices(videoDevices);
        if (!selectedDeviceId) {
          setSelectedDeviceId('dslr_liveview');
        }
      });
    }
  }, [currentPage, getCameraList, selectedDeviceId]);

  const handleSelectCameraDevice = useCallback(async (deviceId) => {
    const oldDeviceId = selectedDeviceId;
    setSelectedDeviceId(deviceId);
    try {
      // Clean up old source
      if (oldDeviceId === 'dslr_liveview') {
        fetch(`${CONFIG.API_URL}/session/liveview/stop`, { method: 'POST' })
          .catch(err => console.warn('Failed to stop live view:', err));
      } else {
        stopCamera();
      }

      await new Promise(r => setTimeout(r, 400));

      // Start new source
      if (deviceId === 'dslr_liveview') {
        triggerStartLiveView();
      } else {
        await startCamera(deviceId);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [stopCamera, startCamera, selectedDeviceId, triggerStartLiveView]);

  // Secret access to admin setup page
  useEffect(() => {
    const handleAdminKeydown = (e) => {
      if (currentPage === "welcome" && e.ctrlKey && e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setCurrentPage("admin");
      }
    };
    window.addEventListener("keydown", handleAdminKeydown);
    return () => window.removeEventListener("keydown", handleAdminKeydown);
  }, [currentPage]);

  // Review Countdown Timer effect
  useEffect(() => {
    if (currentPage !== "camera" || !activePreviewPhoto || reviewCountdown <= 0) return;

    const timer = setTimeout(() => {
      if (reviewCountdown === 1) {
        handleKeepPhoto();
      } else {
        setReviewCountdown((prev) => prev - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentPage, activePreviewPhoto, reviewCountdown, handleKeepPhoto]);

  // ============ CAMERA PAGE - Countdown & Auto Capture ============
  const capturePhotoRef = useRef(capturePhoto);
  const startRecordingRef = useRef(startRecording);
  useEffect(() => {
    capturePhotoRef.current = capturePhoto;
    startRecordingRef.current = startRecording;
  }, [capturePhoto, startRecording]);

  useEffect(() => {
    if (currentPage === "camera" && isCountingDown && countdown <= 4) {
      startRecordingRef.current();
    }
  }, [currentPage, isCountingDown, countdown]);

  // Menggunakan setInterval stabil agar hitungan mundur berjalan tepat 1 detik per angka
  // tanpa ter-reset atau terhambat oleh re-render di latar belakang.
  useEffect(() => {
    if (
      currentPage !== "camera" ||
      photoIndex >= 10 ||
      isTimerPaused ||
      !isCountingDown
    )
      return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 4 && prev > 1) {
          startRecordingRef.current();
        }

        if (prev <= 1) {
          clearInterval(interval);
          setIsCountingDown(false);
          capturePhotoRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPage, photoIndex, isTimerPaused, isCountingDown]);

  // ============ PREVIEW PAGE - 7 Menit Timer ============
  useEffect(() => {
    if (currentPage !== "preview" || previewTimer <= 0) return;

    const timer = setInterval(() => {
      setPreviewTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPage, previewTimer]);

  // Auto move to email page jika timeout
  useEffect(() => {
    if (previewTimer === 0 && currentPage === "preview") {
      handleProceedToEmail();
    }
  }, [previewTimer, currentPage]);

  const handleSelectPhotoForPreview = (photoIndex, limit = 6) => {
    setSelectedPhotos((prev) => {
      if (prev.includes(photoIndex)) {
        return prev.filter((i) => i !== photoIndex);
      }
      if (prev.length >= limit) {
        if (limit === 1) {
          return [photoIndex];
        }
        return [...prev.slice(1), photoIndex];
      }
      return [...prev, photoIndex];
    });
  };

  const handleProceedToEmail = async ({
    croppedFiles = [],
    finalImage = null,
    finalVideoTransition = null,
    finalVideoLoop = null,
  } = {}) => {

    try {
      console.log("Upload session files...");

      await workflow.uploadSessionFiles(
        finalImage,
        capturedPhotos,
        livePhotos,
        finalVideoTransition,
        finalVideoLoop
      );
      console.log("Upload selesai");

      setCroppedPhotos(croppedFiles);
      setFinalImage(finalImage);
      setFinalVideoTransition(finalVideoTransition);
      setFinalVideoLoop(finalVideoLoop);

      setCurrentPage("email");
    } catch (err) {
      console.error(err);

      setError("Upload foto gagal.");
    }
    console.log("FINAL IMAGE");
    console.log(finalImage);

    console.log(finalImage instanceof File);

    console.log(finalImage?.size);

    console.log(finalImage?.type);

    console.log(capturedPhotos);

    console.log(capturedPhotos.length);
  };

  // ============ EMAIL PAGE ============
  const handleInputEmail = (e) => {
    setUserEmail(e.target.value);
  };

  // ============ UPLOAD PAGE ============
  const handleUploadPhotos = async () => {
    if (!userEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Email tidak valid!");
      return;
    }

    setError(null);
    try {
      // Filter only selected photos, using cropped versions if available

      if (!finalImage) {
        throw new Error("Final image belum tersedia.");
      }

      await workflow.sendSessionEmail(userEmail);
      await workflow.completeSession();

      setCurrentPage("done");
    } catch (err) {
      setError(err.message);
    }
  };

  // ============ HELPER FUNCTIONS ============
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ============ RENDER PAGES ============
  switch (currentPage) {
    case "welcome":
      return <Welcome onStart={() => setCurrentPage("bookingOption")} />;

    case "bookingOption":
      return (
        <BookingOption
          onSelectOption={async (option) => {
            if (option === "already_booked") {
              setCurrentPage("booking");
            } else if (option === "walkin") {
              setError(null);
              try {
                const result = await workflow.createWalkinBooking();
                if (result?.bookingCode) {
                  setBookingCode(result.bookingCode);
                }
                setCurrentPage("printOption");
              } catch (err) {
                setError(err.message);
              }
            }
          }}
          onBack={() => {
            setCurrentPage("welcome");
          }}
          loading={workflow.loading}
          error={error}
        />
      );

    case "booking":
      return (
        <Booking
          bookingCode={bookingCode}
          setBookingCode={setBookingCode}
          onSubmit={handleVerifyBooking}
          onBack={() => {
            setError(null);
            setBookingCode("");
            setCurrentPage("bookingOption");
          }}
          loading={workflow.loading}
          error={error}
        />
      );

    case "printOption":
      const activeOptions = workflow.printOptions || [];
      const currentSelectedOption = selectedPrintOption || (activeOptions[0]?.id || "1");
      return (
        <PrintOption
          printOptions={activeOptions}
          selectedPrintOption={currentSelectedOption}
          onSelect={setSelectedPrintOption}
          booking={workflow.booking}
          onProceed={async () => {
            const optionToUse = selectedPrintOption || currentSelectedOption;
            if (!optionToUse) return;
            setError(null);
            try {
              setSelectedPrintOption(optionToUse);
              const result = await workflow.generatePaymentQR(optionToUse);
              setPaymentQrCode(
                result.qrCode || result.midtrans?.qr_url || result.midtrans?.qr_string || "",
              );
              setCurrentPage("payment");
            } catch (err) {
              setError(err.message);
            }
          }}
          onBack={() => {
            setCurrentPage("bookingOption");
          }}
          error={error}
        />
      );

    case "payment":
      const activeOptionsList = workflow.printOptions || [];
      const currentOptId = selectedPrintOption || "1";
      const selectedPkg = activeOptionsList.find(
        (opt) => String(opt.id) === String(currentOptId)
      ) || {
        id: currentOptId,
        name: currentOptId === "1" ? "2 Cetak" : `${currentOptId} Cetak`,
        copies: Number(currentOptId) || 2,
        extra_price: currentOptId === "1" ? 25000 : 55000,
      };

      return (
        <Payment
          bookingId={workflow.bookingId}
          paymentId={workflow.paymentId}
          qrCode={paymentQrCode}
          selectedPackage={selectedPkg}
          onPaymentSuccess={async () => {
            setError(null);
            try {
              if (workflow.paymentId) {
                await workflow.simulatePaymentSuccess(workflow.paymentId);
              }
              setCurrentPage("frame");
            } catch (err) {
              setError(err.message);
            }
          }}
          onCancel={() => {
            setPaymentQrCode("");
            setCurrentPage("printOption");
          }}
          onRefresh={async () => {
            if (!selectedPrintOption) return;
            try {
              const result =
                await workflow.generatePaymentQR(selectedPrintOption);
              setPaymentQrCode(
                result.midtrans?.qr_string || result.qrCode || "",
              );
            } catch (err) {
              console.error("Refresh QR failed:", err);
            }
          }}
          checkPaymentStatus={workflow.checkPaymentStatus}
          mockMode={workflow.mockMode}
          error={error}
        />
      );

    case "waitPayment":
      return <WaitPayment paymentStatus={paymentStatus} />;

    case "frame":
      return (
        <FrameSelection
          frames={workflow.frames || []}
          categories={workflow.categories || []}
          selectedFrame={selectedFrame}
          onSelect={handleSelectFrame}
          onProceed={handleProceedFromFrame}
          error={error}
        />
      );

    case "camera":
      return (
        <Camera
          videoRef={camera.videoRef}
          photoIndex={photoIndex}
          countdown={countdown}
          selectedFrame={selectedFrame}
          capturedPhotos={capturedPhotos}
          error={error || camera.error}
          onCapture={handleTriggerCountdown}
          onRetake={handleRetakePhoto}
          onKeep={handleKeepPhoto}
          canRetake={true}
          reviewCountdown={reviewCountdown}
          captureDelay={captureDelay}
          setCaptureDelay={setCaptureDelay}
          isFlashing={isFlashing}
          activePreviewPhoto={activePreviewPhoto}
          isCountingDown={isCountingDown}
          isTimerPaused={isTimerPaused}
          frames={workflow.frames || []}
          cameraDevices={cameraDevices}
          selectedDeviceId={selectedDeviceId}
          onSelectCameraDevice={handleSelectCameraDevice}
          liveViewTimestamp={liveViewTimestamp}
          isCapturing={isCapturingDslr}
        />
      );

    case "preview":
      return (
        <Preview
          previewTimer={previewTimer}
          formatTime={formatTime}
          selectedPhotos={selectedPhotos}
          capturedPhotos={capturedPhotos}
          livePhotos={livePhotos}
          onSelectPhoto={handleSelectPhotoForPreview}
          onProceed={handleProceedToEmail}
          selectedFrame={selectedFrame}
          error={error}
          frames={workflow.frames || []}
        />
      );

    case "email":
      return (
        <Email
          userEmail={userEmail}
          onInputEmail={handleInputEmail}
          setUserEmail={setUserEmail}
          onSubmit={handleUploadPhotos}
          onBack={() => setCurrentPage("preview")}
          loading={workflow.loading}
          error={error}
        />
      );

    case "done":
      return (
        <Done
          userEmail={userEmail}
          finalImage={finalImage}
          finalVideoTransition={finalVideoTransition}
          onReset={() => {
            setBookingCode("");
            setUserEmail("");
            setCapturedPhotos([]);
            setSelectedPhotos([]);
            setCroppedPhotos([]);
            setLivePhotos([]);
            setRetakeCounts({});
            setFinalImage(null);
            setPhotoIndex(0);
            setCurrentPage("welcome");
            workflow.reset();
          }}
        />
      );

    case "admin":
      return (
        <AdminSettings
          onSave={(deviceId) => {
            setSelectedDeviceId(deviceId);
            setCurrentPage("welcome");
          }}
          onCancel={() => {
            setCurrentPage("welcome");
          }}
        />
      );

    default:
      return (
        <div className="kiosk-container">
          <div className="kiosk-card">
            <h2>Halaman tidak ditemukan</h2>
          </div>
        </div>
      );
  }
}

export default App;
