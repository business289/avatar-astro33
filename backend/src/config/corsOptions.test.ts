import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import cors from "cors";
import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configuredOrigins, corsOptions } from "./corsOptions.js";
import { createInnerVoiceRouter } from "../routes/innerVoiceRoutes.js";

let server: Server;
let base: string;

beforeEach(async () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  const app = express();
  app.use(cors(corsOptions)); // same order as src/index.ts: CORS before body parsing and routes
  app.use(express.json());
  app.use("/api/inner-voice", createInnerVoiceRouter());
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.status || 500).json({ success: false, error: err.message });
  });
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => resolve());
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/inner-voice/complete`;
});

afterEach(async () => {
  delete process.env.CORS_ORIGIN;
  vi.restoreAllMocks();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const preflight = (origin: string, headers = "content-type") =>
  fetch(base, {
    method: "OPTIONS",
    headers: { Origin: origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": headers },
  });

describe("CORS for the Inner Voice endpoint", () => {
  it("answers the local frontend's preflight (http://localhost:8081)", async () => {
    const res = await preflight("http://localhost:8081");
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("http://localhost:8081");
    expect(res.headers.get("access-control-allow-methods")).toContain("POST");
    expect(res.headers.get("access-control-allow-headers")?.toLowerCase()).toContain("content-type");
    expect(res.headers.get("access-control-allow-credentials")).toBe("true");
  });

  it("still allows the production frontend", async () => {
    const res = await preflight("https://avatar-astro33.vercel.app");
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://avatar-astro33.vercel.app");
  });

  it("does not grant access to an unapproved origin", async () => {
    for (const origin of ["https://evil.example.com", "http://localhost.evil.com", "https://avatar-astro33.vercel.app.evil.com"]) {
      const res = await preflight(origin);
      expect(res.headers.get("access-control-allow-origin")).toBeNull();
      expect(res.status).not.toBe(204);
    }
  });

  it("a real POST from the local origin reaches the route (validation error, not a CORS block)", async () => {
    const res = await fetch(base, {
      method: "POST",
      headers: { Origin: "http://localhost:8081", "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    expect(res.headers.get("access-control-allow-origin")).toBe("http://localhost:8081");
    expect(((await res.json()) as any).data.code).toBe("INVALID_REQUEST");
  });

  it("CORS_ORIGIN accepts one origin or a comma-separated list, without widening access", async () => {
    process.env.CORS_ORIGIN = "https://app.example.com, https://staging.example.com/";
    expect(configuredOrigins()).toEqual(["https://app.example.com", "https://staging.example.com"]);
    for (const o of ["https://app.example.com", "https://staging.example.com"]) {
      expect((await preflight(o)).headers.get("access-control-allow-origin")).toBe(o);
    }
    expect((await preflight("https://other.example.com")).headers.get("access-control-allow-origin")).toBeNull();
    expect((await preflight("https://avatar-astro33.vercel.app")).headers.get("access-control-allow-origin")).toBe("https://avatar-astro33.vercel.app");
  });
});
