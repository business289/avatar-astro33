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
