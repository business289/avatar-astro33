/**
 * Shapes returned by the public Shop API (GET /api/shop/categories, /api/shop/products).
 *
 * These mirror the `Product`/`ProductCategory` shapes in `src/data/products.ts` so the
 * existing Shop UI renders unchanged, with `image` now an absolute Cloudinary URL rather
 * than a filename under /images/shop/, and `category` a relation instead of a fixed union.
 */

export interface PublicShopCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PublicShopProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  description: string;
  benefits: string[];
  authenticity: string;
  gradient: string | null;
  image: string | null;
  category: PublicShopCategory;
}
