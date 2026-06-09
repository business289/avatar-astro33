import { Router, Request, Response } from "express";

const router = Router();

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemma-4-31b-it:free";

async function callAI(apiKey: string, prompt: string, maxTokens = 1000): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://spiritual-ai.app",
      "X-Title": "Spiritual AI Inner Voice",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json() as any;
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJSON(raw: string): any {
  const clean = raw.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse JSON from AI response");
  return JSON.parse(match[0]);
}

// ── POST /api/inner-voice/diagnose ────────────────────────────────────────────
router.post("/diagnose", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "text is required" });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OpenRouter API key not configured" });

    const prompt = `You are a compassionate Vedic karma counselor and spiritual guide with deep knowledge of dharma, karma, and the Bhagavad Gita.

A person has shared the following with you:
"${text}"

Analyze this through the lens of karma and dharma. Respond ONLY with valid JSON (no markdown, no code fences) in EXACTLY this structure:
{
  "lifeDomain": "The primary life area this concerns — one of: Career & Purpose, Relationships & Love, Family & Ancestors, Health & Body, Wealth & Abundance, Spiritual Growth, Mind & Emotions, Social & Community",
  "emotionalState": "The core emotional state detected — one of: Anxious, Grieving, Angry, Confused, Hopeful, Stagnant, Overwhelmed, Seeking, Grateful, Fearful",
  "karmicPattern": "A 2-3 sentence description of the karmic pattern or soul lesson at play. Be specific, insightful, and compassionate. Reference specific karma concepts.",
  "spiritualInsight": "A 2-3 sentence deeper spiritual insight connecting this to dharma, past karma, or soul growth. Draw from Vedic wisdom — mention specific concepts like prarabdha karma, sanchita, nishkama karma, etc.",
  "suggestedAction": "A single concrete, practical spiritual action the person can take in the next 24 hours to shift this karma. Be specific and actionable.",
  "karmaType": "One of: Prarabdha (past-life karma playing out), Kriyamana (karma being created now), Agami (future karma being sown), Sanchita (accumulated karma surfacing)",
  "severity": "One of: Gentle Lesson, Significant Challenge, Deep Karmic Debt, Karmic Breakthrough",
  "affirmation": "A short, powerful spiritual affirmation (1-2 sentences) personalized to this situation"
}`;

    const raw = await callAI(apiKey, prompt, 900);
    const result = parseJSON(raw);
    return res.json(result);
  } catch (err: any) {
    console.error("Karma diagnosis error:", err.message);
    return res.status(500).json({ error: "Failed to generate karma diagnosis" });
  }
});

// ── POST /api/inner-voice/guru-chat ───────────────────────────────────────────
router.post("/guru-chat", async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "message is required" });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OpenRouter API key not configured" });

    const historyText = (history as { role: string; content: string }[])
      .slice(-6)
      .map((m) => `${m.role === "user" ? "Seeker" : "Guru"}: ${m.content}`)
      .join("\n");

    const prompt = `You are an ancient Vedic Guru — deeply wise, compassionate, and practical. You speak with the authority of the Bhagavad Gita, Upanishads, and the Yoga Sutras. You are not a generic chatbot — you are a spiritual master guiding a sincere seeker.

Your personality:
- Warm but direct. You do not flatter.
- You always bring teachings back to dharma, karma, and the Self (Atman).
- You use Sanskrit terms naturally (karma, dharma, maya, samsara, moksha, prakriti, purusha) but always explain them.
- You give practical spiritual guidance, not just philosophy.
- You ask one deep reflective question at the end of your response.

${historyText ? `Previous conversation:\n${historyText}\n\n` : ""}Seeker asks: "${message}"

Respond ONLY with valid JSON (no markdown, no code fences) in EXACTLY this structure:
{
  "guidance": "2-3 sentences of direct, warm, wise spiritual guidance responding to what the seeker shared. This is your main teaching.",
  "reflection": "1-2 sentences helping the seeker look inward — what within them is creating this situation? Connect to karma or dharma.",
  "action": "One specific, practical spiritual action for the next 24 hours. Could be a mantra, meditation, act of service, journaling prompt, or ritual.",
  "spiritualPractice": "A short-term spiritual practice (3-7 days) that addresses the root of their question. Include the name of the practice and brief instructions.",
  "question": "One deep, reflective question that will help the seeker go deeper into their inner work."
}`;

    const raw = await callAI(apiKey, prompt, 800);
    const result = parseJSON(raw);
    return res.json(result);
  } catch (err: any) {
    console.error("Guru chat error:", err.message);
    return res.status(500).json({ error: "Failed to get guru response" });
  }
});

// ── POST /api/inner-voice/analyze-journal ─────────────────────────────────────
router.post("/analyze-journal", async (req: Request, res: Response) => {
  try {
    const { entry, date } = req.body;
    if (!entry?.trim()) return res.status(400).json({ error: "entry is required" });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OpenRouter API key not configured" });

    const prompt = `You are a Vedic karma analyst and spiritual counselor. A seeker has written the following journal entry${date ? ` on ${date}` : ""}:

"${entry}"

Analyze this journal entry for karmic patterns, emotional states, and spiritual growth opportunities. Respond ONLY with valid JSON (no markdown, no code fences) in EXACTLY this structure:
{
  "karmaImpact": "One of: Positive Karma Generated, Neutral, Karma Being Processed, Negative Pattern Detected, Karmic Breakthrough",
  "karmaScore": A number from 1-10 representing the karmic quality of this entry (10 = highest positive karma),
  "emotionalPattern": "2 sentences identifying the core emotional pattern in this entry and what karmic seed it represents",
  "dominantEnergy": "One of: Rajasic (active/passionate), Tamasic (dull/heavy), Sattvic (clear/pure) — with a 1-sentence explanation",
  "insight": "2-3 sentences of deep spiritual insight about what this entry reveals about the seeker's soul journey and current karma",
  "action": "One specific action to either reinforce positive karma or transform a negative pattern identified in this entry",
  "affirmation": "A personalized short affirmation (1 sentence) based on the content of this entry"
}`;

    const raw = await callAI(apiKey, prompt, 700);
    const result = parseJSON(raw);
    return res.json(result);
  } catch (err: any) {
    console.error("Journal analysis error:", err.message);
    return res.status(500).json({ error: "Failed to analyze journal entry" });
  }
});

// ── POST /api/inner-voice/wisdom ──────────────────────────────────────────────
router.post("/wisdom", async (req: Request, res: Response) => {
  try {
    const { situation, mood, domain } = req.body;
    if (!situation?.trim()) return res.status(400).json({ error: "situation is required" });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OpenRouter API key not configured" });

    const prompt = `You are a Sanskrit scholar and Vedic wisdom keeper with mastery of the Bhagavad Gita, Upanishads, Vedas, Yoga Sutras of Patanjali, and Dharmashastra.

A seeker is facing this situation: "${situation}"
${mood ? `Their current mood: ${mood}` : ""}
${domain ? `Life domain: ${domain}` : ""}

Select the most relevant Sanskrit shloka (verse) from authentic scriptures that speaks directly to this situation. Choose from: Bhagavad Gita, Upanishads (Kena, Katha, Isha, Mundaka, Mandukya), Yoga Sutras, Rig Veda, Arthashastra, Chanakya Niti, or Thirukkural.

Respond ONLY with valid JSON (no markdown, no code fences) in EXACTLY this structure:
{
  "shloka": "The exact Sanskrit shloka/verse in Devanagari script",
  "transliteration": "The romanized transliteration with diacritical marks",
  "source": "Source text and chapter/verse number (e.g., Bhagavad Gita 2.47, Katha Upanishad 1.2.23)",
  "wordByWord": "Brief word-by-word breakdown of key Sanskrit terms (3-5 key words)",
  "meaning": "The complete, beautiful English meaning of the shloka — 2-3 sentences",
  "application": "2-3 sentences explaining exactly how this shloka applies to the seeker's specific situation",
  "action": "One concrete action the seeker can take today inspired by this verse's teaching",
  "mantra": "A short mantra or phrase from this verse the seeker can repeat for contemplation"
}`;

    const raw = await callAI(apiKey, prompt, 900);
    const result = parseJSON(raw);
    return res.json(result);
  } catch (err: any) {
    console.error("Wisdom/shloka error:", err.message);
    return res.status(500).json({ error: "Failed to fetch shloka wisdom" });
  }
});

export default router;
