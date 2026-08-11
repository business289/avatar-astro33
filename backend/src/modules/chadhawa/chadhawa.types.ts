export interface ChadhawaDTO {
  id: string;
  templeId: string;
  templeName: string;
  templeSlug: string;
  name: string;
  description: string;
  price: number;
  emoji: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface ChadhawaListResult {
  items: ChadhawaDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListChadhawasInput {
  templeId?: string;
  search?: string;
  /** Omitted means "any status". */
  isActive?: boolean;
  sortBy: "displayOrder" | "createdAt" | "price" | "name";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

export interface ChadhawaInput {
  templeId: string;
  name: string;
  description: string;
  price: number;
  emoji?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export type UpdateChadhawaInput = Partial<ChadhawaInput>;

/**
 * Shapes returned by the public (unauthenticated) Chadhawa endpoints.
 * Deliberately narrower than the admin DTOs: no timestamps, no inactive
 * offerings — only what the public Chadhawa pages render.
 */
export interface PublicChadhawaOfferingDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string | null;
}

export interface PublicChadhawaTempleDTO {
  id: string;
  slug: string;
  name: string;
  location: string;
  state: string;
  deity: string;
  description: string;
  /** Cheapest active offering, or 0 when the temple has none. */
  priceFrom: number;
  gradient: string | null;
  /** First image URL — convenience for card thumbnails. */
  image?: string;
  /** Every image URL, in upload order, for the detail-page carousel. */
  images: string[];
  offerings: PublicChadhawaOfferingDTO[];
}
