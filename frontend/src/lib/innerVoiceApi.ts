/* eslint-disable @typescript-eslint/no-explicit-any -- untyped JSON from the network / test doubles */
import { API_BASE_URL } from "@/lib/api";

/**
 * Client for the backend Inner Voice AI endpoint (POST /api/inner-voice/complete).
 * The browser never talks to the AI provider and never holds a provider key; the
 * backend adds both. Every failure is thrown as an InnerVoiceApiError so pages can
 * show a real error + retry instead of presenting a failure as an AI result.
 */

export type InnerVoiceFeature =
  | "karma-diagnosis"
  | "guru-chat"
  | "chat-report"
  | "dashboard-score"
  | "journal-dashboard"
  | "journal-reflection"
  | "journal-eod"
  | "wisdom"
  | "voice-reply"
  | "voice-translate";

export interface InnerVoiceMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class InnerVoiceApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "InnerVoiceApiError";
  }
}

/** Render's free tier can take ~50s to wake up, so allow for it. */
const REQUEST_TIMEOUT_MS = 90_000;

async function request(feature: InnerVoiceFeature, messages: InnerVoiceMessage[], maxTokens?: number): Promise<Record<string, any>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/inner-voice/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature, messages, ...(maxTokens ? { maxTokens } : {}) }),
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = (err as { name?: string })?.name === "AbortError";
    throw new InnerVoiceApiError(
      aborted ? "The server took too long to respond. Please try again." : "Could not reach the server. Check your connection and try again.",
      0,
      aborted ? "TIMEOUT" : "NETWORK",
    );
  } finally {
    clearTimeout(timer);
  }

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* handled below */
  }

  if (!res.ok || body?.status === false) {
    const message = typeof body?.message === "string" && body.message ? body.message : "The AI service is unavailable right now. Please try again.";
    throw new InnerVoiceApiError(message, res.status, body?.data?.code ?? "HTTP_ERROR");
  }
  if (body?.status !== true || !body.data || typeof body.data !== "object") {
    throw new InnerVoiceApiError("The server sent an unexpected reply. Please try again.", res.status, "BAD_RESPONSE");
  }
  return body.data;
}

/** Feature that returns a JSON object (validated non-empty by the server and here). */
export async function innerVoiceJson<T extends Record<string, any> = Record<string, any>>(
  feature: InnerVoiceFeature,
  messages: InnerVoiceMessage[],
  maxTokens?: number,
): Promise<T> {
  const data = await request(feature, messages, maxTokens);
  if (Object.keys(data).length === 0) throw new InnerVoiceApiError("The AI returned an empty reply. Please try again.", 200, "EMPTY");
  return data as T;
}

/** Feature that returns plain text. */
export async function innerVoiceText(feature: InnerVoiceFeature, messages: InnerVoiceMessage[], maxTokens?: number): Promise<string> {
  const data = await request(feature, messages, maxTokens);
  const text = typeof data.text === "string" ? data.text.trim() : "";
  if (!text) throw new InnerVoiceApiError("The AI returned an empty reply. Please try again.", 200, "EMPTY");
  return text;
}

/** Safe message for display from any thrown value. */
export const innerVoiceErrorMessage = (err: unknown, fallback = "Something went wrong. Please try again."): string =>
  err instanceof InnerVoiceApiError ? err.message : fallback;
