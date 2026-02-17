// src/lib/compress.ts
// Compression image via Canvas + vidéo via MediaRecorder

// ─── COMPRESSION IMAGE ─────────────────────────────────────────────────
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;  // 0 à 1
    outputFormat?: 'image/webp' | 'image/jpeg';
  } = {}
): Promise<File> {
  const {
    maxWidth = 1200,
    maxHeight = 1600,
    quality = 0.80,
    outputFormat = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calcul des dimensions en conservant le ratio
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression échouée'));
          const ext = outputFormat === 'image/webp' ? 'webp' : 'jpg';
          const compressed = new File([blob], `compressed.${ext}`, { type: outputFormat });
          resolve(compressed);
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => reject(new Error('Chargement image échoué'));
    img.src = url;
  });
}

// ─── COMPRESSION VIDÉO ─────────────────────────────────────────────────
// Utilise MediaRecorder pour réencoder la vidéo à une qualité réduite
export async function compressVideo(
  file: File,
  options: {
    maxSizeMB?: number;     // Taille cible en MB
    videoBitrate?: number;  // bps, ex: 1_000_000 = 1 Mbps
    onProgress?: (progress: number) => void;
  } = {}
): Promise<File> {
  const {
    maxSizeMB = 20,
    videoBitrate = 1_500_000,
    onProgress,
  } = options;

  // Si la vidéo est déjà petite, on ne compresse pas
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB <= maxSizeMB) {
    onProgress?.(100);
    return file;
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;

    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(video.videoWidth, 1280);
      canvas.height = Math.round((canvas.width / video.videoWidth) * video.videoHeight);

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));

      const stream = canvas.captureStream(30);
      const chunks: BlobPart[] = [];

      // Choisir le meilleur codec supporté
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: videoBitrate,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        URL.revokeObjectURL(url);
        const blob = new Blob(chunks, { type: mimeType });
        const compressed = new File([blob], 'compressed.webm', { type: mimeType });
        onProgress?.(100);
        resolve(compressed);
      };

      recorder.start(100);
      video.currentTime = 0;

      const duration = video.duration * 1000;
      let startTime: number;

      const drawFrame = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min((elapsed / duration) * 100, 99);
        onProgress?.(Math.round(progress));

        if (video.ended || elapsed >= duration) {
          recorder.stop();
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(drawFrame);
      };

      video.play();
      requestAnimationFrame(drawFrame);
    };

    video.onerror = () => reject(new Error('Chargement vidéo échoué'));
  });
}

// ─── UTILITAIRE : Taille lisible ────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}