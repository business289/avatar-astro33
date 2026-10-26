/* eslint-disable @typescript-eslint/no-explicit-any -- untyped JSON from the network / test doubles */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import VoiceConsultation from "./VoiceConsultation";
import { stubBrowserApis } from "@/test/innerVoiceTestUtils";

// Capture the speech-recognition callbacks so the test can "speak".
let speech: { onResult: (t: string) => void; onEnd: () => void };
vi.mock("../hooks/useSpeechRecognition", () => ({
  useSpeechRecognition: (opts: any) => {
    speech = opts;
    return { start: () => {}, stop: () => {}, supported: true };
  },
}));

type CompleteReply = { ok: true; text: string } | { ok: false; status: number; message: string };
let completeReplies: CompleteReply[];
let urls: string[];
let completeBodies: any[];

beforeEach(() => {
  stubBrowserApis();
  localStorage.clear();
  urls = [];
  completeBodies = [];
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      urls.push(String(url));
      if (String(url).endsWith("/inner-voice/complete")) {
        completeBodies.push(JSON.parse(String(init?.body)));
        const r = completeReplies.length > 1 ? completeReplies.shift()! : completeReplies[0];
        return r.ok
          ? new Response(JSON.stringify({ status: true, data: { text: r.text } }), { status: 200 })
          : new Response(JSON.stringify({ status: false, data: { code: "AI_PROVIDER_ERROR" }, message: r.message }), { status: r.status });
      }
      // Sarvam TTS proxy: fail, to check voice errors are reported separately from AI errors
      return new Response(JSON.stringify({ error: "Sarvam TTS failed" }), { status: 502 });
    }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const speak = async (text: string) => {
  await act(async () => {
    speech.onResult(text);
  });
  await act(async () => {
    speech.onEnd();
  });
};

describe("Voice consultation", () => {
  it("reports an AI failure with retry, speaks nothing, and does not invent a Pandit reply", async () => {
    completeReplies = [
      { ok: false, status: 502, message: "The AI service is temporarily unavailable. Please try again." },
      { ok: true, text: "Namaste beta, Shani ke liye Om Sham Shanicharaya Namah jaap karein." },
    ];
    render(<VoiceConsultation />);
    await speak("my career is stuck for years");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("AI response failed");
    expect(alert).toHaveTextContent("temporarily unavailable");
    expect(urls.some((u) => u.endsWith("/tts"))).toBe(false); // no canned reply was sent to TTS
    expect(screen.queryByText(/technical samasya/)).not.toBeInTheDocument();
    expect(completeBodies[0].feature).toBe("voice-reply");

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText(/Shani ke liye/)).toBeInTheDocument();
    expect(screen.queryByText(/AI response failed/)).not.toBeInTheDocument();
    // the retry did not duplicate the user's turn
    expect(completeBodies[1].messages.filter((m: any) => m.role === "user")).toHaveLength(1);
  });

  it("reports a TTS failure separately: the AI text is shown and a voice notice appears", async () => {
    completeReplies = [{ ok: true, text: "Namaste beta, aap shaant rahein aur jaap karein." }];
    render(<VoiceConsultation />);
    await speak("please guide me about my marriage");

    expect(await screen.findByText(/aap shaant rahein/)).toBeInTheDocument();
    expect(await screen.findByText(/Voice playback failed/)).toBeInTheDocument();
    expect(screen.queryByText(/AI response failed/)).not.toBeInTheDocument();
  });
});
