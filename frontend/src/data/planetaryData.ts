// Planetary and zodiac data structure with daily influences
export type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export interface PlanetaryInfluence {
  date: string;
  planet: string;
  zodiacSign: ZodiacSign;
  influence: string;
  luckyColor: string;
  luckyNumber: number;
  energyLevel: number; // 1-10
  chakra: string;
  affirmation: string;
  bestActivities: string[];
  thingsToAvoid: string[];
}

export interface Planet {
  id: string;
  name: string;
  color: string;
  size: number;
  orbitRadius: number;
  speed: number;
  rotationTilt: number;
  moons?: Array<{ name: string; size: number; distance: number }>;
  spiritualMeaning: string;
  ruledZodiacs: ZodiacSign[];
}

export const PLANETS: Planet[] = [
  {
    id: 'sun',
    name: 'Sun',
    color: '#fff8e0',
    size: 109,
    orbitRadius: 0,
    speed: 0.01,
    rotationTilt: 0.127,
    spiritualMeaning: 'Soul, self-expression, vitality, and divine consciousness (Surya)',
    ruledZodiacs: ['leo'],
  },
  {
    id: 'moon',
    name: 'Moon',
    color: '#d8d8d8',
    size: 0.27,
    orbitRadius: 0,
    speed: 0.3,
    rotationTilt: 0.026,
    spiritualMeaning: 'Mind, emotions, intuition, and divine feminine energy (Chandra)',
    ruledZodiacs: ['cancer'],
  },
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#b8a898',
    size: 0.38,
    orbitRadius: 5,
    speed: 1.6,
    rotationTilt: 0.122,
    spiritualMeaning: 'Communication, intellect, and mental clarity',
    ruledZodiacs: ['gemini', 'virgo'],
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#ffd080',
    size: 0.95,
    orbitRadius: 8,
    speed: 1.2,
    rotationTilt: 2.64,
    spiritualMeaning: 'Love, beauty, harmony, and divine feminine energy',
    ruledZodiacs: ['taurus', 'libra'],
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#4a90e2',
    size: 1.0,
    orbitRadius: 11,
    speed: 1.0,
    rotationTilt: 0.409,
    moons: [{ name: 'Moon', size: 0.27, distance: 1.5 }],
    spiritualMeaning: 'Home, grounding, stability, and material manifestation',
    ruledZodiacs: ['taurus', 'capricorn'],
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#e27b58',
    size: 0.53,
    orbitRadius: 15,
    speed: 0.8,
    rotationTilt: 0.435,
    spiritualMeaning: 'Passion, courage, action, and divine masculine energy',
    ruledZodiacs: ['aries', 'scorpio'],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#c88b3a',
    size: 11.21,
    orbitRadius: 22,
    speed: 0.4,
    rotationTilt: 0.055,
    spiritualMeaning: 'Expansion, wisdom, abundance, and spiritual growth',
    ruledZodiacs: ['sagittarius', 'pisces'],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#d4b895',
    size: 9.45,
    orbitRadius: 30,
    speed: 0.2,
    rotationTilt: 0.463,
    spiritualMeaning: 'Discipline, karma, time, and divine order',
    ruledZodiacs: ['capricorn', 'aquarius'],
  },
];

// ── Per-planet, per-zodiac influence messages ──────────────────────────────
const PLANET_ZODIAC_INFLUENCES: Record<string, Record<ZodiacSign, string>> = {
  mercury: {
    aries:       'Mercury ignites your warrior mind. Speak boldly — your words move mountains.',
    taurus:      'Mercury grounds your thoughts in practical wisdom. Choose words that build, not break.',
    gemini:      'Mercury is home in your sign. Your wit and agility are superpowers today.',
    cancer:      'Mercury softens into feeling. Write what your heart is afraid to say aloud.',
    leo:         'Mercury lends eloquence to your presence. A single speech can change a room.',
    virgo:       'Mercury sharpens every detail for you. Systems, plans, and precision flow effortlessly.',
    libra:       'Mercury weighs every word before speaking. Diplomacy is your gift today.',
    scorpio:     'Mercury digs beneath the surface. Hidden truths reveal themselves to the perceptive.',
    sagittarius: 'Mercury expands your philosophical reach. A conversation today could alter your path.',
    capricorn:   'Mercury structures your ambitions. Put the plan on paper — clarity equals power.',
    aquarius:    'Mercury sparks revolutionary ideas. The future is born in today\'s scattered notes.',
    pisces:      'Mercury blurs the line between intuition and intellect. Trust the voice within.',
  },
  venus: {
    aries:       'Venus softens your fire into grace. Love boldly, but also listen gently.',
    taurus:      'Venus is deeply at home with you. Beauty, pleasure, and abundance surround you.',
    gemini:      'Venus dances with your curiosity. Flirtation, art, and playful connection blossom.',
    cancer:      'Venus deepens your emotional bonds. A nurturing word today heals old wounds.',
    leo:         'Venus amplifies your radiance. You are magnetic, creative, and divinely attractive.',
    virgo:       'Venus refines your standards. You deserve beauty that meets your depth.',
    libra:       'Venus rules you and today she sings. Relationships, aesthetics, and love are aligned.',
    scorpio:     'Venus stirs your deepest desires. Vulnerability is your greatest strength today.',
    sagittarius: 'Venus broadens your heart. An unexpected connection may shift your entire perspective.',
    capricorn:   'Venus rewards patience in love. Commitment and loyalty deepen their roots.',
    aquarius:    'Venus celebrates your uniqueness. Unusual connections carry the deepest resonance.',
    pisces:      'Venus merges with your soul. Spiritual love and creative beauty flow through you.',
  },
  earth: {
    aries:       'Earth calls you to pause and root. The ground beneath steadies your fire.',
    taurus:      'Earth energy flows through you naturally today. Abundance is your birthright.',
    gemini:      'Earth asks you to finish what you started. Ground your brilliant mind.',
    cancer:      'Earth holds your emotional world in safety. Home and family nourish your soul.',
    leo:         'Earth reminds you that true royalty serves. Lead through presence, not performance.',
    virgo:       'Earth is your natural domain. Tend your body, space, and daily rituals carefully.',
    libra:       'Earth balances your idealism with form. Create beauty that lasts beyond the moment.',
    scorpio:     'Earth anchors your transformative power. What you build now will outlast the storm.',
    sagittarius: 'Earth invites you to plant seeds of vision. Adventure begins with a single step.',
    capricorn:   'Earth is your throne. Structure, effort, and integrity bring lasting material reward.',
    aquarius:    'Earth asks you to manifest your visions. Ideas become real when you touch the ground.',
    pisces:      'Earth gently wakes your dreaming soul. Your gifts need a physical vessel to serve.',
  },
  mars: {
    aries:       'Mars rules you and today is your day. Channel raw energy into decisive action.',
    taurus:      'Mars stirs your stubborn will into purposeful momentum. Slow fire burns longest.',
    gemini:      'Mars sharpens your wit into a sword. Use words with precision and intention.',
    cancer:      'Mars activates your protective instincts. Defend what you love with gentle strength.',
    leo:         'Mars fuels your creative fire. Bold expression and leadership define your day.',
    virgo:       'Mars drives your service forward. Work with fierce dedication and humble purpose.',
    libra:       'Mars challenges your peace-loving nature. Standing up for yourself is an act of love.',
    scorpio:     'Mars amplifies your magnetic intensity. Transformation requires courageous action.',
    sagittarius: 'Mars propels your quest for meaning. Adventure and philosophy call you forward.',
    capricorn:   'Mars and your ambition unite. Every effort today builds your legacy stone by stone.',
    aquarius:    'Mars fires your revolutionary spirit. Reform what no longer serves the collective.',
    pisces:      'Mars invites you to act on your dreams. Spiritual vision meets earthly courage.',
  },
  jupiter: {
    aries:       'Jupiter multiplies your courage tenfold. Think bigger — the universe is listening.',
    taurus:      'Jupiter overflows your cup with abundance. Gratitude opens the gates even wider.',
    gemini:      'Jupiter expands your mind across horizons. Learning, teaching, and wisdom are lit up.',
    cancer:      'Jupiter nurtures your emotional world into wholeness. Your family is your greatest gift.',
    leo:         'Jupiter and your solar energy collaborate. Recognition, joy, and generosity flow freely.',
    virgo:       'Jupiter expands your service into significance. Every detail carries cosmic weight today.',
    libra:       'Jupiter blesses your partnerships with growth. A collaboration leads to great expansion.',
    scorpio:     'Jupiter deepens your capacity for transformation. What feels heavy will become gold.',
    sagittarius: 'Jupiter rules you and amplifies everything. Philosophy, travel, and truth are illuminated.',
    capricorn:   'Jupiter rewards your discipline with rare opportunity. This is a moment of breakthrough.',
    aquarius:    'Jupiter liberates your visionary thinking. The collective benefits from your wisdom.',
    pisces:      'Jupiter flows with your boundless compassion. Spiritual gifts expand beyond measure.',
  },
  saturn: {
    aries:       'Saturn slows your charge to test your patience. Mastery comes through discipline.',
    taurus:      'Saturn affirms your steady dedication. Long-term commitments bring lasting rewards.',
    gemini:      'Saturn demands depth over breadth. Choose one path today and walk it with intention.',
    cancer:      'Saturn teaches emotional resilience. The boundaries you set protect your sacred heart.',
    leo:         'Saturn humbles your light into true wisdom. Authentic leadership outlasts spectacle.',
    virgo:       'Saturn honors your perfectionist spirit. Structured systems today yield lasting results.',
    libra:       'Saturn tests your relationships for truth. Only what is genuine will endure.',
    scorpio:     'Saturn forges your power through trial. You are becoming exactly who you need to be.',
    sagittarius: 'Saturn asks you to commit to one arrow. Depth of focus creates the breakthrough.',
    capricorn:   'Saturn is your ancient guide and ruler. Your discipline is being rewarded cosmically.',
    aquarius:    'Saturn structures your innovations into systems that last beyond one lifetime.',
    pisces:      'Saturn gently anchors your spiritual nature. Boundaries are the framework for your gifts.',
  },
};

// Per-planet best activities
const PLANET_ACTIVITIES: Record<string, string[]> = {
  mercury: ['Journaling and freewriting', 'Important conversations or negotiations', 'Learning a new skill', 'Strategic planning and brainstorming'],
  venus:   ['Creative arts and music', 'Time with loved ones', 'Self-care and beauty rituals', 'Expressing gratitude and affection'],
  earth:   ['Grounding in nature or barefoot walking', 'Tending to home and garden', 'Mindful cooking or eating', 'Physical exercise and body care'],
  mars:    ['Exercise and physical training', 'Starting ambitious projects', 'Courageous conversations', 'Competition and spirited pursuit of goals'],
  jupiter: ['Expanding knowledge through books or travel', 'Generous acts of giving', 'Setting expansive intentions', 'Teaching or mentoring others'],
  saturn:  ['Long-term planning and goal setting', 'Organizing and decluttering', 'Honoring commitments made', 'Meditation and disciplined practice'],
};

// Per-planet things to avoid
const PLANET_AVOIDANCES: Record<string, string[]> = {
  mercury: ['Gossip or careless words', 'Mental overload and scattered focus', 'Signing contracts without review', 'Miscommunication through assumptions'],
  venus:   ['Vanity or superficial choices', 'Jealousy and comparison', 'Over-indulgence in pleasure', 'Avoiding difficult emotional truths'],
  earth:   ['Materialism and hoarding energy', 'Ignoring your body\'s signals', 'Resisting necessary change', 'Excessive stubbornness'],
  mars:    ['Reckless anger or impulsive decisions', 'Unnecessary conflict', 'Forcing outcomes before their time', 'Ignoring the need for rest'],
  jupiter: ['Overconfidence and exaggeration', 'Spreading yourself too thin', 'Blind optimism without a plan', 'Excess in food, drink, or pleasure'],
  saturn:  ['Resistance to necessary responsibility', 'Pessimism and fear of failure', 'Shortcuts that undermine your integrity', 'Isolation and rigidity'],
};

// Per-zodiac chakra mapping
const ZODIAC_CHAKRAS: Record<ZodiacSign, string> = {
  aries:       'Root & Solar Plexus Chakra',
  taurus:      'Root & Throat Chakra',
  gemini:      'Throat & Crown Chakra',
  cancer:      'Heart & Sacral Chakra',
  leo:         'Solar Plexus & Heart Chakra',
  virgo:       'Solar Plexus & Third Eye Chakra',
  libra:       'Heart & Crown Chakra',
  scorpio:     'Sacral & Third Eye Chakra',
  sagittarius: 'Third Eye & Crown Chakra',
  capricorn:   'Root & Third Eye Chakra',
  aquarius:    'Crown & Throat Chakra',
  pisces:      'Crown & Heart Chakra',
};

// Per-zodiac affirmations
const ZODIAC_AFFIRMATIONS: Record<ZodiacSign, string> = {
  aries:       'I am courageous, decisive, and unstoppable in my pursuit of purpose.',
  taurus:      'I am grounded in abundance and worthy of all the beauty life offers.',
  gemini:      'I communicate with clarity, curiosity, and authentic expression.',
  cancer:      'I am emotionally wise, deeply loved, and a source of nurturing light.',
  leo:         'I radiate confidence, creativity, and the warmth of my authentic self.',
  virgo:       'I serve with wisdom, create with precision, and honour my sacred worth.',
  libra:       'I attract harmonious relationships and walk in balance, beauty, and grace.',
  scorpio:     'I transform through depth, emerge in power, and trust my inner knowing.',
  sagittarius: 'I expand freely, trust the journey, and find wisdom in every horizon.',
  capricorn:   'I am disciplined, purposeful, and building a legacy that honours my soul.',
  aquarius:    'I am a visionary, a humanitarian, and a catalyst for awakening.',
  pisces:      'I flow with divine intuition and channel love from a boundless cosmic source.',
};

// Planet-specific lucky color palettes
const PLANET_COLOR_PALETTES: Record<string, string[]> = {
  mercury: ['#C0C0C0', '#A8A9AD', '#BCC6CC', '#9EA7AA'],
  venus:   ['#FFB6C1', '#FF69B4', '#E8A0BF', '#FFC0CB'],
  earth:   ['#4169E1', '#00CED1', '#20B2AA', '#48D1CC'],
  mars:    ['#FF4500', '#FF6347', '#DC143C', '#FF7043'],
  jupiter: ['#FFA500', '#FFD700', '#FF8C00', '#DAA520'],
  saturn:  ['#9370DB', '#8A2BE2', '#7B68EE', '#6A5ACD'],
};

// Generate daily influence — optionally locked to a specific planet the user clicked
export const getDailyInfluence = (
  zodiacSign: ZodiacSign,
  date: Date = new Date(),
  planetId?: string
): PlanetaryInfluence => {
  const dateStr = date.toISOString().split('T')[0];
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );

  // Use provided planetId or fall back to day-based selection
  const planetIndex = planetId
    ? Math.max(0, PLANETS.findIndex(p => p.id === planetId))
    : dayOfYear % PLANETS.length;
  const planet = PLANETS[planetIndex];

  const seed = parseInt(dateStr.replace(/-/g, ''));
  const energyLevel = 3 + (seed % 8);
  const luckyNumber = 1 + (seed % 99);

  const palette = PLANET_COLOR_PALETTES[planet.id] ?? ['#ffffff'];
  const luckyColor = palette[seed % palette.length];

  const influence =
    PLANET_ZODIAC_INFLUENCES[planet.id]?.[zodiacSign] ??
    `${planet.name}'s energy aligns with your ${zodiacSign} nature today.`;

  const bestActivities = PLANET_ACTIVITIES[planet.id] ?? [
    `Meditate with ${planet.name}'s energy`,
    'Pursue meaningful goals',
    'Strengthen connections with loved ones',
    'Practice gratitude and mindfulness',
  ];

  const thingsToAvoid = PLANET_AVOIDANCES[planet.id] ?? [
    'Rushed decisions',
    'Negative self-talk',
    'Holding grudges',
    'Ignoring your intuition',
  ];

  return {
    date: dateStr,
    planet: planet.name,
    zodiacSign,
    influence,
    luckyColor,
    luckyNumber,
    energyLevel,
    chakra: ZODIAC_CHAKRAS[zodiacSign],
    affirmation: ZODIAC_AFFIRMATIONS[zodiacSign],
    bestActivities,
    thingsToAvoid,
  };
};

// ── Rich per-planet detail data ───────────────────────────────────────────────
export interface PlanetDetail {
  zodiacPlacement: string;
  housePlacement: string;
  strengthScore: number;       // 1–10
  nature: 'Benefic' | 'Malefic' | 'Neutral';
  keyTraits: string[];
  positiveEffects: string[];
  challengingEffects: string[];
  careerInfluence: string;
  relationshipInfluence: string;
  healthInfluence: string;
  karmicLessons: string;
  aiInterpretation: string;
}

export const PLANET_DETAILS: Record<string, PlanetDetail> = {
  mercury: {
    zodiacPlacement: 'Gemini & Virgo',
    housePlacement: '3rd House (Communication) & 6th House (Service)',
    strengthScore: 7,
    nature: 'Neutral',
    keyTraits: ['Analytical', 'Communicative', 'Adaptable', 'Quick-witted', 'Perceptive'],
    positiveEffects: [
      'Sharp intellect and razor-sharp perception',
      'Eloquent, persuasive communication',
      'Rapid problem-solving and logical clarity',
      'Versatility that allows mastery of many skills',
    ],
    challengingEffects: [
      'Overthinking that leads to mental paralysis',
      'Anxiety and nervous restlessness',
      'Scattered focus — too many ideas, too little follow-through',
      'Tendency toward indecision and second-guessing',
    ],
    careerInfluence: 'Mercury empowers careers in journalism, writing, technology, education, trading, and all forms of communication. Your mind is your greatest asset — wield it boldly.',
    relationshipInfluence: 'You seek intellectual equal partnerships where words flow freely. Stimulating conversation is your love language. A meeting of minds ignites your deepest connections.',
    healthInfluence: 'Mercury governs the nervous system, lungs, hands, and cognitive function. Mental rest, breathwork, and regular grounding practices keep your quicksilver energy balanced.',
    karmicLessons: 'Express your deepest truths with compassion and precision. Learn that silence is also a form of wisdom. Master the art of listening as deeply as you speak.',
    aiInterpretation: 'Mercury, planet of mind and message, sharpens your perception to a cosmic edge today. Your words carry the power to heal, inspire, and transform. Choose them as a sculptor chooses each stroke — with intention and mastery. The universe is listening to every thought you broadcast.',
  },
  venus: {
    zodiacPlacement: 'Taurus & Libra',
    housePlacement: '2nd House (Values & Wealth) & 7th House (Partnerships)',
    strengthScore: 9,
    nature: 'Benefic',
    keyTraits: ['Loving', 'Artistic', 'Harmonious', 'Magnetic', 'Sensual'],
    positiveEffects: [
      'Irresistible magnetic charm that attracts love and abundance',
      'Artistic brilliance and refined aesthetic sense',
      'Social grace that creates harmony everywhere you go',
      'Deep capacity for unconditional love and devotion',
    ],
    challengingEffects: [
      'Vanity and excessive focus on outward appearances',
      'Over-indulgence in pleasure, comfort, and luxury',
      'Conflict avoidance that allows problems to fester',
      'Emotional dependency and fear of being unloved',
    ],
    careerInfluence: 'Venus opens doors in art, music, luxury goods, fashion, diplomacy, beauty, and entertainment. Your refined taste and people skills make you a natural in fields where beauty and connection create value.',
    relationshipInfluence: 'Venus deepens romantic bonds and calls you to create lasting partnerships through beauty and mutual growth. You thrive in relationships where both partners elevate each other spiritually and emotionally.',
    healthInfluence: 'Venus rules the kidneys, skin, throat, hormonal balance, and venous system. Nurture these through hydration, natural beauty rituals, and environments that feel aesthetically peaceful.',
    karmicLessons: 'Discover that true beauty radiates from the soul, not the surface. Learn that love begins as a relationship with yourself before it can flourish with another.',
    aiInterpretation: 'Venus, cosmic goddess of love and divine beauty, wraps your entire day in golden light today. The universe is arranging encounters, opportunities, and moments of grace in your favor. Open your heart fully — what you radiate from within, you shall attract without. Let beauty be your compass and love be your north star.',
  },
  earth: {
    zodiacPlacement: 'Taurus & Capricorn (Earth Element)',
    housePlacement: '1st House (Self & Identity) & 4th House (Home & Roots)',
    strengthScore: 10,
    nature: 'Neutral',
    keyTraits: ['Grounded', 'Stable', 'Nurturing', 'Practical', 'Enduring'],
    positiveEffects: [
      'Unparalleled manifestation power in the physical realm',
      'Deep connection to nature and natural cycles',
      'Steadfast presence that others rely on completely',
      'Material mastery — the ability to build lasting legacies',
    ],
    challengingEffects: [
      'Stubbornness that resists necessary evolution',
      'Over-attachment to material possessions and security',
      'Resistance to spiritual growth in favor of the tangible',
      'Difficulty embracing uncertainty and the unknown',
    ],
    careerInfluence: 'Earth energy thrives in environmental work, agriculture, architecture, real estate, healing arts, and any field that transforms raw material into lasting structures of beauty and function.',
    relationshipInfluence: 'Earth provides the foundation every relationship needs — unwavering stability, deep warmth, and loyalty that endures all seasons. You love through acts of service and presence.',
    healthInfluence: 'Earth governs the skeletal system, muscles, digestive health, and overall physical vitality. Time in nature, barefoot grounding, and whole foods align you with Earth\'s healing frequency.',
    karmicLessons: 'Walk between worlds — honor the sacred physical while never forgetting your divine origin. Master the art of manifestation: turning spirit into matter, and matter back into spirit.',
    aiInterpretation: 'Earth, your cosmic home and sacred ground, anchors your spirit in the miracle of physical existence today. Feel the intelligence of the living planet beneath you — it holds your history, your healing, and your highest potential. Today, let the Earth remind you: you are not separate from nature. You ARE nature, expressing itself consciously.',
  },
  mars: {
    zodiacPlacement: 'Aries & Scorpio',
    housePlacement: '1st House (Self & Action) & 8th House (Transformation)',
    strengthScore: 7,
    nature: 'Malefic',
    keyTraits: ['Bold', 'Courageous', 'Passionate', 'Driven', 'Transformative'],
    positiveEffects: [
      'Unstoppable drive that achieves what others deem impossible',
      'Fearless leadership that inspires others to rise',
      'Passionate devotion that protects what truly matters',
      'Transformative power to rise from adversity stronger',
    ],
    challengingEffects: [
      'Uncontrolled anger that damages relationships and opportunities',
      'Reckless impulsiveness that bypasses wisdom',
      'Tendency toward unnecessary conflict and power struggles',
      'Burn-out from pushing physical and emotional limits too far',
    ],
    careerInfluence: 'Mars fuels success in entrepreneurship, sports, military leadership, surgery, emergency services, engineering, and any arena demanding courage, decisiveness, and raw competitive energy.',
    relationshipInfluence: 'Mars creates passionate, intensely devoted partnerships charged with electricity and depth. You protect what you love with fierce loyalty. However, learning emotional regulation is essential for harmony.',
    healthInfluence: 'Mars rules blood, muscles, the adrenal glands, and inflammatory processes in the body. Channel this fiery energy through disciplined physical training, and honor the body\'s need for recovery.',
    karmicLessons: 'Transform the warrior\'s aggression into the hero\'s compassionate courage. Learn that the greatest battles are fought within — and the greatest victories are choosing love over ego.',
    aiInterpretation: 'Mars, the cosmic warrior and planet of divine courage, activates your deepest source of power today. This is your day to act with bold intention. The universe does not reward the hesitant — it rewards the brave. Channel every ounce of this fierce energy toward your highest purpose, and watch the cosmos clear every obstacle in your path.',
  },
  jupiter: {
    zodiacPlacement: 'Sagittarius & Pisces',
    housePlacement: '9th House (Wisdom & Travel) & 12th House (Spirituality)',
    strengthScore: 10,
    nature: 'Benefic',
    keyTraits: ['Expansive', 'Optimistic', 'Wise', 'Generous', 'Visionary'],
    positiveEffects: [
      'Extraordinary luck that bends reality in your favor',
      'Deep philosophical wisdom earned through experience',
      'Abundance consciousness that attracts wealth and opportunity',
      'Spiritual insight that guides others toward their highest path',
    ],
    challengingEffects: [
      'Overconfidence and excessive optimism without grounded planning',
      'Over-indulgence in all pleasures — excess in every form',
      'Scattered focus from too many simultaneous opportunities',
      'Unrealistic expectations that lead to eventual disappointment',
    ],
    careerInfluence: 'Jupiter opens paths in law, philosophy, higher education, publishing, spirituality, international trade, and any field where wisdom, vision, and expansion create extraordinary value.',
    relationshipInfluence: 'Jupiter brings boundless joy, spiritual depth, and shared visions of growth to relationships. Your partnerships often feel fated — soulmate connections that expand both individuals beyond known limits.',
    healthInfluence: 'Jupiter governs the liver, hips, thighs, blood sugar regulation, and the immune system. Conscious moderation — especially in diet and lifestyle — is Jupiter\'s greatest health teaching.',
    karmicLessons: 'Expand beyond every limitation you have inherited. Become a teacher of possibility — show others that the universe\'s abundance is not earned through struggle, but through alignment.',
    aiInterpretation: 'Jupiter, the great benefactor and cosmic expander of destinies, pours unlimited blessings upon your path today. Every door you approach is already opening. Every seed you plant today contains a forest of potential. This is a day to say YES to expansion, YES to abundance, and YES to the extraordinary life you were born to live. The universe is conspiring entirely in your favor.',
  },
  saturn: {
    zodiacPlacement: 'Capricorn & Aquarius',
    housePlacement: '10th House (Career & Legacy) & 11th House (Community & Vision)',
    strengthScore: 8,
    nature: 'Malefic',
    keyTraits: ['Disciplined', 'Structured', 'Patient', 'Karmic', 'Authoritative'],
    positiveEffects: [
      'Mastery and excellence built through patient, persistent effort',
      'Enduring success that withstands the test of time',
      'Profound wisdom earned through overcoming adversity',
      'Karmic rewards that arrive precisely when most needed',
    ],
    challengingEffects: [
      'Painful delays and restrictions that test faith in the process',
      'Heavy responsibilities that feel isolating and overwhelming',
      'Deep-seated fear of failure, scarcity, and inadequacy',
      'Pessimism and rigidity that blocks necessary flow and change',
    ],
    careerInfluence: 'Saturn builds legendary careers in government, law, corporate leadership, architecture, banking, and traditional industries. Your rise may be slower than others — but it will be higher and more enduring.',
    relationshipInfluence: 'Saturn calls you toward serious, committed partnerships built on trust, mutual responsibility, and shared growth. These relationships may start slowly but they build into unbreakable bonds across lifetimes.',
    healthInfluence: 'Saturn governs bones, teeth, joints, skin, and the body\'s structural integrity. Regular discipline — consistent sleep, disciplined nutrition, and skeletal care — honors Saturn\'s domain.',
    karmicLessons: 'Time is the cosmic currency. What you build with integrity and patience shall outlast everything built with shortcuts. Embrace responsibility not as a burden, but as the sacred architecture of your destiny.',
    aiInterpretation: 'Saturn, the cosmic architect of destiny and keeper of karmic accounts, calls you to rise today to the absolute height of your potential. Every restriction you encounter is a custom-designed curriculum preparing you for your greatest chapter. Do not rush what needs time to become great. Your patience today is tomorrow\'s mastery. The cosmos rewards every disciplined effort with timeless, irreversible success.',
  },
};

// Get zodiac sign from birth date
export const getZodiacSign = (date: Date): ZodiacSign => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
};
