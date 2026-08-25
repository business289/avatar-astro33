import { authRequest } from "@/lib/authClient";
import type {
  AdminPuja,
  AdminTemple,
  AdminTempleImage,
  AdminTempleListResult,
  DeleteTempleResult,
  PujaFormValues,
  TempleFormValues,
} from "../types/puja";

const BASE = "/admin/puja";

export interface ListTemplesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const pujaApi = {
  listTemples({ search, page = 1, limit = 20 }: ListTemplesParams = {}) {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search?.trim()) query.set("search", search.trim());

    return authRequest<AdminTempleListResult>(
      `${BASE}/temples?${query.toString()}`,
    );
  },

  getTemple(templeId: string) {
    return authRequest<AdminTemple>(`${BASE}/temples/${templeId}`);
  },

  createTemple(values: TempleFormValues) {
    return authRequest<AdminTemple>(`${BASE}/temples`, {
      method: "POST",
      body: values,
    });
  },

  updateTemple(templeId: string, values: Partial<TempleFormValues>) {
    return authRequest<AdminTemple>(`${BASE}/temples/${templeId}`, {
      method: "PUT",
      body: values,
    });
  },

  deleteTemple(templeId: string) {
    return authRequest<DeleteTempleResult>(`${BASE}/temples/${templeId}`, {
      method: "DELETE",
    });
  },

  uploadTempleImages(templeId: string, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    return authRequest<AdminTempleImage[]>(
      `${BASE}/temples/${templeId}/images`,
      { method: "POST", body: formData },
    );
  },

  deleteTempleImage(imageId: string) {
    return authRequest<null>(`${BASE}/images/${imageId}`, { method: "DELETE" });
  },

  listPujas(templeId: string) {
    return authRequest<AdminPuja[]>(`${BASE}/temples/${templeId}/pujas`);
  },

  createPuja(templeId: string, values: PujaFormValues) {
    return authRequest<AdminPuja>(`${BASE}/temples/${templeId}/pujas`, {
      method: "POST",
      body: values,
    });
  },

  updatePuja(pujaId: string, values: Partial<PujaFormValues>) {
    return authRequest<AdminPuja>(`${BASE}/pujas/${pujaId}`, {
      method: "PUT",
      body: values,
    });
  },

  deletePuja(pujaId: string) {
    return authRequest<null>(`${BASE}/pujas/${pujaId}`, { method: "DELETE" });
  },
};
