/* eslint-disable @typescript-eslint/no-explicit-any -- untyped JSON from the network / test doubles */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import InnerVoiceChat from "./InnerVoiceChat";
import { mockInnerVoiceBackend, stubBrowserApis } from "@/test/innerVoiceTestUtils";

const UNAVAILABLE = "The AI service is temporarily unavailable. Please try again.";

beforeEach(() => {
  stubBrowserApis();
  localStorage.clear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const renderChat = () => render(<MemoryRouter><InnerVoiceChat /></MemoryRouter>);

async function sendMessage(text: string) {
  const box = (await screen.findAllByRole("textbox"))[0];
  fireEvent.change(box, { target: { value: text } });
  fireEvent.keyDown(box, { key: "Enter", code: "Enter" });
}

describe("AI Guru chat", () => {
  it("shows a real error with retry, not a fake guru reply, then recovers without duplicating the message", async () => {
    const calls = mockInnerVoiceBackend([
      { ok: false, status: 502, message: UNAVAILABLE },
      { ok: true, data: { type: "gathering", message: "Namaste, tell me more.", progress: 30 } },
    ]);
    renderChat();
    await sendMessage("I am worried about my career");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(UNAVAILABLE);
    expect(calls[0].url).toMatch(/\/inner-voice\/complete$/);
    expect(calls[0].body.feature).toBe("guru-chat");
    expect(calls[0].headers.Authorization).toBeUndefined();
    expect(screen.queryByText(/temporarily unavailable\. Please try again in a moment/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText("Namaste, tell me more.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // the retry re-sent the same text exactly once in the history
    const userTurns = calls[1].body.messages.filter((m: any) => m.role === "user");
    expect(userTurns.filter((m: any) => m.content === "I am worried about my career")).toHaveLength(1);
    expect(screen.getAllByText("I am worried about my career")).toHaveLength(1);
  });

  it("shows an actionable error with retry when the diagnosis report fails, then renders the report", async () => {
    const calls = mockInnerVoiceBackend([
      { ok: true, data: { type: "gathering", message: "I understand.", progress: 90, readyForDiagnosis: true } },
      { ok: false, status: 504, message: "The AI service took too long to respond. Please try again.", code: "AI_TIMEOUT" },
      { ok: true, data: { diagnosis: { summary: "Saturn is testing your patience." }, guidance: "My child, be steady." } },
    ]);
    renderChat();
    await sendMessage("Career problems for a long time");
    await screen.findByText("I understand.");

    fireEvent.click((await screen.findAllByRole("button", { name: /report/i }))[0]);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Your report could not be created");
    expect(alert).toHaveTextContent("took too long");
    expect(calls[1].body.feature).toBe("chat-report");

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText("My child, be steady.")).toBeInTheDocument();
    expect(screen.queryByText("Your report could not be created")).not.toBeInTheDocument();
  });

  it("treats a reply without a message as a failure", async () => {
    mockInnerVoiceBackend([{ ok: true, data: { type: "gathering" } }]);
    renderChat();
    await sendMessage("Please help me");
    expect(await screen.findByRole("alert")).toHaveTextContent(/incomplete reply/i);
  });
});
