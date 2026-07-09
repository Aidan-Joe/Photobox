function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    // WAJIB sebelum image.src
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

async function loadImageWithSize(source) {
  const image = await loadImage(source);

  return {
    image,
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
}

function canvasToFile(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(
          new File([blob], "final.png", {
            type: "image/png",
          }),
        );
      },
      "image/png",
      1.0,
    );
  });
}

export async function renderFinalImage({
  frameUrl,
  croppedPhotos,
  holes,
  width,
  height,
}) {
  // Ambil frame dengan ukuran asli
  const {
    image: frame,
    width: frameWidth,
    height: frameHeight,
  } = await loadImageWithSize(frameUrl);

  // Canvas mengikuti resolusi asli frame
  const canvas = document.createElement("canvas");
  canvas.width = frameWidth;
  canvas.height = frameHeight;

  const ctx = canvas.getContext("2d");

  // Background putih
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, frameWidth, frameHeight);

  // Skala dari preview ke resolusi asli
  const scaleX = frameWidth / width;
  const scaleY = frameHeight / height;

  // Render semua foto
  for (let i = 0; i < holes.length; i++) {
    if (!croppedPhotos[i]) continue;

    const photo = await loadImage(croppedPhotos[i]);
    const hole = holes[i];

    ctx.drawImage(
      photo,
      hole.left * scaleX,
      hole.top * scaleY,
      hole.width * scaleX,
      hole.height * scaleY,
    );
  }

  // Overlay frame paling atas
  ctx.drawImage(frame, 0, 0, frameWidth, frameHeight);

  return await canvasToFile(canvas);
}
