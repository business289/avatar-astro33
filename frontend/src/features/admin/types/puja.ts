export interface AdminTempleImage {
  id: string;
  url: string;
  publicId: string;
  createdAt: string;
}

export interface AdminPuja {
  id: string;
  templeId: string;
  name: string;
  price: number;
  duration: string;
  benefits: string[];
  createdAt: string;
  updatedAt: string | null;
}

interface TempleBase {
  id: string;
  slug: string;
  name: string;
  location: string;
  state: string;
  deity: string;
  description: string;
  priceFrom: number;
  gradient: string | null;
  imageCount: number;
  pujaCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminTempleListItem extends TempleBase {
  coverImage: AdminTempleImage | null;
}

export interface AdminTemple extends TempleBase {
  images: AdminTempleImage[];
  pujas: AdminPuja[];
}

export interface AdminTempleListResult {
  items: AdminTempleListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TempleFormValues {
  name: string;
  slug: string;
  location: string;
  state: string;
  deity: string;
  description: string;
  priceFrom: number;
  gradient?: string;
}

export interface PujaFormValues {
  name: string;
  price: number;
  duration: string;
  benefits: string[];
}

export interface DeleteTempleResult {
  deletedImages: number;
  orphanedImages: string[];
}
