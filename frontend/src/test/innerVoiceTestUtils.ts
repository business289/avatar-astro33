/* eslint-disable @typescript-eslint/no-explicit-any -- untyped JSON from the network / test doubles */
import { vi } from "vitest";

/** jsdom has no canvas, ResizeObserver or IntersectionObserver; the Inner Voice pages need all three. */
export function stubBrowserApis() {
  const noop = () => {};
  const ctx = new Proxy({}, { get: () => noop, set: () => true });
  HTMLCanvasElement.prototype.getContext = (() => ctx) as any;
  vi.stubGlobal("requestAnimationFrame", () => 0);
  vi.stubGlobal("cancelAnimationFrame", noop);
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", Observer);
  vi.stubGlobal("IntersectionObserver", Observer);
  Element.prototype.scrollIntoView = noop;
  Element.prototype.scrollTo = noop as any;
  window.scrollTo = noop as any;
}

export interface FetchCall {
  url: string;
  headers: Record<string, string>;
  body: any;
}

type Reply = { ok: true; data: unknown } | { ok: false; status: number; message: string; code?: string };

/** Replaces fetch with a queue of replies for POST .../inner-voice/complete. */
export function mockInnerVoiceBackend(replies: Reply[]) {
  const calls: FetchCall[] = [];
  const queue = [...replies];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), headers: (init?.headers ?? {}) as Record<string, string>, body: init?.body ? JSON.parse(String(init.body)) : null });
      const r = queue.length > 1 ? queue.shift()! : queue[0];
      if (r.ok) return new Response(JSON.stringify({ status: true, data: r.data }), { status: 200 });
      return new Response(JSON.stringify({ status: false, data: { code: r.code ?? "AI_PROVIDER_ERROR" }, message: r.message }), { status: r.status });
    }),
  );
  return calls;
}
