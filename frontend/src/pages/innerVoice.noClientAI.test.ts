import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(__dirname, "..");
const FRONTEND = join(SRC, "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx)$/.test(name) && !/\.test\./.test(name)) out.push(p);
  }
  return out;
}

describe("no AI provider key or call in the browser bundle sources", () => {
  const files = walk(SRC);

  it("scans the frontend sources", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("never references VITE_GROQ_* or a Groq API key variable", () => {
    const offenders = files.filter((f) => /VITE_GROQ|GROQ_API_KEY|VITE_SARVAM/.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("never calls the Groq chat-completions endpoint from the browser", () => {
    const offenders = files.filter((f) => /api\.groq\.com/.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("does not put any provider key in the frontend env examples or serverless function", () => {
    for (const f of [join(FRONTEND, ".env.example"), join(FRONTEND, "api", "tts.ts")]) {
      expect(readFileSync(f, "utf8")).not.toMatch(/VITE_GROQ|VITE_SARVAM|GROQ_API_KEY=/);
    }
  });

  it("routes every Inner Voice page through the backend client", () => {
    for (const page of ["InnerVoice", "InnerVoiceChat", "InnerVoiceDashboard", "InnerVoiceJournal", "InnerVoiceWisdom"]) {
      expect(readFileSync(join(SRC, "pages", `${page}.tsx`), "utf8")).toContain("@/lib/innerVoiceApi");
    }
    expect(readFileSync(join(SRC, "components", "VoiceConsultation.tsx"), "utf8")).toContain("@/lib/innerVoiceApi");
  });
});
