import { CONFIG } from "../config";

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    if (source instanceof File || source instanceof Blob) {
      image.src = URL.createObjectURL(source);
    } else {
      image.src = source;
    }
    image.onload = () => resolve(image);
    image.onerror = reject;
  });
}

function drawVideoFrame(ctx, video, transform, slotWidth, slotHeight, dx, dy, dw, dh) {
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;
  if (!videoWidth || !videoHeight) return;

  const renderRatio = dw / dh;
  const videoRatio = videoWidth / videoHeight;

  let baseScale;
  let baseX;
  let baseY;

  if (videoRatio > renderRatio) {
    baseScale = dh / videoHeight;
    baseX = (dw - videoWidth * baseScale) / 2;
    baseY = 0;
  } else {
    baseScale = dw / videoWidth;
    baseX = 0;
    baseY = (dh - videoHeight * baseScale) / 2;
  }

  const scaleFactor = dw / slotWidth;
  const userScale = Math.min(Math.max(transform?.scale ?? 1, 1), 4);

  const renderW = videoRatio > renderRatio ? dh * videoRatio : dw;
  const renderH = videoRatio > renderRatio ? dh : dw / videoRatio;

  const zw = renderW * userScale;
  const zh = renderH * userScale;

  const maxUserX = Math.max(0, (zw - dw) / 2);
  const maxUserY = Math.max(0, (zh - dh) / 2);

  const rawUserX = (transform?.x ?? 0) * scaleFactor;
  const rawUserY = (transform?.y ?? 0) * scaleFactor;

  const userX = Math.min(Math.max(rawUserX, -maxUserX), maxUserX);
  const userY = Math.min(Math.max(rawUserY, -maxUserY), maxUserY);

  ctx.save();

  // Clip to slot boundaries
  ctx.beginPath();
  ctx.rect(dx, dy, dw, dh);
  ctx.clip();

  // Center, translate, scale
  ctx.translate(dx + dw / 2, dy + dh / 2);
  ctx.translate(userX, userY);
  ctx.scale(userScale, userScale);
  ctx.translate(-(dx + dw / 2), -(dy + dh / 2));

  ctx.drawImage(
    video,
    dx + baseX,
    dy + baseY,
    videoWidth * baseScale,
    videoHeight * baseScale
  );

  ctx.restore();
}

export async function renderFinalVideo({
  frameUrl,
  croppedPhotos,
  livePhotos,
  holes,
  width,
  height,
  transforms,
  slotWidths,
  slotHeights,
  mode = "transition", // "transition" atau "loop"
  onProgress,
}) {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Load the frame overlay image
      const frameImg = new Image();
      frameImg.crossOrigin = "anonymous";
      frameImg.src = frameUrl;
      await new Promise((res, rej) => {
        frameImg.onload = res;
        frameImg.onerror = rej;
      });

      const frameWidth = frameImg.naturalWidth;
      const frameHeight = frameImg.naturalHeight;

      // 2. Load static cropped photo images
      const loadedPhotos = [];
      for (let i = 0; i < croppedPhotos.length; i++) {
        if (croppedPhotos[i]) {
          const img = await loadImage(croppedPhotos[i]);
          loadedPhotos.push(img);
        } else {
          loadedPhotos.push(null);
        }
      }

      // 3. Create canvas and context
      const canvas = document.createElement("canvas");
      let canvasWidth = frameWidth;
      let canvasHeight = frameHeight;

      if (mode === "transition") {
        let videoWidth = 1280;
        let videoHeight = 720;
        for (let i = 0; i < livePhotos.length; i++) {
          if (livePhotos[i]) {
            try {
              const tempVid = document.createElement("video");
              tempVid.src = URL.createObjectURL(livePhotos[i]);
              await new Promise((res) => {
                tempVid.onloadedmetadata = res;
              });
              videoWidth = tempVid.videoWidth || 1280;
              videoHeight = tempVid.videoHeight || 720;
              URL.revokeObjectURL(tempVid.src);
              break;
            } catch (e) {
              console.error("Error reading temp video metadata:", e);
            }
          }
        }
        canvasWidth = videoWidth;
        canvasHeight = videoHeight;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      // Scale factor from preview size to original frame size
      const scaleX = frameWidth / width;
      const scaleY = frameHeight / height;

      // Helper to render frame frame
      const renderFrame = (activeVideos = {}) => {
        // Background putih
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, frameWidth, frameHeight);

        // Draw photos/videos for each hole
        for (let i = 0; i < holes.length; i++) {
          const hole = holes[i];
          const dx = hole.left * scaleX;
          const dy = hole.top * scaleY;
          const dw = hole.width * scaleX;
          const dh = hole.height * scaleY;

          if (activeVideos[i]) {
            // Draw current video frame
            const transform = transforms[i] || { scale: 1, x: 0, y: 0 };
            const slotW = slotWidths[i] || 146;
            const slotH = slotHeights[i] || 113;
            drawVideoFrame(ctx, activeVideos[i], transform, slotW, slotH, dx, dy, dw, dh);
          } else if (loadedPhotos[i]) {
            // Draw static cropped photo
            ctx.drawImage(loadedPhotos[i], dx, dy, dw, dh);
          }
        }

        // Draw frame overlay on top
        ctx.drawImage(frameImg, 0, 0, frameWidth, frameHeight);
      };

      // Initial render
      if (mode !== "transition") {
        renderFrame();
      } else {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 4. Set up MediaRecorder to capture canvas stream
      const stream = canvas.captureStream(30); // 30 fps
      let recorder;
      let recordedChunks = [];

      let options = { mimeType: "video/webm;codecs=vp9" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm;codecs=vp8" };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/webm" };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: "video/mp4" };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = {};
      }

      recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fileExtension = options.mimeType && options.mimeType.includes("mp4") ? "mp4" : "webm";
        const videoBlob = new Blob(recordedChunks, { type: `video/${fileExtension}` });
        resolve(videoBlob);
      };

      // Start recording
      recorder.start();

      if (mode === "transition") {
        // Sequential transitions - raw videos concatenated without frame
        for (let i = 0; i < holes.length; i++) {
          const livePhotoBlob = livePhotos[i];
          if (!livePhotoBlob) continue;

          const video = document.createElement("video");
          video.src = URL.createObjectURL(livePhotoBlob);
          video.muted = true;
          video.playsInline = true;

          await new Promise((res) => {
            video.onloadedmetadata = res;
          });

          video.play();
          
          // Force duration to 3 seconds (the actual recorded length)
          // because browser metadata duration is inaccurate/Infinity for recorded blobs.
          const duration = 3;
          const playbackRate = 1.0;
          video.playbackRate = playbackRate;

          const expectedPlayDuration = (duration / playbackRate) * 1000;
          const startTime = Date.now();

          await new Promise((res) => {
            const drawLoop = () => {
              const elapsed = Date.now() - startTime;
              if (elapsed >= expectedPlayDuration) {
                res();
                return;
              }
              // Draw video frame on canvas
              ctx.fillStyle = "#000000";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              if (onProgress) {
                const stepElapsed = Math.min(elapsed / expectedPlayDuration, 1);
                // Total progress across all N videos in transition
                const overallRatio = (i + stepElapsed) / holes.length;
                onProgress(Math.round(overallRatio * 100));
              }

              requestAnimationFrame(drawLoop);
            };
            drawLoop();
            setTimeout(res, expectedPlayDuration + 200);
          });

          URL.revokeObjectURL(video.src);
        }

      } else {
        // Simultaneous loop mode
        const videos = [];
        const activeVideosMap = {};

        for (let i = 0; i < holes.length; i++) {
          const livePhotoBlob = livePhotos[i];
          if (livePhotoBlob) {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(livePhotoBlob);
            video.muted = true;
            video.playsInline = true;
            video.loop = true;
            
            await new Promise((res) => {
              video.onloadedmetadata = res;
            });
            
            // Force duration to 3 seconds (the actual recorded length)
            const duration = 3;
            const playbackRate = 1.0;
            video.playbackRate = playbackRate;

            videos.push(video);
            activeVideosMap[i] = video;
            video.play();
          } else {
            videos.push(null);
          }
        }

        // Run the looping rendering for full duration of the longest video
        const maxVideoDuration = 3 / 1.0; // 3 seconds
        const runDuration = maxVideoDuration * 1000;
        const startTime = Date.now();
        
        while (Date.now() - startTime < runDuration) {
          renderFrame(activeVideosMap);

          if (onProgress) {
            const elapsed = Date.now() - startTime;
            const ratio = Math.min(elapsed / runDuration, 1);
            onProgress(Math.round(ratio * 100));
          }

          await new Promise((r) => requestAnimationFrame(r));
        }

        // Clean up
        videos.forEach((video) => {
          if (video) {
            video.pause();
            URL.revokeObjectURL(video.src);
          }
        });
      }

      // Stop recorder
      recorder.stop();
    } catch (err) {
      reject(err);
    }
  });
}
