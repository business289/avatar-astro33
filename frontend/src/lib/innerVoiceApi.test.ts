/* eslint-disable @typescript-eslint/no-explicit-any -- untyped JSON from the network / test doubles */
import { afterEach, describe, expect, it, vi } from "vitest";
import { InnerVoiceApiError, innerVoiceErrorMessage, innerVoiceJson, innerVoiceText } from "./innerVoiceApi";

const msgs = [{ role: "user" as const, content: "hello" }];

const respond = (body: unknown, status = 200) => vi.stubGlobal("fetch", vi.fn(async () => new Response(typeof body === "string" ? body : JSON.stringify(body), { status })));

afterEach(() => vi.unstubAllGlobals());

describe("innerVoiceApi", () => {
  it("POSTs to the backend with no credentials or provider URL, and returns the JSON data", async () => {
    respond({ status: true, data: { a: 1 } });
    await expect(innerVoiceJson("wisdom", msgs, 500)).resolves.toEqual({ a: 1 });

    const [url, init] = (fetch as any).mock.calls[0];
    expect(url).toMatch(/\/inner-voice\/complete$/);
    expect(url).not.toContain("groq");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBeUndefined();
    expect(JSON.parse(init.body)).toEqual({ feature: "wisdom", messages: msgs, maxTokens: 500 });
  });

  it("returns text for text features", async () => {
    respond({ status: true, data: { text: " Namaste " } });
    await expect(innerVoiceText("voice-reply", msgs)).resolves.toBe("Namaste");
  });

  it("throws the server's safe message and code for a non-2xx reply", async () => {
    respond({ status: false, data: { code: "AI_RATE_LIMITED" }, message: "The AI service is busy right now. Please try again shortly." }, 429);
    const err = await innerVoiceJson("wisdom", msgs).catch((e) => e);
    expect(err).toBeInstanceOf(InnerVoiceApiError);
    expect(err).toMatchObject({ status: 429, code: "AI_RATE_LIMITED", message: "The AI service is busy right now. Please try again shortly." });
  });

  it("uses a generic message when the error body is not JSON", async () => {
    respond("<html>Bad gateway</html>", 502);
    const err = await innerVoiceJson("wisdom", msgs).catch((e) => e);
    expect(err).toMatchObject({ status: 502, code: "HTTP_ERROR" });
    expect(err.message).not.toContain("html");
  });

  it("treats status:false on a 200 as a failure", async () => {
    respond({ status: false, data: { code: "X" }, message: "nope" });
    await expect(innerVoiceJson("wisdom", msgs)).rejects.toThrow("nope");
  });

  it.each([
    ["missing data", { status: true }],
    ["wrong envelope", { choices: [] }],
    ["empty object", { status: true, data: {} }],
  ])("rejects %s instead of returning a result", async (_n, body) => {
    respond(body);
    await expect(innerVoiceJson("wisdom", msgs)).rejects.toBeInstanceOf(InnerVoiceApiError);
  });

  it("rejects empty text", async () => {
    respond({ status: true, data: { text: "   " } });
    await expect(innerVoiceText("voice-reply", msgs)).rejects.toMatchObject({ code: "EMPTY" });
  });

  it("reports network failures and aborts as errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    await expect(innerVoiceJson("wisdom", msgs)).rejects.toMatchObject({ code: "NETWORK", status: 0 });

    vi.stubGlobal("fetch", vi.fn(async () => { throw Object.assign(new Error("aborted"), { name: "AbortError" }); }));
    await expect(innerVoiceJson("wisdom", msgs)).rejects.toMatchObject({ code: "TIMEOUT" });
  });

  it("only shows safe messages", () => {
    expect(innerVoiceErrorMessage(new InnerVoiceApiError("safe", 502, "X"))).toBe("safe");
    expect(innerVoiceErrorMessage(new Error("secret internals"), "fallback")).toBe("fallback");
  });
});
