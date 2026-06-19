export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, language } = req.body ?? {};
  if (!String(text ?? "").trim()) {
    return res.status(400).json({ error: "text is required" });
  }

  const apiKey = process.env.SARVAM_API_KEY || process.env.VITE_SARVAM_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "SARVAM_API_KEY not configured" });
  }

  const langCode = String(language ?? "").startsWith("en") ? "en-IN" : "hi-IN";
  console.log("[Sarvam TTS] Request — model: bulbul:v3, speaker: manan, lang:", langCode, "chars:", String(text).trim().length);

  try {
    const sarvamRes = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        inputs: [String(text).slice(0, 500)],
        target_language_code: langCode,
        speaker: "manan",
        pace: 0.85,
        speech_sample_rate: 22050,
        model: "bulbul:v3",
        temperature: 0.4,
      }),
    });

    if (!sarvamRes.ok) {
      const errBody = await sarvamRes.text();
      console.error("[Sarvam TTS] HTTP", sarvamRes.status, errBody);
      return res.status(502).json({
        error: "Sarvam TTS failed",
        sarvamStatus: sarvamRes.status,
        sarvamError: errBody,
      });
    }

    const data = await sarvamRes.json() as any;
    const audio = data.audios?.[0];
    if (!audio) {
      console.error("[Sarvam TTS] No audio in response:", data);
      return res.status(502).json({ error: "No audio in Sarvam response" });
    }

    console.log("[Sarvam TTS] Success — audio returned");
    return res.status(200).json({ audio });
  } catch (err: any) {
    console.error("[Sarvam TTS] Proxy error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
