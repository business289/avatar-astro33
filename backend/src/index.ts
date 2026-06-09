import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';
import interpretationRoutes from './routes/interpretationRoutes';
import compatibilityRoutes from './routes/compatibilityRoutes';
import birthChartRoutes from './routes/birthChartRoutes';
import innerVoiceRoutes from './routes/innerVoiceRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/astrology';

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server proxy, curl, mobile)
    if (!origin) return callback(null, true);
    // Allow any localhost or 127.0.0.1 on any port during development
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Server is running' });
});

// Zodiac endpoints
app.get('/api/zodiac/signs', (_req: Request, res: Response) => {
  const signs = [
    { name: 'Aries',       symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire',  ruling_planet: 'Mars'    },
    { name: 'Taurus',      symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth', ruling_planet: 'Venus'   },
    { name: 'Gemini',      symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air',   ruling_planet: 'Mercury' },
    { name: 'Cancer',      symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water', ruling_planet: 'Moon'    },
    { name: 'Leo',         symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire',  ruling_planet: 'Sun'     },
    { name: 'Virgo',       symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth', ruling_planet: 'Mercury' },
    { name: 'Libra',       symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air',   ruling_planet: 'Venus'   },
    { name: 'Scorpio',     symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water', ruling_planet: 'Pluto'   },
    { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire',  ruling_planet: 'Jupiter' },
    { name: 'Capricorn',   symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth', ruling_planet: 'Saturn'  },
    { name: 'Aquarius',    symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air',   ruling_planet: 'Uranus'  },
    { name: 'Pisces',      symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water', ruling_planet: 'Neptune' },
  ];
  res.json({ success: true, data: signs });
});

app.get('/api/zodiac/signs/:sign', (req: Request, res: Response) => {
  const { sign } = req.params;
  const signData: Record<string, any> = {
    'Aries':       { name: 'Aries',       symbol: '♈', element: 'Fire',  ruling_planet: 'Mars',    dates: 'Mar 21 - Apr 19' },
    'Taurus':      { name: 'Taurus',      symbol: '♉', element: 'Earth', ruling_planet: 'Venus',   dates: 'Apr 20 - May 20' },
    'Gemini':      { name: 'Gemini',      symbol: '♊', element: 'Air',   ruling_planet: 'Mercury', dates: 'May 21 - Jun 20' },
    'Cancer':      { name: 'Cancer',      symbol: '♋', element: 'Water', ruling_planet: 'Moon',    dates: 'Jun 21 - Jul 22' },
    'Leo':         { name: 'Leo',         symbol: '♌', element: 'Fire',  ruling_planet: 'Sun',     dates: 'Jul 23 - Aug 22' },
    'Virgo':       { name: 'Virgo',       symbol: '♍', element: 'Earth', ruling_planet: 'Mercury', dates: 'Aug 23 - Sep 22' },
    'Libra':       { name: 'Libra',       symbol: '♎', element: 'Air',   ruling_planet: 'Venus',   dates: 'Sep 23 - Oct 22' },
    'Scorpio':     { name: 'Scorpio',     symbol: '♏', element: 'Water', ruling_planet: 'Pluto',   dates: 'Oct 23 - Nov 21' },
    'Sagittarius': { name: 'Sagittarius', symbol: '♐', element: 'Fire',  ruling_planet: 'Jupiter', dates: 'Nov 22 - Dec 21' },
    'Capricorn':   { name: 'Capricorn',   symbol: '♑', element: 'Earth', ruling_planet: 'Saturn',  dates: 'Dec 22 - Jan 19' },
    'Aquarius':    { name: 'Aquarius',    symbol: '♒', element: 'Air',   ruling_planet: 'Uranus',  dates: 'Jan 20 - Feb 18' },
    'Pisces':      { name: 'Pisces',      symbol: '♓', element: 'Water', ruling_planet: 'Neptune', dates: 'Feb 19 - Mar 20' },
  };
  res.json({ success: true, data: signData[sign] || signData['Aries'] });
});

// Newsletter
app.post('/api/newsletter/subscribe', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
  res.json({ success: true, message: 'Subscribed successfully', email });
});

// Contact form
app.post('/api/contact/send', (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }
  res.json({ success: true, message: 'Message sent successfully' });
});

// AI routes
app.use('/api/interpretation', interpretationRoutes);
app.use('/api/compatibility', compatibilityRoutes);
app.use('/api/birthchart', birthChartRoutes);
app.use('/api/inner-voice', innerVoiceRoutes);

// ── Palm Reading ────────────────────────────────────────────────────────────
app.post('/api/palm-reading', async (req: Request, res: Response) => {
  const { imageBase64, imageType, fingerprint } = req.body;
  if (!imageBase64 || !imageType) {
    return res.status(400).json({ success: false, error: 'imageBase64 and imageType are required' });
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ success: false, error: 'OPENROUTER_API_KEY not configured' });
  }

  const seedNum = fingerprint ? parseInt(fingerprint) % 1000 : Math.floor(Math.random() * 1000);
  const prompt = `You are a master Vedic palmistry expert with 40+ years of experience. Carefully analyze this palm image.

Look at the actual lines, mounts, and hand shape visible in the image. Use seed number ${seedNum} to ensure this user always gets the same consistent reading.

Return ONLY valid JSON, no markdown fences, no extra text. Use this exact structure:
{
  "handType": "Earth Hand",
  "element": "Earth 🌍",
  "palmScore": 8.4,
  "confidence": 93,
  "dominance": "Right (Active)",
  "lines": {
    "heart": { "quality": "Long & deeply curved", "depth": "Deep", "headline": "Your Heart — Emotions & Love", "reading": "3-4 detailed sentences about emotional nature, love life, relationships.", "strengths": ["Deep emotional loyalty","Strong empathy","Passionate connections","Intuitive heart"], "challenges": ["Tendency to over-give","Difficulty letting go","Emotional sensitivity"], "advice": "One sentence of personalized practical advice." },
    "head":  { "quality": "Long, sweeping across palm", "depth": "Moderate", "headline": "Your Mind — Intelligence & Clarity", "reading": "3-4 detailed sentences about intellect, decision-making, mental strengths.", "strengths": ["Strategic thinking","Creative problem solving","Strong focus","Intellectual curiosity"], "challenges": ["Overthinking","Analysis paralysis","Difficulty with quick decisions"], "advice": "One sentence of personalized practical advice." },
    "life":  { "quality": "Strong sweeping arc", "depth": "Deep", "headline": "Your Life — Vitality & Path", "reading": "3-4 detailed sentences about vitality, energy, life transitions.", "strengths": ["High vitality","Resilience","Strong adaptability","Personal growth"], "challenges": ["Taking on too much","Need for rest","Restless energy"], "advice": "One sentence of personalized practical advice." },
    "fate":  { "quality": "Clear vertical line", "depth": "Strong", "headline": "Your Destiny — Career & Purpose", "reading": "3-4 detailed sentences about career path, life purpose, destiny markers.", "strengths": ["Clear life direction","Career focus","Natural leadership","Purpose-driven"], "challenges": ["Rigidity in plans","Difficulty pivoting","External pressure sensitivity"], "advice": "One sentence of personalized practical advice." }
  },
  "mounts": [
    {"name":"Mount of Jupiter","planet":"Jupiter","strength":82,"symbol":"♃","reading":"Two sentences about ambition and leadership."},
    {"name":"Mount of Saturn","planet":"Saturn","strength":71,"symbol":"♄","reading":"Two sentences about discipline and karma."},
    {"name":"Mount of Sun (Apollo)","planet":"Sun","strength":88,"symbol":"☉","reading":"Two sentences about creative power and charisma."},
    {"name":"Mount of Mercury","planet":"Mercury","strength":75,"symbol":"☿","reading":"Two sentences about communication and business acumen."},
    {"name":"Mount of Venus","planet":"Venus","strength":79,"symbol":"♀","reading":"Two sentences about love and sensuality."},
    {"name":"Mount of Moon (Luna)","planet":"Moon","strength":69,"symbol":"☽","reading":"Two sentences about intuition and imagination."}
  ],
  "personality": [
    {"trait":"Leadership","score":81,"description":"One sentence insight."},
    {"trait":"Emotional Depth","score":88,"description":"One sentence insight."},
    {"trait":"Creative Power","score":76,"description":"One sentence insight."},
    {"trait":"Intellectual Force","score":83,"description":"One sentence insight."},
    {"trait":"Spiritual Sensitivity","score":72,"description":"One sentence insight."},
    {"trait":"Willpower","score":79,"description":"One sentence insight."}
  ],
  "love": { "style": "Devoted & Passionate", "summary": "2-3 sentence love life overview.", "soulmate": "Describe ideal partner qualities.", "warning": "One sentence about the main relationship pitfall." },
  "career": { "path": "The Visionary Creator", "summary": "2-3 sentence career overview.", "bestRoles": ["Role 1","Role 2","Role 3","Role 4"], "wealthLine": "One sentence about wealth potential." },
  "timeline": [
    {"phase":"Foundation Years","years":"Age 0–20","theme":"Learning & Self-Discovery","insight":"Two sentences for this phase."},
    {"phase":"Rise & Ambition","years":"Age 21–35","theme":"Growth & Bold Choices","insight":"Two sentences for this phase."},
    {"phase":"Mastery Period","years":"Age 36–55","theme":"Achievement & Impact","insight":"Two sentences for this phase."},
    {"phase":"Legacy Years","years":"Age 56+","theme":"Wisdom & Fulfillment","insight":"Two sentences for this phase."}
  ],
  "hiddenGifts": ["Hidden gift 1","Hidden gift 2","Hidden gift 3","Hidden gift 4","Hidden gift 5"],
  "luckyElements": {"number":"7","color":"Deep Indigo","day":"Thursday","gem":"Amethyst","direction":"Northeast"},
  "summary": "A powerful 3-4 sentence master summary of the entire palm reading."
}`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3.5-sonnet',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${imageType};base64,${imageBase64}` } },
            { type: 'text', text: prompt }
          ]
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:8081',
          'X-Title': 'Spiritual AI Palm Reading'
        }
      }
    );

    const text = response.data.choices[0].message.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse JSON from AI response');
    const result = JSON.parse(jsonMatch[0]);
    res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Palm reading error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.response?.data?.error?.message || err.message });
  }
});

// Error handling middleware (must be last)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start server (MongoDB optional — server runs without it)
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.warn('⚠ MongoDB not available — running without database');
  }

  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
  });
}

startServer();
