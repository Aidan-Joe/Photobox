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

function App() {
  // Hooks
  const camera = useCamera();
  const workflow = usePhotoboxWorkflow();
  const [bookingCode, setBookingCode] = useLocalStorage("bookingCode", "");
  const [userEmail, setUserEmail] = useLocalStorage("userEmail", "");
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]); // Selected dari preview
  const paymentPollRef = useRef(null);
  const isCapturingRef = useRef(false);

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

  const currentFrameObj =
    workflow.frames &&
    workflow.frames.find((f) => String(f.id) === String(selectedFrame));
  const maxPhotos = currentFrameObj
    ? parseInt(currentFrameObj.photo_count, 10) || 6
    : 6;

  // ============ BOOKING PAGE ============
  const handleVerifyBooking = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    try {
      await workflow.verifyBooking(bookingCode);
      setCurrentPage("printOption");
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

  const handleProceedFromFrame = async (overrideFrameId) => {
    const frameIdToUse = overrideFrameId || selectedFrame;
    if (!frameIdToUse) return;
    try {
      await workflow.startSession(frameIdToUse, 1); // filter_id = 1 default
      setCurrentPage("camera");
      setPhotoIndex(0);
      setCapturedPhotos([]);

      // Start camera
      await camera.startCamera("user");

      setCountdown(0);
      setIsCountingDown(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTriggerCountdown = () => {
    if (
      photoIndex >= 10 ||
      isTimerPaused ||
      isCapturingRef.current ||
      isCountingDown
    )
      return;
    setIsCountingDown(true);
    setCountdown(3);
  };

  const capturePhoto = useCallback(async () => {
    if (photoIndex >= 10 || isTimerPaused || isCapturingRef.current) return;

    isCapturingRef.current = true;

    // Trigger flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    try {
      const photo = await camera.takePhoto();
      if (photo) {
        setCapturedPhotos((prev) => [...prev, photo]);
        setActivePreviewPhoto(photo);
        setIsTimerPaused(true);

        const nextIndex = photoIndex + 1;
        setPhotoIndex(nextIndex);

        setTimeout(() => {
          setActivePreviewPhoto(null);
          setIsTimerPaused(false);
          isCapturingRef.current = false;

          if (nextIndex >= 10) {
            camera.stopCamera();
            setCurrentPage("preview");
            setPreviewTimer(420); // Reset 7 menit timer
          } else {
            setCountdown(0);
            setIsCountingDown(false);
          }
        }, 1500);
      } else {
        isCapturingRef.current = false;
      }
    } catch (err) {
      console.error("Capture error:", err);
      isCapturingRef.current = false;
    }
  }, [camera, photoIndex, isTimerPaused]);

  // ============ CAMERA PAGE - Countdown & Auto Capture ============
  useEffect(() => {
    if (
      currentPage !== "camera" ||
      photoIndex >= 10 ||
      isTimerPaused ||
      !isCountingDown
    )
      return;

    if (countdown === 0) {
      setIsCountingDown(false);
      capturePhoto();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    currentPage,
    countdown,
    photoIndex,
    isTimerPaused,
    isCountingDown,
    capturePhoto,
  ]);

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

  const handleSelectPhotoForPreview = (photoIndex) => {
    setSelectedPhotos((prev) => {
      if (prev.includes(photoIndex)) {
        return prev.filter((i) => i !== photoIndex);
      }
      if (prev.length >= maxPhotos) {
        if (maxPhotos === 1) {
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
  } = {}) => {
    if (selectedPhotos.length !== maxPhotos) {
      setError(`Pilih tepat ${maxPhotos} foto!`);
      return;
    }

    try {
      console.log("Upload session files...");

      await workflow.uploadSessionFiles(finalImage, capturedPhotos);
      console.log("Upload selesai");

      setCroppedPhotos(croppedFiles);
      setFinalImage(finalImage);

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
                await workflow.createWalkinBooking();
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
      return (
        <PrintOption
          printOptions={workflow.printOptions || []}
          selectedPrintOption={selectedPrintOption}
          onSelect={setSelectedPrintOption}
          onProceed={async () => {
            if (!selectedPrintOption) return;
            setError(null);
            try {
              const result =
                await workflow.generatePaymentQR(selectedPrintOption);
              setPaymentQrCode(
                result.midtrans?.qr_string || result.qrCode || "",
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
      const selectedPkg =
        workflow.printOptions &&
        workflow.printOptions.find((opt) => opt.id === selectedPrintOption);
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
          isFlashing={isFlashing}
          activePreviewPhoto={activePreviewPhoto}
          isCountingDown={isCountingDown}
          isTimerPaused={isTimerPaused}
          frames={workflow.frames || []}
        />
      );

    case "preview":
      return (
        <Preview
          previewTimer={previewTimer}
          formatTime={formatTime}
          selectedPhotos={selectedPhotos}
          capturedPhotos={capturedPhotos}
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
          onReset={() => {
            setBookingCode("");
            setUserEmail("");
            setCapturedPhotos([]);
            setSelectedPhotos([]);
            setCroppedPhotos([]);
            setFinalImage(null);
            setPhotoIndex(0);
            setCurrentPage("welcome");
            workflow.reset();
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
