export interface AdminChadhawa {
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
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminChadhawaListResult {
  items: AdminChadhawa[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChadhawaFormValues {
  templeId: string;
  name: string;
  description: string;
  price: number;
  emoji?: string;
  isActive: boolean;
  displayOrder: number;
}
