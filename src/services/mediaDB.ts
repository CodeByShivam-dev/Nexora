const DB_NAME = 'nexora_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_assets';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE_BYTES = 18 * 1024 * 1024; // 18MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const memoryCache = new Map<string, string>();

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable in this browser environment.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB.'));
  });
}

export function validateMediaFile(
  file: File,
  kind: 'image' | 'video' | 'any' = 'any'
): { valid: boolean; error?: string; mediaType?: 'image' | 'video' } {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (kind === 'image' && !isImage) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, WebP, or GIF).' };
  }
  if (kind === 'video' && !isVideo) {
    return { valid: false, error: 'Please select a valid video file (MP4, WebM, or MOV).' };
  }
  if (kind === 'any' && !isImage && !isVideo) {
    return { valid: false, error: 'Unsupported media format. Use JPEG, PNG, WebP, GIF, MP4, or WebM.' };
  }

  if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: 'Image size must be 5 MB or smaller for local browser storage.' };
  }
  if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
    return { valid: false, error: 'Video size must be 18 MB or smaller for local browser storage.' };
  }

  return { valid: true, mediaType: isImage ? 'image' : 'video' };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read selected file.'));
    reader.readAsDataURL(file);
  });
}

export async function saveMediaFile(file: File): Promise<string> {
  const id = `media_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const idbUri = `idb://${id}`;

  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(file, id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error ?? new Error('Failed to store media in IndexedDB.'));
    });
    const objectUrl = URL.createObjectURL(file);
    memoryCache.set(idbUri, objectUrl);
    return idbUri;
  } catch {
    // Graceful fallback to DataURL for small files if IndexedDB fails
    if (file.size <= 2 * 1024 * 1024) {
      return await fileToDataUrl(file);
    }
    throw new Error('Local storage quota exceeded or IndexedDB is blocked.');
  }
}

export async function resolveMediaUrl(uri?: string): Promise<string | null> {
  if (!uri) return null;
  if (!uri.startsWith('idb://')) return uri;

  const cached = memoryCache.get(uri);
  if (cached) return cached;

  const key = uri.replace('idb://', '');
  try {
    const db = await openMediaDB();
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
    if (!blob) return null;
    const objectUrl = URL.createObjectURL(blob);
    memoryCache.set(uri, objectUrl);
    return objectUrl;
  } catch {
    return null;
  }
}

export async function clearMediaDB(): Promise<void> {
  memoryCache.forEach((url) => URL.revokeObjectURL(url));
  memoryCache.clear();
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore cleanup error
  }
}
