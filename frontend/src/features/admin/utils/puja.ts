// Must track MAX_IMAGE_BYTES in backend/src/middleware/upload.ts — a smaller
// value here silently rejects files the server would have accepted.
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGES_PER_UPLOAD = 10;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const IMAGE_ACCEPT_ATTR = ALLOWED_IMAGE_TYPES.join(",");

/** Mirrors the backend's slug rule: lowercase, alphanumeric, single hyphens. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface ImageSelection {
  accepted: File[];
  errors: string[];
}

/**
 * Filters a picked FileList against the same type/size limits the backend
 * enforces, so obvious rejects never cost an upload round-trip.
 */
export function validateImageFiles(files: File[]): ImageSelection {
  const accepted: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push(`${file.name}: only JPEG, PNG, WebP and AVIF are allowed`);
      continue;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      errors.push(`${file.name}: must be 10 MB or smaller`);
      continue;
    }
    accepted.push(file);
  }

  if (accepted.length > MAX_IMAGES_PER_UPLOAD) {
    errors.push(`Only the first ${MAX_IMAGES_PER_UPLOAD} images were kept`);
    accepted.length = MAX_IMAGES_PER_UPLOAD;
  }

  return { accepted, errors };
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatPrice(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}
