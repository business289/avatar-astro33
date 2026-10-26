/**
 * Original long-form articles. Each one is published on the date in `date`
 * (the day it was added to the site); nothing here is back-dated. Reading time is
 * calculated from the real word count in `articleWordCount`, never typed by hand.
 */

export interface ArticleLink {
  label: string;
  to: string;
}

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO publication date. */
  date: string;
  /** Draft articles are excluded everywhere on the public site. */
  published: boolean;
  image: string;
  imageAlt: string;
  /** Vertical focal point for object-position, in percent. */
  imageFocus?: number;
  intro: string[];
  sections: ArticleSection[];
  conclusion: string[];
  related: ArticleLink[];
}

export const blogArticles: BlogArticle[] = [
  {
    slug: "how-to-read-your-birth-chart",
    title: "How to Read Your Birth Chart: Planets, Signs and Houses",
    excerpt:
      "A birth chart looks complicated until you see that it answers three simple questions: what, how and where. Start there.",
    category: "Astrology Basics",
    date: "2026-10-24",
    published: true,
    image: "/images/blog/birth-chart-guide.jpg",
    imageAlt: "A printed natal chart on a table beside a lit candle",
    imageFocus: 55,
    intro: [
      "A birth chart is a map of the sky drawn for the exact moment and place you were born. It is a circle divided into twelve slices, with small symbols scattered around it and a web of lines across the middle. For a first-time reader that can feel like looking at a circuit diagram.",
      "The good news is that every chart is built from just three ingredients, and each one answers a plain question. Learn those three and the rest becomes a matter of putting sentences together.",
    ],
    sections: [
      {
        heading: "Planets: the “what”",
        paragraphs: [
          "The planets, together with the Sun and Moon, stand for the basic drives and functions that astrologers talk about. They describe what is being expressed.",
        ],
        bullets: [
          "The Sun is identity and purpose.",
          "The Moon is emotional needs and habits.",
          "Mercury is how you think and communicate.",
          "Venus is what you value and how you relate.",
          "Mars is drive, effort and the way you handle conflict.",
          "Jupiter and Saturn are growth and structure, the expansive and the limiting.",
        ],
      },
      {
        heading: "Signs: the “how”",
        paragraphs: [
          "A sign describes the style in which a planet operates. The Moon in Cancer and the Moon in Aquarius are both about emotional needs, but the first is usually described as seeking closeness and the second as needing space to think. The planet stays the same; the sign changes its flavour.",
          "This is why two people with the same Sun sign can still read very differently. The Sun is only one of ten or more placements in the chart.",
        ],
      },
      {
        heading: "Houses: the “where”",
        paragraphs: [
          "The twelve houses are areas of life: self, money, communication, home, creativity, work, partnership and so on. A planet in a house suggests where in life its themes tend to show up. Saturn in the sixth house, for example, is traditionally linked with a serious, disciplined approach to daily work and health routines.",
          "Houses depend on your birth time, which is why an accurate time matters. Even a difference of a few minutes can move the Ascendant, the sign rising on the eastern horizon at the moment of birth, and shift every house with it.",
        ],
      },
      {
        heading: "Putting it together: a worked example",
        paragraphs: [
          "Take the phrase “Venus in Libra in the seventh house”. Read it in order: Venus (what: values and affection), Libra (how: with a taste for balance and fairness), seventh house (where: close partnerships). A traditional reading might say this person puts weight on harmony in one-to-one relationships. It is a starting description, not a verdict.",
          "Aspects, the lines in the middle of the chart, then show how placements talk to each other. A trine is usually read as an easy flow between two planets and a square as friction that asks for effort. Treat them as the second layer, after you are comfortable with planets, signs and houses.",
        ],
      },
      {
        heading: "A sensible way to start",
        paragraphs: [
          "Begin with the Sun, Moon and Ascendant. Write one sentence for each in plain words. Then add the planets one at a time. Keep notes on what rings true and what does not; astrology is an interpretive tradition, and your own experience is the best test of any single statement.",
        ],
      },
    ],
    conclusion: [
      "Planets say what, signs say how, houses say where. Reading a chart is the practice of combining those three words into a sentence, and then holding the sentence lightly. Astrology offers a framework for reflection, not a prediction you have to live up to.",
    ],
    related: [
      { label: "Generate your own birth chart", to: "/birth-chart" },
      { label: "Explore the twelve zodiac signs", to: "/zodiac" },
    ],
  },
  {
    slug: "moon-signs-explained",
    title: "Moon Signs Explained: Understanding Your Emotional World",
    excerpt:
      "Your Sun sign is how you shine; your Moon sign is how you feel at home in yourself. Here is how to read it.",
    category: "Moon & Emotions",
    date: "2026-10-24",
    published: true,
    image: "/images/blog/moon-signs.jpg",
    imageAlt: "A full moon against a dark night sky",
    imageFocus: 40,
    intro: [
      "Most people know their Sun sign. Fewer know their Moon sign, yet many astrologers consider it just as useful for understanding day-to-day life. The Sun describes the identity you grow into; the Moon describes what you need in order to feel safe, fed and settled.",
      "The Moon moves through a sign in about two and a half days, so it changes sign roughly every couple of days. That means your Moon sign depends on your birth date and, when the Moon changes sign that day, your birth time too.",
    ],
    sections: [
      {
        heading: "What the Moon represents",
        paragraphs: [
          "In traditional astrology the Moon stands for instinct, memory, habits and the body's need for comfort. It is associated with home, with the way you were looked after as a child, and with the reflexes you fall back on when you are tired or stressed.",
          "A useful test: your Sun sign is what you do when you are choosing, and your Moon sign is what you do when you are not thinking about it.",
        ],
      },
      {
        heading: "The four elements and the Moon",
        paragraphs: [
          "The easiest way to get a first impression is by element, and the descriptions below are traditional generalisations, not rules.",
        ],
        bullets: [
          "Fire Moons (Aries, Leo, Sagittarius) are described as processing feelings quickly and openly, often through action.",
          "Earth Moons (Taurus, Virgo, Capricorn) are described as seeking stability, routine and physical comfort.",
          "Air Moons (Gemini, Libra, Aquarius) are described as working through emotion by talking, thinking and gaining perspective.",
          "Water Moons (Cancer, Scorpio, Pisces) are described as feeling deeply and picking up on atmosphere and mood.",
        ],
      },
      {
        heading: "Example: the same stressful week, three different Moons",
        paragraphs: [
          "Imagine a tight deadline. A Moon in Aries might want to attack the problem immediately and feel better once something is moving. A Moon in Virgo may calm down by making lists and tidying the desk. A Moon in Pisces might need quiet time or music before it can focus. None of these is better; they are three ways of settling the same nerves.",
          "Recognising your own pattern is the practical value here. If you know what steadies you, you can reach for it earlier.",
        ],
      },
      {
        heading: "Moon phase versus Moon sign",
        paragraphs: [
          "These two are often confused. The Moon sign is the zodiac sign the Moon occupied when you were born. The Moon phase is how much of it was lit (new, waxing, full, waning). A natal chart uses the sign; the phase is a separate, additional layer some astrologers also read.",
        ],
      },
      {
        heading: "How to find yours",
        paragraphs: [
          "You need your birth date, ideally your birth time, and your birth place. A birth chart calculator does the arithmetic and lists the Moon's sign and house together with the rest of your placements.",
        ],
      },
    ],
    conclusion: [
      "Your Moon sign is a lens for noticing how you handle feelings, not a diagnosis. Read the description for your sign, see what fits and what does not, and treat what fits as a prompt for self-reflection. Astrology is a traditional way of thinking about character; it is not a substitute for medical or psychological advice.",
    ],
    related: [
      { label: "Find your Moon sign in a birth chart", to: "/birth-chart" },
      { label: "Browse the zodiac signs", to: "/zodiac" },
    ],
  },
  {
    slug: "the-12-houses-of-astrology",
    title: "The 12 Houses of Astrology: A Beginner's Guide",
    excerpt:
      "If signs describe style and planets describe drives, houses describe the stage on which it all happens: twelve areas of everyday life.",
    category: "Astrology Basics",
    date: "2026-10-24",
    published: true,
    image: "/images/blog/twelve-houses.jpg",
    imageAlt: "Hands holding an open astrology book showing zodiac symbols",
    imageFocus: 45,
    intro: [
      "Open any birth chart and you will see the circle cut into twelve sections. Those are the houses. They are the part of astrology that connects symbolism to real life, because each house stands for a familiar area of experience: money, siblings, home, work, relationships.",
      "Here is each house in plain language, followed by a way to use them without getting lost.",
    ],
    sections: [
      {
        heading: "Houses 1 to 4: self and foundations",
        paragraphs: ["These houses are about you and where you come from."],
        bullets: [
          "1st house: the self, appearance and first impressions. Its starting point is the Ascendant.",
          "2nd house: money, possessions and what you value.",
          "3rd house: communication, siblings, short trips and early learning.",
          "4th house: home, family and roots.",
        ],
      },
      {
        heading: "Houses 5 to 8: expression and exchange",
        paragraphs: ["Here the focus moves outward, into creativity and shared life."],
        bullets: [
          "5th house: creativity, play, romance and children.",
          "6th house: daily work, routines and health habits.",
          "7th house: committed partnerships, in love and in business.",
          "8th house: shared resources, intimacy, loss and transformation.",
        ],
      },
      {
        heading: "Houses 9 to 12: meaning and the wider world",
        paragraphs: ["The last four houses are about perspective, public life and the inner life."],
        bullets: [
          "9th house: higher learning, travel, belief and philosophy.",
          "10th house: career, reputation and public role.",
          "11th house: friendships, groups and long-term hopes.",
          "12th house: solitude, rest, the subconscious and what happens behind the scenes.",
        ],
      },
      {
        heading: "How to read a house",
        paragraphs: [
          "Look at three things for each house. First, the sign on its edge (the cusp), which describes the style of that life area. Second, any planets inside it, which add activity. Third, the planet that rules the sign on the cusp, wherever it sits, which links that area to the rest of the chart.",
          "For example, an empty seventh house does not mean no relationships. It means the story of that area is told through the cusp sign and its ruler instead of through planets sitting inside.",
        ],
      },
      {
        heading: "House systems and birth time",
        paragraphs: [
          "Astrologers use several methods for dividing the chart into houses. Whole Sign houses are the oldest and simplest, giving each sign one house; others, such as Placidus, make houses of unequal size. A chart can look different depending on the system, so check which one your calculator uses.",
          "Because houses depend on the time of birth, an unverified birth time makes house readings less reliable than readings of the planets and signs.",
        ],
      },
    ],
    conclusion: [
      "The houses turn the symbolism of astrology into specific areas of life. Start with the houses that matter most to you right now, such as work or relationships, and read those first. As with every part of astrology, treat the result as a way to reflect on your life, not as a promise about it.",
    ],
    related: [
      { label: "See which houses your planets fall in", to: "/birth-chart" },
      { label: "Learn about each zodiac sign", to: "/zodiac" },
    ],
  },
  {
    slug: "mercury-retrograde-meaning-and-myths",
    title: "Mercury Retrograde: Meaning, Myths and Practical Guidance",
    excerpt:
      "Mercury never actually reverses. Here is what the apparent backward motion is, what astrologers read into it, and a calmer way to plan around it.",
    category: "Planetary Transits",
    date: "2026-10-24",
    published: true,
    image: "/images/blog/mercury-retrograde.jpg",
    imageAlt: "A telescope on a tripod under the Milky Way at night",
    imageFocus: 50,
    intro: [
      "Few astrological terms have escaped into everyday speech like “Mercury retrograde”. It is blamed for late trains, crashed laptops and awkward text messages. Underneath the jokes there is a real astronomical event and a long-standing interpretive tradition. It helps to keep the two apart.",
    ],
    sections: [
      {
        heading: "What is actually happening",
        paragraphs: [
          "Mercury orbits the Sun faster than the Earth does. A few times a year, as Earth and Mercury line up in their orbits, Mercury appears from our viewpoint to slow down, drift backwards against the background stars for a few weeks, then resume its forward path. This is an optical effect of perspective, like a faster car seeming to move backwards as you overtake it. The planet is not reversing.",
          "Mercury goes retrograde about three to four times a year. Exact dates are published in any astronomical almanac or ephemeris, so check a current one instead of relying on a blog post or a social media rumour.",
        ],
      },
      {
        heading: "What astrologers read into it",
        paragraphs: [
          "In astrology Mercury governs communication, thinking, short journeys and information. Traditional interpretation treats its retrograde phase as a time to review rather than to start: re-read, re-check, revise and reconnect, and to be careful with new contracts or big purchases.",
          "That is an interpretive framework, not an established scientific effect. There is no scientific evidence that Mercury's apparent motion causes communication failures or equipment breakdowns.",
        ],
      },
      {
        heading: "Common myths",
        paragraphs: ["Three claims come up again and again."],
        bullets: [
          "Myth: everything goes wrong. Most retrograde periods pass without disaster; things go wrong at other times too, and we notice them more when we are looking for a cause.",
          "Myth: you must not sign anything. Traditional advice is to read the details more carefully, not to freeze your life.",
          "Myth: Mercury literally moves backwards. It does not; the effect is a change of viewpoint.",
        ],
      },
      {
        heading: "Practical guidance, with or without astrology",
        paragraphs: [
          "Even if you read the retrograde as symbolic only, it works well as a scheduled reminder to tidy loose ends.",
        ],
        bullets: [
          "Back up your files and devices before the period starts.",
          "Confirm travel bookings and appointments a second time.",
          "Re-read emails and contracts before sending or signing.",
          "Use the weeks to finish and revise old projects, and reach out to people you have lost touch with.",
          "Leave a bit of extra time for journeys and plans.",
        ],
      },
      {
        heading: "Look at your own chart",
        paragraphs: [
          "Astrologers also look at which house Mercury is travelling through in your own chart, to see which area of life the review applies to. The same retrograde means something different for a person with it in the third house of communication than for someone with it in the tenth house of career.",
        ],
      },
    ],
    conclusion: [
      "Mercury retrograde is an optical illusion in the sky and a useful metaphor on the ground. Take the practical parts, like double-checking and revisiting, without worrying about it. And always verify dates with a current ephemeris.",
    ],
    related: [
      { label: "Find Mercury's house in your birth chart", to: "/birth-chart" },
      { label: "Read your daily horoscope", to: "/horoscopes" },
    ],
  },
];

/** Whitespace-separated words across all the readable text of an article. */
export const articleWordCount = (a: BlogArticle): number => {
  const text = [
    a.title,
    ...a.intro,
    ...a.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? [])]),
    ...a.conclusion,
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
};

/** Minutes to read at 200 words per minute, never less than one. */
export const articleReadMinutes = (a: BlogArticle): number => Math.max(1, Math.round(articleWordCount(a) / 200));

/** Published articles only, newest first (ties keep the order written above). */
export const getPublishedArticles = (): BlogArticle[] =>
  blogArticles
    .map((a, i) => ({ a, i }))
    .filter(({ a }) => a.published)
    .sort((x, y) => (x.a.date < y.a.date ? 1 : x.a.date > y.a.date ? -1 : x.i - y.i))
    .map(({ a }) => a);

export const getArticleBySlug = (slug: string | undefined): BlogArticle | undefined =>
  blogArticles.find((a) => a.published && a.slug === slug);

/** "24 Oct 2026" */
export const formatPostDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};
