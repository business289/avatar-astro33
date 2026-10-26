import { defineConfig } from "vitest/config";

// The Inner Voice and CORS suites run under Vitest. The older suites in
// src/__tests__ are written for Jest (see jest.config.js) and are left untouched.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/routes/innerVoice*.test.ts", "src/services/groq*.test.ts", "src/config/*.test.ts"],
  },
});
