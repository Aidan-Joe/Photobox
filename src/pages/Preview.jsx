import { useState, useEffect, useRef } from "react";

import { cropPhoto } from "../utils/cropPhoto";
import { detectHoles } from "../utils/detectHoles";
import { renderFinalImage } from "../utils/renderFinalImage";

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
    if (!photo) return;
    const objectUrl = URL.createObjectURL(photo);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photo]);

  const t = transform || { scale: 1, x: 0, y: 0 };

  const clampTransform = (x, y, scale) => {
    if (!containerRef.current) return { x, y, scale };
    const slotWidth = containerRef.current.clientWidth;
    const slotHeight = containerRef.current.clientHeight;

    // Calculate rendered size under object-fit: cover
    const rs = slotWidth / slotHeight;
    const ri = imgSize.w / imgSize.h;

    let rw, rh;
    if (ri > rs) {
      rw = slotHeight * ri;
      rh = slotHeight;
    } else {
      rw = slotWidth;
      rh = slotWidth / ri;
    }

    const zw = rw * scale;
    const zh = rh * scale;

    const maxX = Math.max(0, (zw - slotWidth) / 2);
    const minX = -maxX;
    const maxY = Math.max(0, (zh - slotHeight) / 2);
    const minY = -maxY;

    return {
      scale,
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  };

  const updateTransform = (newT) => {
    const nextT = { ...t, ...newT };
    const clamped = clampTransform(nextT.x, nextT.y, nextT.scale);
    onTransformChange(slotIndex, clamped);
  };

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
        className="preview-gallery-photo"
        onLoad={(e) =>
          setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
        }
        style={{
          transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
          transformOrigin: "center",
          transition: isDragging ? "none" : "transform 0.1s ease-out",
          userSelect: "none",
          pointerEvents: "none",
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
  onSelectPhoto,
  onProceed,
  selectedFrame,
  error,
  frames = [],
}) {
  const [transforms, setTransforms] = useState({});
  const [isCropping, setIsCropping] = useState(false);
  const [frameRatio, setFrameRatio] = useState(null);
  const [detectedHoles, setDetectedHoles] = useState([]);

  const currentFrame = frames.find(
    (f) => String(f.id) === String(selectedFrame),
  );
  const totalNeeded = currentFrame
    ? parseInt(currentFrame.photo_count, 10) || 6
    : 6;

  useEffect(() => {
    if (currentFrame && currentFrame.file_path) {
      // Use the CORS-enabled backend media proxy route
      const imgPath = `http://localhost:8080/api/customer/frame/media?path=${encodeURIComponent(currentFrame.file_path)}`;

      fetch(imgPath)
        .then((res) => res.blob())
        .then((blob) => {
          const localUrl = URL.createObjectURL(blob);
          const img = new Image();
          img.src = localUrl;
          img.onload = () => {
            const ratio = img.width / img.height;
            setFrameRatio(ratio);

            const mockupH = 500;
            const mockupW = Math.round(mockupH * ratio);

            const holes = detectHoles(img, mockupW, mockupH);
            setDetectedHoles(holes);
            URL.revokeObjectURL(localUrl);
          };
          img.onerror = () => {
            setFrameRatio(null);
            setDetectedHoles([]);
            URL.revokeObjectURL(localUrl);
          };
        })
        .catch((err) => {
          console.error("Failed to fetch frame image for canvas scan:", err);
          // Fallback to proxy direct load
          const img = new Image();
          img.src = imgPath;
          img.onload = () => {
            const ratio = img.width / img.height;
            setFrameRatio(ratio);
          };
        });
    } else {
      setFrameRatio(null);
      setDetectedHoles([]);
    }
  }, [currentFrame]);

  const handleTransformChange = (slotIndex, newTransform) => {
    setTransforms((prev) => ({
      ...prev,
      [slotIndex]: newTransform,
    }));
  };

  const handleProceed = async () => {
    setIsCropping(true);

    try {
      const croppedFiles = [];

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
          hole.width * scaleX,
          hole.height * scaleY,
        );

        croppedFiles.push(cropped);
      }

      // Frame URL
      const frameUrl = currentFrame?.file_path
        ? `http://localhost:8080/api/customer/frame/media?path=${encodeURIComponent(
            currentFrame.file_path,
          )}`
        : null;

      // Render final image
      let finalImage = null;

      if (frameUrl && detectedHoles.length > 0 && croppedFiles.length > 0) {
        finalImage = await renderFinalImage({
          frameUrl,

          croppedPhotos: croppedFiles,

          holes: detectedHoles,

          width: mockupWidth,

          height: mockupHeight,
        });
        console.log(finalImage);

        const previewUrl = URL.createObjectURL(finalImage);

        window.open(previewUrl);
      }

      onProceed({
        croppedFiles,

        finalImage,
      });
    } catch (err) {
      console.error("Failed creating final image:", err);
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

  const normalizeFrameId = (id) => {
    const idStr = String(id || "");
    const match = idStr.match(/FRM-0*(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      return ((num - 1) % 6) + 1;
    }
    if (idStr === "1" || idStr === "frm_demo_001") return 1;
    if (idStr === "2" || idStr === "frm_demo_002") return 2;
    if (idStr === "3" || idStr === "frm_demo_003") return 3;
    if (idStr === "4" || idStr === "frm_demo_004") return 4;
    if (idStr === "5" || idStr === "frm_demo_005") return 5;
    if (idStr === "6" || idStr === "frm_demo_006") return 6;
    return Number(idStr) || 1;
  };

  const normalizedFrameNum = normalizeFrameId(selectedFrame);

  // Helper to determine frame style classes based on selectedFrame
  const getFrameThemeClass = () => {
    if (currentFrame && currentFrame.file_path) {
      return "theme-custom-db";
    }
    switch (normalizedFrameNum) {
      case 1:
        return "theme-soft-cloud";
      case 2:
        return "theme-midnight-neon";
      case 3:
        return "theme-cherry-blossom";
      case 4:
        return "theme-classic-white";
      case 5:
        return "theme-kawaii-kitty";
      case 6:
        return "theme-retro-wave";
      default:
        return "theme-soft-cloud";
    }
  };

  const getLayoutClass = () => {
    if (totalNeeded === 3) {
      if (frameRatio && frameRatio >= 0.5) {
        return "layout-3-photos-newspaper";
      }
      return "layout-3-photos";
    }
    if (totalNeeded === 2) {
      if (frameRatio && frameRatio >= 0.5) {
        return "layout-2-photos-newspaper";
      }
      return "layout-2-photos";
    }
    if (totalNeeded === 1) return "layout-1-photo";
    return `layout-${totalNeeded}-photos`;
  };

  // Calculate dynamic mockup dimensions
  const mockupHeight = 500;
  const mockupWidth = frameRatio ? Math.round(mockupHeight * frameRatio) : 320;

  return (
    <div className="preview-page-container">
      {/* Top Header Bar */}
      <div className="booking-header-bar">
        <h2 className="booking-header-title">SnapBox Studio</h2>
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

      {/* Main Two-Column Layout */}
      <div className="preview-main-layout">
        {/* Left Column: Interactive Live Frame Preview */}
        <div className="preview-left-column">
          <div
            className={`preview-sheet-mockup ${getFrameThemeClass()} ${getLayoutClass()}`}
            style={{
              width: `${mockupWidth}px`,
              height: `${mockupHeight}px`,
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
            {/* Soft Cloud specific background elements */}
            {totalNeeded === 6 && normalizedFrameNum === 1 && (
              <>
                <div className="deco-pixel-yellow left-top">★</div>
                <div className="deco-mushroom left-mid">🍄</div>
                <div className="deco-pixel-yellow right-mid">★</div>
                <div className="deco-mushroom right-bottom">🍄</div>
                <div className="deco-green-blob left-bottom"></div>
                <div className="deco-green-blob right-bottom-blob"></div>
              </>
            )}

            {/* Midnight Neon specific background elements */}
            {totalNeeded === 6 && normalizedFrameNum === 2 && (
              <>
                <div className="neon-circle c-1"></div>
                <div className="neon-circle c-2"></div>
              </>
            )}

            {/* Cherry Blossom specific background elements */}
            {totalNeeded === 6 && normalizedFrameNum === 3 && (
              <>
                <div className="deco-petal p-1">🌸</div>
                <div className="deco-petal p-2">🌸</div>
                <div className="deco-petal p-3">🌸</div>
              </>
            )}

            {/* Kawaii Kitty specific background elements */}
            {totalNeeded === 6 && normalizedFrameNum === 5 && (
              <>
                <div className="kitty-whiskers l"></div>
                <div className="kitty-whiskers r"></div>
              </>
            )}

            {/* Retro Wave specific background elements */}
            {totalNeeded === 6 && normalizedFrameNum === 6 && (
              <>
                <div className="retro-grid-bg"></div>
                <div className="retro-sun-bg"></div>
              </>
            )}

            {/* Render slots: absolutely positioned if holes are detected from the database frame, otherwise fallback to default grids */}
            {detectedHoles.length > 0 ? (
              detectedHoles.map((hole, idx) => (
                <div
                  key={idx}
                  className="grid-slot"
                  style={{
                    position: "absolute",
                    left: `${hole.left}px`,
                    top: `${hole.top}px`,
                    width: `${hole.width}px`,
                    height: `${hole.height}px`,
                    borderRadius: "0px",
                    border: "none",
                    margin: 0,
                    padding: 0,
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
                src={`http://localhost:8080/api/customer/frame/media?path=${encodeURIComponent(currentFrame.file_path)}`}
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

        {/* Right Column: Title, Subtitle, Grid, Timer and Shutter/Proceed button */}
        <div className="preview-right-column">
          <div className="preview-control-panel">
            <h1 className="preview-main-title">Choose Your Favorite Shots</h1>
            <p className="preview-main-subtitle">
              Pilih momen-momen terbaik untuk dicetak dan disimpan selamanya.
            </p>

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
        <div>© 2026 PhotoBox. All rights reserved.</div>
      </div>
    </div>
  );
}
