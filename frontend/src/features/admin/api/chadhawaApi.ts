import { authRequest } from "@/lib/authClient";
import type {
  AdminChadhawa,
  AdminChadhawaListResult,
  ChadhawaFormValues,
} from "../types/chadhawa";

const BASE = "/admin/chadhawa";

export interface ListChadhawasParams {
  templeId?: string;
  search?: string;
  isActive?: boolean;
  sortBy?: "displayOrder" | "createdAt" | "price" | "name";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const chadhawaApi = {
  listChadhawas({
    templeId,
    search,
    isActive,
    sortBy = "displayOrder",
    sortOrder = "asc",
    page = 1,
    limit = 20,
  }: ListChadhawasParams = {}) {
    const query = new URLSearchParams({
      sortBy,
      sortOrder,
      page: String(page),
      limit: String(limit),
    });
    if (templeId) query.set("templeId", templeId);
    if (search?.trim()) query.set("search", search.trim());
    if (isActive !== undefined) query.set("isActive", String(isActive));

    return authRequest<AdminChadhawaListResult>(`${BASE}?${query.toString()}`);
  },

  getChadhawa(chadhawaId: string) {
    return authRequest<AdminChadhawa>(`${BASE}/${chadhawaId}`);
  },

  createChadhawa(values: ChadhawaFormValues) {
    return authRequest<AdminChadhawa>(BASE, {
      method: "POST",
      body: values,
    });
  },

  updateChadhawa(chadhawaId: string, values: Partial<ChadhawaFormValues>) {
    return authRequest<AdminChadhawa>(`${BASE}/${chadhawaId}`, {
      method: "PUT",
      body: values,
    });
  },

  deleteChadhawa(chadhawaId: string) {
    return authRequest<null>(`${BASE}/${chadhawaId}`, { method: "DELETE" });
  },
};
