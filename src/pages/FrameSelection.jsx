import { useState, useEffect } from "react";

export default function FrameSelection({
  frames,
  categories = [],
  selectedFrame,
  onSelect,
  onProceed,
  error,
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600 seconds)

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Convert categories array of objects/strings to standard string array, excluding duplicates of "All"
  const rawCategories =
    categories && categories.length > 0
      ? categories.map((c) => (typeof c === "object" ? c.name : c))
      : ["Minimalist", "Cute", "Seasonal", "Pop Art"];

  const cleanCategories = rawCategories.filter(
    (c) => c && c.toLowerCase() !== "all",
  );
  const categoryList = ["All", ...cleanCategories];

  const filteredFrames =
    selectedCategory === "All"
      ? frames
      : frames.filter((f) => {
          const frameCat = f.category || f.category_name || "Minimalist";
          return frameCat === selectedCategory;
        });

  // Helper to render premium design preview based on ID
  const renderFramePreview = (frame) => {
    if (!frame?.file_path) {
      return <div className="frame-preview-box preview-default" />;
    }

    const imageUrl = frame.file_path.startsWith("http")
      ? frame.file_path
      : `http://localhost:8080/${frame.file_path}`;

    return (
      <div className="frame-preview-box preview-image">
        <img
          src={imageUrl}
          alt={frame.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    );
  };

  return (
    <div className="frame-selection-container">
      {/* Top Header Bar */}
      <div className="booking-header-bar">
        <h2 className="booking-header-title">CuitBox</h2>
        <div className="frame-timer-capsule">
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
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="frame-content-wrapper">
        <div className="frame-title-container">
          <h1 className="frame-selection-title">Choose Your Frame</h1>
          <p className="frame-selection-subtitle">
            Select a theme that matches your vibe.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="frame-categories-bar">
          <div className="frame-categories-capsule">
            {categoryList.map((category) => (
              <button
                key={category}
                className={`frame-category-btn ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Frames Grid */}
        <div className="frame-grid">
          {filteredFrames.map((frame) => {
            const isSelected = selectedFrame === frame.id;
            return (
              <div
                key={frame.id}
                onClick={() => onSelect(frame.id)}
                className={`frame-card-item ${isSelected ? "selected" : ""}`}
              >
                <div className="frame-preview-container">
                  {renderFramePreview(frame)}
                  {isSelected && (
                    <div className="frame-selected-checkmark">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div
            className="kiosk-error"
            style={{
              marginBottom: "15px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fca5a5",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {error}
          </div>
        )}

        {/* Footer Actions Row */}
        <div
          className="frame-actions-footer"
          style={{ display: "flex", gap: "12px", alignItems: "center" }}
        >
          <button
            className="btn-lanjut"
            disabled={!selectedFrame}
            onClick={() => onProceed()}
            style={{
              marginLeft: "auto",
              opacity: selectedFrame ? 1 : 0.6,
              cursor: selectedFrame ? "pointer" : "not-allowed",
            }}
          >
            Lanjut
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
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
