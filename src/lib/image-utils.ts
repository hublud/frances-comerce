/**
 * Image processing utilities for Francielle Admin.
 * Resizes large camera photos (e.g. 5-15MB phone photos) client-side to
 * crisp, web-optimized 1200px JPEGs (~150-250KB).
 * This ensures fast loading on customer devices and prevents exceeding
 * storage or payload quotas.
 */

export async function processImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new (typeof window !== 'undefined' ? window.Image : Image)();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function processMultipleImageFiles(
  files: FileList | File[]
): Promise<string[]> {
  const fileArray = Array.from(files);
  const results: string[] = [];
  for (const file of fileArray) {
    try {
      const dataUrl = await processImageFile(file);
      results.push(dataUrl);
    } catch (e) {
      console.warn('Failed to process image file', file.name, e);
    }
  }
  return results;
}
