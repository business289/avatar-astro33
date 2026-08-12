// Must track MAX_IMAGE_BYTES in backend/src/middleware/upload.ts — a smaller
// value here silently rejects files the server would have accepted.
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

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

/** Validates a single picked image against the same limits the backend enforces. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `${file.name}: only JPEG, PNG, WebP and AVIF are allowed`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: must be 10 MB or smaller`;
  }
  return null;
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
