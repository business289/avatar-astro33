export interface TempleImageDTO {
  id: string;
  url: string;
  publicId: string;
  createdAt: Date;
}

export interface PujaDTO {
  id: string;
  templeId: string;
  name: string;
  price: number;
  duration: string;
  benefits: string[];
  createdAt: Date;
  updatedAt: Date | null;
}

export interface TempleDTO {
  id: string;
  slug: string;
  name: string;
  location: string;
  state: string;
  deity: string;
  description: string;
  priceFrom: number;
  gradient: string | null;
  images: TempleImageDTO[];
  pujas: PujaDTO[];
  imageCount: number;
  pujaCount: number;
  createdAt: Date;
  updatedAt: Date | null;
}

/** List rows omit the nested pujas/images arrays but keep a cover image. */
export interface TempleListItemDTO
  extends Omit<TempleDTO, "images" | "pujas"> {
  coverImage: TempleImageDTO | null;
}

export interface TempleListResult {
  items: TempleListItemDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListTemplesInput {
  search?: string;
  page: number;
  limit: number;
}

export interface CreateTempleInput {
  name: string;
  slug: string;
  location: string;
  state: string;
  deity: string;
  description: string;
  priceFrom: number;
  gradient?: string | null;
}

export type UpdateTempleInput = Partial<CreateTempleInput>;

export interface PujaInput {
  name: string;
  price: number;
  duration: string;
  benefits: string[];
}

export type UpdatePujaInput = Partial<PujaInput>;

/**
 * Shape returned by the public (unauthenticated) temple endpoints.
 * Deliberately narrower than TempleDTO: no Cloudinary publicIds, no
 * timestamps, no counts — only what the public Puja pages render.
 */
export interface PublicPujaDTO {
  id: string;
  name: string;
  price: number;
  duration: string;
  benefits: string[];
}

export interface PublicTempleDTO {
  id: string;
  slug: string;
  name: string;
  location: string;
  state: string;
  deity: string;
  description: string;
  priceFrom: number;
  gradient: string | null;
  /** First image URL — convenience for card thumbnails. */
  image?: string;
  /** Every image URL, in upload order, for the detail-page carousel. */
  images: string[];
  pujas: PublicPujaDTO[];
}

/** Multer's in-memory file shape, narrowed to what the service needs. */
export interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}
