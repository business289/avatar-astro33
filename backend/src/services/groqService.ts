/**
 * Server-side Groq chat-completions client for the Inner Voice features.
 *
 * The API key is read only from `process.env.GROQ_API_KEY` at call time and is
 * never logged, returned to a client or put in an error message. Provider
 * failures are turned into `InnerVoiceAIError`s with a safe public message; they
 * are never converted into a made-up successful result.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Documented Groq production model (131k context). Override server-side with GROQ_MODEL. */
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

/** gpt-oss spends part of the completion budget on reasoning, so leave headroom for it. */
const REASONING_HEADROOM_TOKENS = 1024;
const DEFAULT_TIMEOUT_MS = 45_000;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class InnerVoiceAIError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "InnerVoiceAIError";
  }
}

export interface CompletionOptions {
  messages: ChatMessage[];
  /** Visible output budget; reasoning headroom is added on top. */
  maxTokens: number;
  temperature: number;
  /** "json" asks Groq for a JSON object and parses it; "text" returns the raw reply. */
  format: "json" | "text";
  timeoutMs?: number;
}

export type CompletionResult = { format: "json"; data: Record<string, unknown> } | { format: "text"; text: string };

/** Extracts the first JSON object from a model reply (tolerates code fences). */
export function parseJsonObject(raw: string): Record<string, unknown> | null {
  const clean = raw.replace(/```json|```/gi, "").trim();
  const candidates = [clean];
  const match = clean.match(/\{[\s\S]*\}/);
  if (match && match[0] !== clean) candidates.push(match[0]);
  for (const c of candidates) {
    try {
      const parsed: unknown = JSON.parse(c);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

const modelName = (): string => process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;

export async function groqCompletion(opts: CompletionOptions): Promise<CompletionResult> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    console.error("[InnerVoice AI] GROQ_API_KEY is not configured on the server");
    throw new InnerVoiceAIError(503, "AI_NOT_CONFIGURED", "The AI service is not configured. Please try again later.");
  }

  const model = modelName();
  const body: Record<string, unknown> = {
    model,
    temperature: opts.temperature,
    max_completion_tokens: opts.maxTokens + REASONING_HEADROOM_TOKENS,
    messages: opts.messages,
  };
  if (model.startsWith("openai/gpt-oss")) {
    body.reasoning_effort = "low";
    body.include_reasoning = false;
  }
  if (opts.format === "json") body.response_format = { type: "json_object" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = (err as { name?: string })?.name === "AbortError";
    console.error(`[InnerVoice AI] provider request ${aborted ? "timed out" : "failed"}`);
    throw aborted
      ? new InnerVoiceAIError(504, "AI_TIMEOUT", "The AI service took too long to respond. Please try again.")
      : new InnerVoiceAIError(502, "AI_UNREACHABLE", "The AI service could not be reached. Please try again.");
  } finally {
    clearTimeout(timer);
  }

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    /* non-JSON body: handled below via status / missing content */
  }

  if (!res.ok) {
    // Log only status and the provider's error code/type, never the request or key.
    console.error(`[InnerVoice AI] provider error status=${res.status} code=${payload?.error?.code ?? payload?.error?.type ?? "n/a"}`);
    if (res.status === 429) {
      const retry = Number(res.headers.get("retry-after"));
      throw new InnerVoiceAIError(
        429,
        "AI_RATE_LIMITED",
        "The AI service is busy right now. Please try again shortly.",
        Number.isFinite(retry) && retry > 0 ? Math.min(Math.ceil(retry), 300) : undefined,
      );
    }
    throw new InnerVoiceAIError(502, "AI_PROVIDER_ERROR", "The AI service is temporarily unavailable. Please try again.");
  }

  const choice = payload?.choices?.[0];
  const content = typeof choice?.message?.content === "string" ? choice.message.content.trim() : "";
  if (choice?.finish_reason === "length") {
    console.error("[InnerVoice AI] reply was cut off at the token limit");
    throw new InnerVoiceAIError(502, "AI_TRUNCATED", "The AI reply was cut off. Please try again.");
  }
  if (!content) {
    console.error("[InnerVoice AI] provider returned an empty reply");
    throw new InnerVoiceAIError(502, "AI_EMPTY", "The AI returned an empty reply. Please try again.");
  }

  if (opts.format === "text") return { format: "text", text: content };

  const data = parseJsonObject(content);
  if (!data || Object.keys(data).length === 0) {
    console.error("[InnerVoice AI] reply was not a usable JSON object");
    throw new InnerVoiceAIError(502, "AI_INVALID_OUTPUT", "The AI reply could not be understood. Please try again.");
  }
  return { format: "json", data };
}
