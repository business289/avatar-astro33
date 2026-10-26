import { Router, Request, Response } from "express";
import { ChatMessage, InnerVoiceAIError, groqCompletion } from "../services/groqService.js";
import { rateLimit } from "../utils/rateLimit.js";

/**
 * Inner Voice API (mounted at /api/inner-voice).
 *
 *   POST /complete  – every Inner Voice AI request (Groq, server-side key only)
 *   POST /tts       – Sarvam text-to-speech proxy
 *
 * The browser never talks to Groq and never holds its key. Prompts are still built
 * by the pages, so this endpoint is deliberately narrow: only whitelisted features,
 * server-controlled temperature / output format / token caps, bounded message
 * counts and sizes, per-IP rate limits and a global in-flight cap.
 *
 * Responses: success `{ status: true, data }`; failure `{ status: false, data: { code }, message }`.
 */

type Format = "json" | "text";

interface FeatureConfig {
  format: Format;
  temperature: number;
  /** Largest visible output the client may request for this feature. */
  maxTokens: number;
}

export const INNER_VOICE_FEATURES: Record<string, FeatureConfig> = {
  "karma-diagnosis": { format: "json", temperature: 0.7, maxTokens: 1500 },
  "guru-chat": { format: "json", temperature: 0.7, maxTokens: 1000 },
  "chat-report": { format: "json", temperature: 0.6, maxTokens: 4000 },
  "dashboard-score": { format: "json", temperature: 0.7, maxTokens: 1000 },
  "journal-dashboard": { format: "json", temperature: 0.7, maxTokens: 1500 },
  "journal-reflection": { format: "json", temperature: 0.7, maxTokens: 800 },
  "journal-eod": { format: "json", temperature: 0.7, maxTokens: 800 },
  wisdom: { format: "json", temperature: 0.7, maxTokens: 1500 },
  "voice-reply": { format: "text", temperature: 0.75, maxTokens: 380 },
  "voice-translate": { format: "text", temperature: 0.3, maxTokens: 400 },
};

const MAX_MESSAGES = 30;
const MAX_MESSAGE_CHARS = 12_000;
const MAX_TOTAL_CHARS = 48_000;
const MAX_IN_FLIGHT = 10;
const ROLES = new Set(["system", "user", "assistant"]);

const fail = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ status: false, data: { code }, message });

interface ValidRequest {
  feature: string;
  config: FeatureConfig;
  messages: ChatMessage[];
  maxTokens: number;
}

export function validateCompleteBody(body: unknown): { ok: true; value: ValidRequest } | { ok: false; message: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const feature = typeof b.feature === "string" ? b.feature : "";
  const config = Object.prototype.hasOwnProperty.call(INNER_VOICE_FEATURES, feature) ? INNER_VOICE_FEATURES[feature] : undefined;
  if (!config) return { ok: false, message: "Unknown feature" };

  if (!Array.isArray(b.messages) || b.messages.length === 0) return { ok: false, message: "messages must be a non-empty array" };
  if (b.messages.length > MAX_MESSAGES) return { ok: false, message: `messages may contain at most ${MAX_MESSAGES} items` };

  const messages: ChatMessage[] = [];
  let total = 0;
  for (const m of b.messages as unknown[]) {
    const item = (m ?? {}) as Record<string, unknown>;
    if (typeof item.role !== "string" || !ROLES.has(item.role)) return { ok: false, message: "Invalid message role" };
    if (typeof item.content !== "string" || !item.content.trim()) return { ok: false, message: "Each message needs text content" };
    if (item.content.length > MAX_MESSAGE_CHARS) return { ok: false, message: "A message is too long" };
    total += item.content.length;
    messages.push({ role: item.role as ChatMessage["role"], content: item.content });
  }
  if (total > MAX_TOTAL_CHARS) return { ok: false, message: "The request is too long" };
  if (!messages.some((m) => m.role === "user")) return { ok: false, message: "At least one user message is required" };

  let maxTokens = config.maxTokens;
  if (b.maxTokens !== undefined) {
    if (typeof b.maxTokens !== "number" || !Number.isInteger(b.maxTokens) || b.maxTokens < 1) {
      return { ok: false, message: "maxTokens must be a positive integer" };
    }
    maxTokens = Math.min(b.maxTokens, config.maxTokens);
  }
  return { ok: true, value: { feature, config, messages, maxTokens } };
}

export interface InnerVoiceRouterOptions {
  perMinute?: number;
  perDay?: number;
}

export function createInnerVoiceRouter(options: InnerVoiceRouterOptions = {}): Router {
  const router = Router();
  const perMinute = rateLimit(options.perMinute ?? 20, 60_000);
  const perDay = rateLimit(options.perDay ?? 300, 24 * 60 * 60_000);
  let inFlight = 0;

  router.post("/complete", perMinute, perDay, async (req: Request, res: Response) => {
    const parsed = validateCompleteBody(req.body);
    if (!parsed.ok) return fail(res, 400, "INVALID_REQUEST", parsed.message);
    const { feature, config, messages, maxTokens } = parsed.value;

    if (inFlight >= MAX_IN_FLIGHT) {
      res.setHeader("Retry-After", "5");
      return fail(res, 503, "AI_BUSY", "The AI service is busy. Please try again in a moment.");
    }

    inFlight += 1;
    try {
      const result = await groqCompletion({ messages, maxTokens, temperature: config.temperature, format: config.format });
      return res.json({ status: true, data: result.format === "json" ? result.data : { text: result.text } });
    } catch (err) {
      if (err instanceof InnerVoiceAIError) {
        if (err.retryAfterSeconds) res.setHeader("Retry-After", String(err.retryAfterSeconds));
        return fail(res, err.status, err.code, err.message);
      }
      console.error(`[InnerVoice AI] unexpected error in "${feature}":`, (err as Error)?.message);
      return fail(res, 500, "AI_INTERNAL_ERROR", "Something went wrong. Please try again.");
    } finally {
      inFlight -= 1;
    }
  });

  // ── POST /api/inner-voice/tts (Sarvam, unchanged) ───────────────────────────
  router.post("/tts", async (req: Request, res: Response) => {
    try {
      const { text, language } = req.body;
      if (!text?.trim()) return res.status(400).json({ error: "text is required" });

      const apiKey = process.env.SARVAM_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "SARVAM_API_KEY not configured" });

      const langCode = (language as string)?.startsWith("en") ? "en-IN" : "hi-IN";
      console.log("[Sarvam TTS] Request — model: bulbul:v3, speaker: manan, lang:", langCode, "chars:", text.trim().length);

      const sarvamRes = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": apiKey,
        },
        body: JSON.stringify({
          inputs: [text.slice(0, 500)],
          target_language_code: langCode,
          speaker: "manan",
          pace: 0.85,
          speech_sample_rate: 22050,
          model: "bulbul:v3",
          temperature: 0.4,
        }),
      });

      if (!sarvamRes.ok) {
        const errText = await sarvamRes.text();
        console.error("Sarvam TTS error:", sarvamRes.status, errText);
        return res.status(502).json({ error: "Sarvam TTS request failed" });
      }

      const data = (await sarvamRes.json()) as any;
      const audio = data.audios?.[0];
      if (!audio) return res.status(502).json({ error: "No audio in Sarvam response" });

      return res.json({ audio });
    } catch (err: any) {
      console.error("TTS proxy error:", err.message);
      return res.status(500).json({ error: "TTS proxy failed" });
    }
  });

  return router;
}

export default createInnerVoiceRouter();
