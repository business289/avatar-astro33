/**
 * Shapes returned by the public temple API (GET /api/temples).
 *
 * These intentionally mirror the `Temple` / `Puja` interfaces in
 * `src/data/temples.ts` so the existing Puja UI renders unchanged, with two
 * differences: `image`/`images` are absolute Cloudinary URLs rather than
 * filenames under /images/temples/, and `gradient` may be null.
 */

export interface PublicPuja {
  id: string;
  name: string;
  price: number;
  duration: string;
  benefits: string[];
}

export interface PublicTemple {
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
  pujas: PublicPuja[];
}
