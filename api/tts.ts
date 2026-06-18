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
        speaker: "shubh",
        pitch: 0,
        pace: 0.9,
        loudness: 1.5,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v2",
      }),
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error("Sarvam TTS error:", sarvamRes.status, errText);
      return res.status(502).json({ error: "Sarvam TTS failed", sarvamStatus: sarvamRes.status, sarvamError: errText });
    }

    const data = await sarvamRes.json() as any;
    const audio = data.audios?.[0];
    if (!audio) {
      return res.status(502).json({ error: "No audio in Sarvam response" });
    }

    return res.status(200).json({ audio });
  } catch (err: any) {
    console.error("TTS proxy error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
