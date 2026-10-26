import { API_BASE_URL } from "@/lib/api";
import type { PanchangData, PanchangPlace } from "@/types/panchang";

export class PanchangApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code = "REQUEST_FAILED", status = 0) {
    super(message);
    this.name = "PanchangApiError";
    this.code = code;
    this.status = status;
  }
}

interface Envelope<T> {
  status: boolean;
  data: T;
  message?: string;
}

async function getJson<T>(path: string, params: Record<string, string | number | undefined>, signal?: AbortSignal): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}?${qs.toString()}`, { signal });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") throw err;
    throw new PanchangApiError("Could not reach the server. Check your connection and try again.", "NETWORK_ERROR");
  }

  let body: Envelope<T & { code?: string }> | null = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON response, handled below
  }

  if (!res.ok || !body || body.status === false) {
    const code = (body?.data as { code?: string } | undefined)?.code ?? "REQUEST_FAILED";
    throw new PanchangApiError(body?.message || "Something went wrong. Please try again.", code, res.status);
  }
  return body.data;
}

export interface PanchangRequest {
  /** YYYY-MM-DD. Omit for "today at the selected place". */
  date?: string;
  place: PanchangPlace;
}

export function fetchPanchang({ date, place }: PanchangRequest, signal?: AbortSignal): Promise<PanchangData> {
  return getJson<PanchangData>(
    "/panchang",
    { date, lat: place.latitude, lon: place.longitude, name: place.name },
    signal,
  );
}

export function searchPlaces(q: string, signal?: AbortSignal): Promise<PanchangPlace[]> {
  return getJson<PanchangPlace[]>("/panchang/locations", { q }, signal);
}
