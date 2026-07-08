/**
 * Crop photo berdasarkan transform user (drag & zoom)
 *
 * @param {File} photoFile
 * @param {{scale:number,x:number,y:number}} transform
 * @param {number} slotWidth
 * @param {number} slotHeight
 * @param {number} outputWidth
 * @param {number} outputHeight
 *
 * @returns {Promise<File>}
 */
export async function cropPhoto(
  photoFile,
  transform,
  slotWidth,
  slotHeight,
  outputWidth = null,
  outputHeight = null
) {
  return new Promise((resolve) => {
    const img = new Image();

    img.src = URL.createObjectURL(photoFile);

    img.onload = () => {
      const canvas = document.createElement("canvas");

      // Gunakan ukuran output jika diberikan.
      // Jika tidak, gunakan resolusi asli foto sebagai dasar.
      const targetWidth =
        outputWidth ??
        Math.max(slotWidth * 4, img.naturalWidth * 0.5);

      const targetHeight =
        outputHeight ??
        Math.round(targetWidth * (slotHeight / slotWidth));

      canvas.width = Math.round(targetWidth);
      canvas.height = Math.round(targetHeight);

      const ctx = canvas.getContext("2d");

      const renderRatio = targetWidth / targetHeight;
      const imageRatio = img.width / img.height;

      let baseScale;
      let baseX;
      let baseY;

      if (imageRatio > renderRatio) {
        baseScale = targetHeight / img.height;
        baseX = (targetWidth - img.width * baseScale) / 2;
        baseY = 0;
      } else {
        baseScale = targetWidth / img.width;
        baseX = 0;
        baseY = (targetHeight - img.height * baseScale) / 2;
      }

      const scaleFactor = targetWidth / slotWidth;

      const userScale = transform?.scale ?? 1;
      const userX = (transform?.x ?? 0) * scaleFactor;
      const userY = (transform?.y ?? 0) * scaleFactor;

      ctx.save();

      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.translate(userX, userY);
      ctx.scale(userScale, userScale);
      ctx.translate(-targetWidth / 2, -targetHeight / 2);

      ctx.drawImage(
        img,
        baseX,
        baseY,
        img.width * baseScale,
        img.height * baseScale
      );

      ctx.restore();

      URL.revokeObjectURL(img.src);

      canvas.toBlob(
        (blob) => {
          resolve(
            new File([blob], photoFile.name, {
              type: "image/jpeg",
            })
          );
        },
        "image/jpeg",
        1.0 // kualitas maksimum
      );
    };

    img.onerror = () => {
      resolve(photoFile);
    };
  });
}