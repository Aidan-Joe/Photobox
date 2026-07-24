import { useState, useEffect, useRef } from "react";
import { CONFIG } from "../config";

import { cropPhoto } from "../utils/cropPhoto";
import { detectHoles } from "../utils/detectHoles";
import { renderFinalImage } from "../utils/renderFinalImage";
import { renderFinalVideo } from "../utils/renderFinalVideo";

function PreviewPhotoThumbnail({ photo }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!photo) return;
    const objectUrl = URL.createObjectURL(photo);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photo]);

  if (!url) {
    return <div className="preview-photo-thumbnail-placeholder" />;
  }

  return (
    <img src={url} alt="Captured Preview" className="preview-gallery-photo" />
  );
}

function InteractivePhotoSlot({
  photo,
  slotIndex,
  transform,
  onTransformChange,
}) {
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [imgSize, setImgSize] = useState({ w: 1280, h: 720 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!photo) {
      console.log("NO PHOTO");
      return;
    }

    const objectUrl = URL.createObjectURL(photo);

    console.log(objectUrl);

    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const t = transform || { scale: 1, x: 0, y: 0 };

  const slotWidth = containerRef.current ? containerRef.current.clientWidth : 0;
  const slotHeight = containerRef.current ? containerRef.current.clientHeight : 0;

  const rs = (slotWidth && slotHeight) ? slotWidth / slotHeight : 1;
  const ri = (imgSize.w && imgSize.h) ? imgSize.w / imgSize.h : 1;

  let rw = slotWidth, rh = slotHeight;
  if (slotWidth && slotHeight) {
    if (ri > rs) {
      rw = slotHeight * ri;
      rh = slotHeight;
    } else {
      rw = slotWidth;
      rh = slotWidth / ri;
    }
  }

  const leftOffset = (slotWidth - rw) / 2;
  const topOffset = (slotHeight - rh) / 2;

  const clampTransform = (x, y, scale) => {
    if (!containerRef.current) return { x: 0, y: 0, scale: 1 };
    const slotW = containerRef.current.clientWidth;
    const slotH = containerRef.current.clientHeight;

    // Skala minimal 1.0 agar foto tidak pernah mengecil lebih kecil dari slot
    const safeScale = Math.min(Math.max(scale || 1, 1), 4);

    const rRatio = slotW / (slotH || 1);
    const iRatio = (imgSize.w || 1) / (imgSize.h || 1);

    let baseW, baseH;
    if (iRatio > rRatio) {
      baseW = slotH * iRatio;
      baseH = slotH;
    } else {
      baseW = slotW;
      baseH = slotW / iRatio;
    }

    const zw = baseW * safeScale;
    const zh = baseH * safeScale;

    // Batasi geser kanan/kiri (X) dan atas/bawah (Y) agar foto tidak pernah melewati tepi slot
    const maxX = Math.max(0, (zw - slotW) / 2);
    const minX = -maxX;
    const maxY = Math.max(0, (zh - slotH) / 2);
    const minY = -maxY;

    return {
      scale: safeScale,
      x: Math.min(Math.max(x || 0, minX), maxX),
      y: Math.min(Math.max(y || 0, minY), maxY),
    };
  };

  const updateTransform = (newT) => {
    const nextT = { ...t, ...newT };
    const clamped = clampTransform(nextT.x, nextT.y, nextT.scale);
    onTransformChange(slotIndex, clamped);
  };

  useEffect(() => {
    if (imgSize.w && imgSize.h && containerRef.current) {
      const clamped = clampTransform(t.x, t.y, t.scale);
      if (clamped.x !== t.x || clamped.y !== t.y || clamped.scale !== t.scale) {
        onTransformChange(slotIndex, clamped);
      }
    }
  }, [imgSize.w, imgSize.h, slotWidth, slotHeight]);

  const getTouchDistance = (e) => {
    if (e.touches.length < 2) return null;
    return Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
  };

  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setInitialOffset({ x: t.x, y: t.y });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
      setLastTouchDistance(null);
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      setLastTouchDistance(getTouchDistance(e));
    }
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
    updateTransform({
      x: initialOffset.x + dx,
      y: initialOffset.y + dy,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      const dist = getTouchDistance(e);
      if (dist && lastTouchDistance) {
        const factor = dist / lastTouchDistance;
        const newScale = Math.min(Math.max(t.scale * factor, 1), 4);
        updateTransform({ scale: newScale });
      }
      setLastTouchDistance(dist);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const delta = e.deltaY < 0 ? 1 : -1;
    const newScale = Math.min(Math.max(t.scale + delta * zoomSpeed, 1), 4);
    updateTransform({ scale: newScale });
  };

  if (!url) {
    return <div className="preview-photo-thumbnail-placeholder" />;
  }

  return (
    <div
      ref={containerRef}
      className="interactive-photo-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
      onWheel={handleWheel}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
    >
      <img
        src={url}
        alt="Captured Preview"
        draggable={false}
        onLoad={(e) =>
          setImgSize({
            w: e.target.naturalWidth,
            h: e.target.naturalHeight,
          })
        }
        style={{
          position: "absolute",
          left: `${leftOffset}px`,
          top: `${topOffset}px`,
          width: rw ? `${rw}px` : "100%",
          height: rh ? `${rh}px` : "100%",
          objectFit: "fill",

          transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
          transformOrigin: "center center",

          transition: isDragging ? "none" : "transform .08s linear",

          userSelect: "none",
          pointerEvents: "none",

          willChange: "transform",
        }}
      />
    </div>
  );
}

export default function Preview({
  previewTimer,
  formatTime,
  selectedPhotos,
  capturedPhotos,
  livePhotos = [],
  onSelectPhoto,
  onProceed,
  selectedFrame,
  error,
  frames = [],
}) {
  const [transforms, setTransforms] = useState({});
  const [isCropping, setIsCropping] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [frameRatio, setFrameRatio] = useState(null);
  const [detectedHoles, setDetectedHoles] = useState([]);
  const [frameSize, setFrameSize] = useState({
    width: 0,
    height: 0,
  });

  const currentFrame = frames.find(
    (f) => String(f.id) === String(selectedFrame),
  );
  const frameUrl = currentFrame?.file_path
    ? (currentFrame.file_path.startsWith("http")
        ? currentFrame.file_path
        : `${CONFIG.API_URL}/frame/${currentFrame.file_path.split("/").pop()}`)
    : null;
  const totalNeeded = currentFrame
    ? parseInt(currentFrame.layout_photo_count || currentFrame.photo_count, 10) || 6
    : 6;

  useEffect(() => {
    console.log("DEBUG PREVIEW - selectedFrame:", selectedFrame);
    console.log("DEBUG PREVIEW - frames array:", frames);
    console.log("DEBUG PREVIEW - currentFrame:", currentFrame);

    if (!currentFrame?.file_path) {
      setFrameRatio(null);

      setDetectedHoles([]);

      setFrameSize({
        width: 0,
        height: 0,
      });

      return;
    }

    const imgPath = frameUrl;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;

      setFrameRatio(ratio);

      setFrameSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });

      // Gunakan koordinat layout dari database jika tersedia (skala dari basis desain 1200x1800 ke ukuran asli frame)
      let rawCoords = currentFrame.layout_slot_coordinates;

      if (rawCoords) {
        try {
          const coords = typeof rawCoords === "string"
            ? JSON.parse(rawCoords)
            : rawCoords;

          if (Array.isArray(coords) && coords.length > 0) {
            console.log("DEBUG PREVIEW - Raw layout coordinates:", coords);
            const mappedHoles = coords.map((c) => ({
              left: Number(c.x) * (img.naturalWidth / 1200),
              top: Number(c.y) * (img.naturalHeight / 1800),
              width: Number(c.w) * (img.naturalWidth / 1200),
              height: Number(c.h) * (img.naturalHeight / 1800),
            }));
            console.log("DEBUG PREVIEW - Mapped database holes:", mappedHoles);
            setDetectedHoles(mappedHoles);
            return;
          }
        } catch (e) {
          console.error("Gagal parse layout_slot_coordinates, fallback ke detectHoles:", e);
        }
      }

      const holes = detectHoles(img, img.naturalWidth, img.naturalHeight);
      console.log("FRAME WIDTH", img.naturalWidth);
      console.log("FRAME HEIGHT", img.naturalHeight);

      console.log("HOLES", holes);

      setDetectedHoles(holes);
    };

    img.onerror = (err) => {
      console.error("Failed loading frame:", err);
    };

    img.src = imgPath;
  }, [currentFrame]);

  const handleTransformChange = (slotIndex, newTransform) => {
    setTransforms((prev) => ({
      ...prev,
      [slotIndex]: newTransform,
    }));
  };

  const handleProceed = async () => {
    setIsCropping(true);
    setProcessingProgress(0);

    try {
      const croppedFiles = [];
      let finalImage = null;
      let finalVideoTransition = null;
      let finalVideoLoop = null;

      const slotElements = document.querySelectorAll(
        ".preview-sheet-mockup .grid-slot",
      );

      for (let idx = 0; idx < totalNeeded; idx++) {
        const photoIdx = selectedPhotos[idx];
        const photoFile = capturedPhotos[photoIdx];

        if (!photoFile) continue;

        const slotEl = slotElements[idx];

        const slotWidth = slotEl ? slotEl.clientWidth : 146;
        const slotHeight = slotEl ? slotEl.clientHeight : 113;

        const transform = transforms[idx] || {
          scale: 1,
          x: 0,
          y: 0,
        };
        const cropped = await cropPhoto(
          photoFile,
          transform,
          slotWidth,
          slotHeight,
        );

        croppedFiles.push(cropped);
        setProcessingProgress(Math.round(((idx + 1) / totalNeeded) * 10));
      }

      // Frame URL
      const frameUrl = currentFrame?.file_path
        ? (currentFrame.file_path.startsWith("http")
            ? currentFrame.file_path
            : `${CONFIG.API_URL}/frame/${currentFrame.file_path.split("/").pop()}`)
        : null;

      if (frameUrl && detectedHoles.length > 0 && croppedFiles.length > 0) {
        setProcessingProgress(12);
        finalImage = await renderFinalImage({
          frameUrl,
          croppedPhotos: croppedFiles,
          holes: detectedHoles,
          width: frameSize.width,
          height: frameSize.height,
        });
        if (!finalImage) {
          throw new Error("Final image gagal dibuat.");
        }
        setProcessingProgress(15);
        console.log("FINAL IMAGE", finalImage);
        console.log("SIZE", finalImage.size);

        // Get selected live photos and slot sizes
        const selectedLivePhotos = [];
        const slotWidths = [];
        const slotHeights = [];
        for (let idx = 0; idx < totalNeeded; idx++) {
          const photoIdx = selectedPhotos[idx];
          selectedLivePhotos.push(livePhotos[photoIdx]);

          const slotEl = slotElements[idx];
          slotWidths.push(slotEl ? slotEl.clientWidth : 146);
          slotHeights.push(slotEl ? slotEl.clientHeight : 113);
        }

        // Render transition video
        console.log("Rendering transition video...");
        try {
          finalVideoTransition = await renderFinalVideo({
            frameUrl,
            croppedPhotos: croppedFiles,
            livePhotos: selectedLivePhotos,
            holes: detectedHoles,
            width: frameSize.width,
            height: frameSize.height,
            transforms,
            slotWidths,
            slotHeights,
            mode: "transition",
            onProgress: (p) => {
              setProcessingProgress(15 + Math.round(p * 0.6)); // Maps 0-100 to 15-75
            }
          });
        } catch (e) {
          console.error("Gagal membuat video transisi:", e);
        }

        // Render loop video
        console.log("Rendering loop video...");
        try {
          finalVideoLoop = await renderFinalVideo({
            frameUrl,
            croppedPhotos: croppedFiles,
            livePhotos: selectedLivePhotos,
            holes: detectedHoles,
            width: frameSize.width,
            height: frameSize.height,
            transforms,
            slotWidths,
            slotHeights,
            mode: "loop",
            onProgress: (p) => {
              setProcessingProgress(75 + Math.round(p * 0.2)); // Maps 0-100 to 75-95
            }
          });
        } catch (e) {
          console.error("Gagal membuat video loop:", e);
        }
      }
      setProcessingProgress(98);
      console.log("========= PREVIEW =========");
      console.log("croppedFiles", croppedFiles);
      console.log("jumlah", croppedFiles.length);
      console.log("finalImage", finalImage);
      console.log("finalVideoTransition", finalVideoTransition);
      console.log("finalVideoLoop", finalVideoLoop);
      console.log("===========================");
      setProcessingProgress(100);
      await onProceed({ croppedFiles, finalImage, finalVideoTransition, finalVideoLoop });
    } catch (err) {
      console.error("Failed creating assets:", err);
    } finally {
      setIsCropping(false);
    }
  };

  // Helper to render photo inside a frame slot

  const renderFrameSlot = (slotIndex) => {
    const photoIdx = selectedPhotos[slotIndex];
    if (photoIdx !== undefined && capturedPhotos[photoIdx]) {
      return (
        <InteractivePhotoSlot
          photo={capturedPhotos[photoIdx]}
          slotIndex={slotIndex}
          transform={transforms[slotIndex]}
          onTransformChange={handleTransformChange}
        />
      );
    }
    return (
      <div className="preview-frame-slot-placeholder">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  };

  // Calculate dynamic mockup dimensions
  const mockupHeight = 500;
  const mockupWidth = frameRatio ? Math.round(mockupHeight * frameRatio) : 320;
  const previewScaleX = frameSize.width > 0 ? mockupWidth / frameSize.width : 1;

  const previewScaleY =
    frameSize.height > 0 ? mockupHeight / frameSize.height : 1;

  return (
    <div className="preview-page-container">
      {/* Premium Glassmorphism Loading Overlay */}
      {isCropping && (
        <div className="processing-loading-overlay">
          <div className="processing-loading-card">
            <div className="processing-spinner-container">
              <div className="processing-spinner"></div>
              <div className="processing-percentage">{processingProgress}%</div>
            </div>
            <h2 className="processing-title">Rendering Your Memories...</h2>
            <div className="processing-progress-bar-container">
              <div className="processing-progress-bar" style={{ width: `${processingProgress}%` }}></div>
            </div>
            <p className="processing-description">
              {processingProgress < 12 && "Menyusun dan memotong foto..."}
              {processingProgress >= 12 && processingProgress < 15 && "Membuat gambar cetakan final..."}
              {processingProgress >= 15 && processingProgress < 75 && "Merender video transisi (Live Photo)..."}
              {processingProgress >= 75 && processingProgress < 98 && "Merender video loop... hampir selesai!"}
              {processingProgress >= 98 && "Menyelesaikan dokumen digital..."}
            </p>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="booking-header-bar">
        <h2 className="booking-header-title">CuitBox</h2>
        <div className="email-timer-capsule">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{formatTime(previewTimer)}</span>
        </div>
      </div>

      {/* Top Center Title & Subtitle */}
      <div className="preview-header-center" style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 className="preview-main-title" style={{ textAlign: "center" }}>Choose Your Favorite Shots</h1>
        <p className="preview-main-subtitle" style={{ textAlign: "center", margin: "0" }}>
          Pilih momen-momen terbaik untuk dicetak dan disimpan selamanya.
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="preview-main-layout">
        {/* Left Column: Interactive Live Frame Preview */}
        <div className="preview-left-column">
          <div
            className={`preview-sheet-mockup `}
            style={{
              position: "relative",
              width: `${mockupWidth}px`,
              height: `${mockupHeight}px`,
              overflow: "hidden",
              backgroundColor: totalNeeded === 1 ? "#ffffff" : "transparent",
              // Clean up styles for card/newspaper layouts to fit photo slots perfectly
              ...(frameRatio && frameRatio >= 0.5
                ? {
                    padding: "0px",
                    border: "none",
                    borderRadius: "0px",
                  }
                : {}),
            }}
          >
            {/* Render slots: absolutely positioned if holes are detected from the database frame, otherwise fallback to default grids */}
            {detectedHoles.length > 0 ? (
              detectedHoles.map((hole, idx) => (
                <div
                  key={idx}
                  className="grid-slot"
                  style={{
                    position: "absolute",
                    left: `${hole.left * previewScaleX}px`,
                    top: `${hole.top * previewScaleY}px`,
                    width: `${hole.width * previewScaleX}px`,
                    height: `${hole.height * previewScaleY}px`,
                    borderRadius: "0px",
                    border: "none",
                    margin: 0,
                    padding: 0,
                    overflow: "hidden",
                  }}
                >
                  {renderFrameSlot(idx)}
                </div>
              ))
            ) : (
              <div className="preview-slots-grid">
                {Array.from({ length: totalNeeded }).map((_, idx) => (
                  <div key={idx} className="grid-slot">
                    {renderFrameSlot(idx)}
                  </div>
                ))}
              </div>
            )}

            {/* Render the frame image overlay on top of the photos */}
            {currentFrame && currentFrame.file_path && (
              <img
                crossOrigin="anonymous"
                src={frameUrl}
                alt="Frame Overlay"
                className="preview-frame-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              />
            )}

            {totalNeeded === 6 && (
              <div className="sheet-footer-text">
                <span className="footer-brand">frame</span>
                <span className="footer-sub">YOUR JOY</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Grid, Timer and Shutter/Proceed button */}
        <div className="preview-right-column">
          <div className="preview-control-panel">
            <div
              className="preview-timer-container"
              style={{ justifyContent: "flex-end" }}
            >
              <span className="preview-selection-counter">
                ({selectedPhotos.length}/{totalNeeded} dipilih)
              </span>
            </div>

            {/* Photo Grid */}
            <div className="preview-photo-gallery-grid">
              {capturedPhotos.map((photo, idx) => {
                const isSelected = selectedPhotos.includes(idx);
                const orderIndex = selectedPhotos.indexOf(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => onSelectPhoto(idx)}
                    className={`preview-gallery-item ${isSelected ? "selected" : ""}`}
                  >
                    <PreviewPhotoThumbnail photo={photo} />
                    {isSelected && (
                      <div className="preview-selection-badge">
                        {orderIndex + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleProceed}
              className="preview-submit-btn"
              disabled={selectedPhotos.length !== totalNeeded || isCropping}
            >
              {isCropping ? "⏳ Memproses Foto..." : "Lanjut ke Email"}
            </button>

            {error && (
              <p className="kiosk-error" style={{ marginTop: "16px" }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer bar */}
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
