import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import InnerVoiceDashboard from "./InnerVoiceDashboard";
import InnerVoiceJournal from "./InnerVoiceJournal";
import InnerVoiceWisdom from "./InnerVoiceWisdom";
import InnerVoice from "./InnerVoice";
import { mockInnerVoiceBackend, stubBrowserApis } from "@/test/innerVoiceTestUtils";

const UNAVAILABLE = "The AI service is temporarily unavailable. Please try again.";
const fail = { ok: false as const, status: 502, message: UNAVAILABLE };

const renderPage = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  stubBrowserApis();
  localStorage.clear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Dashboard", () => {
  const profile = { name: "Asha", dob: "", sign: "Leo", nakshatra: "", dasha: "" };
  const scores = {
    natalBase: 30, transitBonus: 5, behaviorBase: 30, scoreMessage: "Steady week.", currentDasha: "Jupiter",
    transitAlerts: [], radarData: [{ subject: "Dharma", value: 6 }],
  };

  it("shows an error with retry, never made-up scores, when the backend fails — then recovers", async () => {
    localStorage.setItem("iv_profile", JSON.stringify(profile));
    const calls = mockInnerVoiceBackend([fail, { ok: true, data: scores }]);
    renderPage(<InnerVoiceDashboard />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("could not be calculated");
    expect(alert).toHaveTextContent(UNAVAILABLE);
    expect(screen.queryByText("Today's Composite Karma")).not.toBeInTheDocument();
    expect(screen.queryByText(/Consult Pandit Ji for your current dasha/)).not.toBeInTheDocument();

    expect(calls[0].url).toMatch(/\/inner-voice\/complete$/);
    expect(calls[0].body.feature).toBe("dashboard-score");
    expect(calls[0].headers.Authorization).toBeUndefined();

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText("Today's Composite Karma")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(calls).toHaveLength(2);
  });

  it("treats an incomplete AI reply as a failure", async () => {
    localStorage.setItem("iv_profile", JSON.stringify(profile));
    mockInnerVoiceBackend([{ ok: true, data: { scoreMessage: "no numbers" } }]);
    renderPage(<InnerVoiceDashboard />);
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be calculated");
    expect(screen.queryByText("Today's Composite Karma")).not.toBeInTheDocument();
  });
});

describe("Journal", () => {
  const analysis = {
    karmaScore: 70, dominantPattern: "Patience", patternInsight: "Insight.",
    patterns: [{ name: "Patience", score: 70, color: "#C7A46A", icon: "🌿" }],
    prompts: [{ id: 1, text: "Prompt one", icon: "☯️" }, { id: 2, text: "Prompt two", icon: "⚡" }, { id: 3, text: "Prompt three", icon: "💛" }],
    mantra: { text: "m", meaning: "m", source: "s", verse: "v", application: "a", purpose: "p" },
    action: "Do one kind thing.", actionImpact: "Lighter.", aiReflectionPreview: "Preview.",
  };

  it("labels the built-in content as a template when the AI fails, keeps entries, and retries", async () => {
    localStorage.setItem("ivj_entries_v3", JSON.stringify([{ text: "my private entry" }]));
    const calls = mockInnerVoiceBackend([fail, { ok: true, data: analysis }]);
    renderPage(<InnerVoiceJournal />);

    const banner = await screen.findByRole("alert");
    expect(banner).toHaveTextContent("AI analysis unavailable");
    expect(banner).toHaveTextContent("sample template");
    expect(banner).toHaveTextContent(UNAVAILABLE);
    expect(screen.getByText(/Sample reflection \(template, not AI\)/)).toBeInTheDocument();
    expect(localStorage.getItem("ivj_entries_v3")).toContain("my private entry");
    expect(calls[0].body.feature).toBe("journal-dashboard");

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(screen.getByText("Prompt one")).toBeInTheDocument();
    expect(screen.queryByText(/Sample reflection/)).not.toBeInTheDocument();
  });

  it("rejects an analysis without prompts and shows the failure", async () => {
    mockInnerVoiceBackend([{ ok: true, data: { karmaScore: 5 } }]);
    renderPage(<InnerVoiceJournal />);
    expect(await screen.findByRole("alert")).toHaveTextContent("AI analysis unavailable");
  });
});

describe("Shloka Wisdom", () => {
  it("shows a clear error and no verse when generation fails", async () => {
    const calls = mockInnerVoiceBackend([{ ok: false, status: 429, message: "The AI service is busy right now. Please try again shortly.", code: "AI_RATE_LIMITED" }]);
    renderPage(<InnerVoiceWisdom />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I feel stuck at work lately" } });
    fireEvent.click(screen.getByRole("button", { name: /receive the verse/i }));
    expect(await screen.findByText(/busy right now/)).toBeInTheDocument();
    expect(calls[0].body.feature).toBe("wisdom");
    expect(screen.queryByText(/Word by word/i)).not.toBeInTheDocument();
  });

  it("does not show an empty reply as a result", async () => {
    mockInnerVoiceBackend([{ ok: true, data: {} }]);
    renderPage(<InnerVoiceWisdom />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I feel stuck at work lately" } });
    fireEvent.click(screen.getByRole("button", { name: /receive the verse/i }));
    expect(await screen.findByText(/empty reply/i)).toBeInTheDocument();
  });
});

describe("Karma Diagnosis", () => {
  it("shows the server's safe error message when diagnosis fails", async () => {
    const calls = mockInnerVoiceBackend([{ ok: false, status: 503, message: "The AI service is not configured. Please try again later.", code: "AI_NOT_CONFIGURED" }]);
    renderPage(<InnerVoice />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I keep repeating the same mistakes in life" } });
    fireEvent.click(screen.getByRole("button", { name: /diagnose my karma/i }));
    expect(await screen.findByText(/not configured/)).toBeInTheDocument();
    expect(calls[0].body.feature).toBe("karma-diagnosis");
  });
});
