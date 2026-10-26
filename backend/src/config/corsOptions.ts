import type { CorsOptions } from "cors";

export const EXPLICIT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8081",
  "http://192.168.1.126:8081",
  "https://avatar-astro33.vercel.app",
];

// This project's actual Vite dev port (see frontend/vite.config.ts) — kept
// in addition to the explicit list above since that's what's really running.
// Also allows LAN IPs (192.168.x.x / 10.x.x.x / 172.16-31.x.x) so phones and
// other devices on the same WiFi can hit a locally-running backend during dev.
export const LOCAL_DEV_ORIGIN_REGEX =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

/**
 * CORS_ORIGIN is one origin or a comma-separated list of origins. It is read on
 * every request (not at import time) so it always reflects the loaded .env.
 */
export function configuredOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  return (env.CORS_ORIGIN ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

export function isAllowedOrigin(origin: string, env: NodeJS.ProcessEnv = process.env): boolean {
  return (
    EXPLICIT_ALLOWED_ORIGINS.includes(origin) ||
    LOCAL_DEV_ORIGIN_REGEX.test(origin) ||
    configuredOrigins(env).includes(origin)
  );
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server proxy, curl, mobile)
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin)) return callback(null, true);
    console.warn(`✗ CORS rejected origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};
