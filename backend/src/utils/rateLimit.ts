import type { NextFunction, Request, Response } from "express";

/**
 * Minimal fixed-window per-IP limiter (single-process; fine for one Render
 * instance). Avoids pulling in a dependency for two public GET endpoints.
 */
export function rateLimit(maxRequests: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip || "unknown";
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      }
    }
    entry.count += 1;
    if (entry.count > maxRequests) {
      res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      res.status(429).json({ status: false, data: { code: "RATE_LIMITED" }, message: "Too many requests. Please slow down." });
      return;
    }
    next();
  };
}

