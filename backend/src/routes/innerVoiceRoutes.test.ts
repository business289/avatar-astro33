import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInnerVoiceRouter } from "./innerVoiceRoutes.js";

const GROQ = "api.groq.com";
const SECRET = "test-secret-key-that-must-never-leak";

let server: Server;
let base: string;
const realFetch = globalThis.fetch;
let groqCalls: { url: string; init: RequestInit }[];
let groqReply: () => Response;

const groqOk = (content: string, finish = "stop") =>
  new Response(JSON.stringify({ choices: [{ message: { content }, finish_reason: finish }] }), { status: 200 });

async function start(options?: Parameters<typeof createInnerVoiceRouter>[0]) {
  const app = express();
  app.use(express.json());
  app.use("/api/inner-voice", createInnerVoiceRouter(options));
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => resolve());
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/inner-voice`;
}

const post = async (body: unknown) => {
  const r = await realFetch(`${base}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { status: r.status, headers: r.headers, json: (): Promise<any> => r.json() };
};

const valid = { feature: "wisdom", messages: [{ role: "system", content: "Return JSON." }, { role: "user", content: "My situation: work stress" }] };

beforeEach(() => {
  process.env.GROQ_API_KEY = SECRET;
  delete process.env.GROQ_MODEL;
  groqCalls = [];
  groqReply = () => groqOk('{"shloka":"x","meaning":"y"}');
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
    if (String(url).includes(GROQ)) {
      groqCalls.push({ url: String(url), init });
      return Promise.resolve(groqReply());
    }
    return realFetch(url, init);
  });
});

afterEach(async () => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("POST /api/inner-voice/complete", () => {
  it("returns parsed JSON from Groq using the server-side key and documented model", async () => {
    await start();
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: true, data: { shloka: "x", meaning: "y" } });

    expect(groqCalls).toHaveLength(1);
    const sent = JSON.parse(String(groqCalls[0].init.body));
    expect(sent.model).toBe("openai/gpt-oss-120b");
    expect(sent.response_format).toEqual({ type: "json_object" });
    expect(sent.max_completion_tokens).toBeGreaterThan(1500);
    expect((groqCalls[0].init.headers as Record<string, string>).Authorization).toBe(`Bearer ${SECRET}`);
  });

  it("tolerates fenced JSON and returns text for text features", async () => {
    await start();
    groqReply = () => groqOk('```json\n{"a":1}\n```');
    expect((await (await post(valid)).json()).data).toEqual({ a: 1 });

    groqReply = () => groqOk("Namaste, my child.");
    const res = await post({ feature: "voice-reply", messages: [{ role: "user", content: "hello" }] });
    expect(await res.json()).toEqual({ status: true, data: { text: "Namaste, my child." } });
    expect(JSON.parse(String(groqCalls.at(-1)!.init.body)).response_format).toBeUndefined();
  });

  it("uses GROQ_MODEL when configured on the server", async () => {
    process.env.GROQ_MODEL = "llama-3.3-70b-versatile";
    await start();
    await post(valid);
    const sent = JSON.parse(String(groqCalls[0].init.body));
    expect(sent.model).toBe("llama-3.3-70b-versatile");
    expect(sent.reasoning_effort).toBeUndefined();
  });

  it("returns 503 without calling Groq when GROQ_API_KEY is missing", async () => {
    delete process.env.GROQ_API_KEY;
    await start();
    const res = await post(valid);
    expect(res.status).toBe(503);
    expect((await res.json()).data.code).toBe("AI_NOT_CONFIGURED");
    expect(groqCalls).toHaveLength(0);
  });

  it.each([
    ["unknown feature", { ...valid, feature: "nope" }],
    ["inherited property as feature", { ...valid, feature: "constructor" }],
    ["missing messages", { feature: "wisdom" }],
    ["empty messages", { feature: "wisdom", messages: [] }],
    ["bad role", { feature: "wisdom", messages: [{ role: "tool", content: "x" }] }],
    ["non-string content", { feature: "wisdom", messages: [{ role: "user", content: 5 }] }],
    ["no user message", { feature: "wisdom", messages: [{ role: "system", content: "x" }] }],
    ["oversized message", { feature: "wisdom", messages: [{ role: "user", content: "a".repeat(12_001) }] }],
    ["too many messages", { feature: "wisdom", messages: Array.from({ length: 31 }, () => ({ role: "user", content: "x" })) }],
    ["oversized total", { feature: "wisdom", messages: Array.from({ length: 5 }, () => ({ role: "user", content: "a".repeat(11_000) })) }],
    ["bad maxTokens", { ...valid, maxTokens: "lots" }],
  ])("rejects %s with 400 and does not call Groq", async (_name, body) => {
    await start();
    const res = await post(body);
    expect(res.status).toBe(400);
    expect((await res.json()).data.code).toBe("INVALID_REQUEST");
    expect(groqCalls).toHaveLength(0);
  });

  it("caps the client's maxTokens at the feature limit", async () => {
    await start();
    await post({ ...valid, maxTokens: 999_999 });
    const sent = JSON.parse(String(groqCalls[0].init.body));
    expect(sent.max_completion_tokens).toBe(1500 + 1024);
  });

  it("maps provider rate limits to 429 with Retry-After", async () => {
    await start();
    groqReply = () => new Response(JSON.stringify({ error: { code: "rate_limit_exceeded", message: "secret detail" } }), { status: 429, headers: { "retry-after": "7" } });
    const res = await post(valid);
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("7");
    const body = await res.json();
    expect(body.data.code).toBe("AI_RATE_LIMITED");
    expect(JSON.stringify(body)).not.toContain("secret detail");
  });

  it.each([401, 400, 404, 500, 503])("maps provider status %i to a safe 502", async (status) => {
    await start();
    groqReply = () => new Response(JSON.stringify({ error: { message: `leak ${SECRET}` } }), { status });
    const res = await post(valid);
    expect(res.status).toBe(502);
    const text = JSON.stringify(await res.json());
    expect(text).toContain("AI_PROVIDER_ERROR");
    expect(text).not.toContain(SECRET);
  });

  it("maps a provider timeout to 504", async () => {
    await start();
    vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
      if (!String(url).includes(GROQ)) return realFetch(url, init);
      return Promise.reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
    });
    const res = await post(valid);
    expect(res.status).toBe(504);
    expect((await res.json()).data.code).toBe("AI_TIMEOUT");
  });

  it("maps a network failure to 502 AI_UNREACHABLE", async () => {
    await start();
    vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
      if (!String(url).includes(GROQ)) return realFetch(url, init);
      return Promise.reject(new TypeError("fetch failed"));
    });
    const res = await post(valid);
    expect(res.status).toBe(502);
    expect((await res.json()).data.code).toBe("AI_UNREACHABLE");
  });

  it.each([
    ["empty content", () => groqOk(""), "AI_EMPTY"],
    ["truncated output", () => groqOk('{"a":', "length"), "AI_TRUNCATED"],
    ["malformed JSON", () => groqOk("sorry, I cannot help"), "AI_INVALID_OUTPUT"],
    ["JSON array instead of object", () => groqOk("[1,2,3]"), "AI_INVALID_OUTPUT"],
    ["empty object", () => groqOk("{}"), "AI_INVALID_OUTPUT"],
    ["no choices", () => new Response("{}", { status: 200 }), "AI_EMPTY"],
  ])("never turns %s into a success", async (_n, reply, code) => {
    await start();
    groqReply = reply;
    const res = await post(valid);
    expect(res.status).toBe(502);
    expect((await res.json()).data.code).toBe(code);
  });

  it("rate-limits repeated requests per IP", async () => {
    await start({ perMinute: 2 });
    expect((await post(valid)).status).toBe(200);
    expect((await post(valid)).status).toBe(200);
    const third = await post(valid);
    expect(third.status).toBe(429);
    expect(third.headers.get("retry-after")).toBeTruthy();
    expect(groqCalls).toHaveLength(2);
  });

  it("never logs the API key or the user's text", async () => {
    await start();
    groqReply = () => new Response("{}", { status: 500 });
    await post({ ...valid, messages: [{ role: "user", content: "my private journal entry" }] });
    const logged = JSON.stringify([...(console.error as any).mock.calls, ...(console.log as any).mock.calls]);
    expect(logged).not.toContain(SECRET);
    expect(logged).not.toContain("my private journal entry");
  });
});
