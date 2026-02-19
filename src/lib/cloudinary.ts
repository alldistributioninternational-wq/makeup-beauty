// src/lib/cloudinary.ts
// Version finale - Accepte les URLs complètes Cloudinary

/**
 * Générer l'URL Cloudinary
 * Si cloudinaryId est déjà une URL complète, la retourner directement
 * Sinon, construire l'URL
 */
export function getCloudinaryUrl(
  cloudinaryId: string | null | undefined,
  options?: {
    width?: number;
  }
): string {
  if (!cloudinaryId) {
    return '/placeholder-product.jpg';
  }

  // Si c'est déjà une URL complète (commence par http), la retourner directement
  if (cloudinaryId.startsWith('http://') || cloudinaryId.startsWith('https://')) {
    return cloudinaryId;
  }

  // Sinon, construire l'URL Cloudinary
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dunc8xyjl';
  
  // URL de base sans transformation
  return `https://res.cloudinary.com/${cloudName}/image/upload/${cloudinaryId}`;
}

/**
 * Variantes d'images (toutes retournent l'URL telle quelle maintenant)
 */
export const ImageVariants = {
  thumbnail: (cloudinaryId: string) => getCloudinaryUrl(cloudinaryId),
  card: (cloudinaryId: string) => getCloudinaryUrl(cloudinaryId),
  large: (cloudinaryId: string) => getCloudinaryUrl(cloudinaryId),
  hero: (cloudinaryId: string) => getCloudinaryUrl(cloudinaryId),
  square: (cloudinaryId: string) => getCloudinaryUrl(cloudinaryId),
};

/**
 * Générer l'URL vidéo Cloudinary
 */
export function getCloudinaryVideoUrl(
  cloudinaryId: string | null | undefined,
  options?: {
    width?: number;
  }
): string {
  if (!cloudinaryId) {
    return '';
  }

  // Si c'est déjà une URL complète, la retourner directement
  if (cloudinaryId.startsWith('http://') || cloudinaryId.startsWith('https://')) {
    return cloudinaryId;
  }

  // Sinon, construire l'URL
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dunc8xyjl';
  return `https://res.cloudinary.com/${cloudName}/video/upload/${cloudinaryId}`;
}

/**
 * Obtenir le srcset pour images responsive (désactivé pour l'instant)
 */
export function getResponsiveSrcSet(cloudinaryId: string): string {
  return getCloudinaryUrl(cloudinaryId);
}

/**
 * Obtenir une image placeholder en blur (pour meilleure UX)
 */
export function getBlurPlaceholder(cloudinaryId: string): string {
  return getCloudinaryUrl(cloudinaryId);
}

/**
 * Helper pour extraire le nom de fichier depuis cloudinary_id
 */
export function getFileName(cloudinaryId: string): string {
  if (!cloudinaryId) return '';
  
  // Si c'est une URL, extraire le nom du fichier
  if (cloudinaryId.startsWith('http')) {
    const parts = cloudinaryId.split('/');
    return parts[parts.length - 1];
  }
  
  // Sinon, extraire du path
  const parts = cloudinaryId.split('/');
  return parts[parts.length - 1];
}

/**
 * Vérifier si un cloudinary_id est valide
 */
export function isValidCloudinaryId(cloudinaryId: string | null | undefined): boolean {
  if (!cloudinaryId) return false;
  return cloudinaryId.length > 0;
}

// Export du cloud name pour utilisation directe
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dunc8xyjl';