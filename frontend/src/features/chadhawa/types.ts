/**
 * Shapes returned by the public Chadhawa API (GET /api/chadhawa).
 *
 * These mirror the `Temple` interface in `src/data/temples.ts` so the existing
 * Chadhawa UI renders unchanged, with two differences: `image`/`images` are
 * absolute Cloudinary URLs rather than filenames under /images/temples/, and
 * `priceFrom` is the cheapest active offering rather than the Puja price.
 */

export interface PublicChadhawaOffering {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Null when the admin left the icon blank. */
  emoji: string | null;
}

export interface PublicChadhawaTemple {
  id: string;
  slug: string;
  name: string;
  location: string;
  state: string;
  deity: string;
  description: string;
  priceFrom: number;
  gradient: string | null;
  /** First image URL, or undefined when the temple has no images yet. */
  image?: string;
  /** All image URLs, in upload order. Empty when none have been uploaded. */
  images: string[];
  /** Active offerings only, in the admin's display order. */
  offerings: PublicChadhawaOffering[];
}
