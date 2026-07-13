// ── Types ──────────────────────────────────────────────────────────────────────
export type StreamCategory =
  | 'Jyotirlinga'
  | 'Shakti Peeth'
  | 'Ganesh Temple'
  | 'Sai Temple'
  | 'ISKCON'
  | 'South Indian';

export interface LiveTemple {
  id: string;
  slug: string;
  name: string;
  deity: string;
  city: string;
  state: string;
  category: StreamCategory;
  description: string;
  viewers: number;
  isLive: boolean;
  gradient: string;
  image?: string;
  darshanTimings: string;
  aartTimings: string[];
  website: string;
  youtubeChannelName: string;
  youtubeVideoId: string; // placeholder — swap with real embed IDs when partnered
}

export interface FamilyEvent {
  id: string;
  slug: string;
  title: string;
  family: string;
  type: 'Wedding' | 'Puja' | 'Naming Ceremony' | 'Birthday' | 'Anniversary' | 'Satyanarayan';
  city: string;
  viewers: number;
  isLive: boolean;
  scheduledAt?: string;
  gradient: string;
  isPrivate: boolean;
  description: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  isToday: boolean;
  category: 'darshan' | 'family';
  temple?: string;
}

export interface PrayerMessage {
  id: string;
  emoji: string;
  message: string;
  from: string;
  city: string;
  time: string;
}

// ── Temple data ────────────────────────────────────────────────────────────────
export const liveTemples: LiveTemple[] = [
  {
    id: 'siddhivinayak',
    slug: 'siddhivinayak',
    name: 'Siddhivinayak Temple',
    deity: 'Lord Ganesha',
    city: 'Mumbai',
    state: 'Maharashtra',
    category: 'Ganesh Temple',
    description: 'Shree Siddhivinayak Ganapati Mandir in Prabhadevi, Mumbai is one of the most revered Ganesha temples in India. Visited by over 25,000 devotees daily, it is believed Lord Siddhivinayak fulfils all wishes of his devotees who pray with a pure heart.',
    viewers: 12480,
    isLive: true,
    gradient: 'linear-gradient(135deg, #E8A458 0%, #D4844A 60%, #C47030 100%)',
    image: 'siddhivinayak.jpg',
    darshanTimings: '5:30 AM – 9:50 PM',
    aartTimings: [
      '5:30 AM – Kakad Aarti',
      '12:00 PM – Madhyan Aarti',
      '8:30 PM – Shej Aarti',
    ],
    website: 'https://www.siddhivinayak.org',
    youtubeChannelName: 'Siddhivinayak Temple Official',
    youtubeVideoId: 'kS5tPj8XJcI',
  },
  {
    id: 'kashi-vishwanath',
    slug: 'kashi-vishwanath',
    name: 'Kashi Vishwanath',
    deity: 'Lord Shiva',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    category: 'Jyotirlinga',
    description: 'The sacred Kashi Vishwanath Temple stands on the western bank of the holy Ganga in Varanasi. One of the twelve Jyotirlingas, it is believed that a darshan here grants Moksha — liberation from the cycle of birth and death.',
    viewers: 24630,
    isLive: true,
    gradient: 'linear-gradient(135deg, #7B5EA7 0%, #9B7EC8 50%, #6A4E9A 100%)',
    image: 'kashi.jpg',
    darshanTimings: '3:00 AM – 11:00 PM',
    aartTimings: [
      '3:00 AM – Mangala Aarti',
      '7:00 AM – Bhog Aarti',
      '12:00 PM – Madhyan Aarti',
      '7:00 PM – Sandhya Aarti',
      '9:00 PM – Shrigang Aarti',
      '10:30 PM – Shayan Aarti',
    ],
    website: 'https://shrikashivishwanath.org',
    youtubeChannelName: 'Kashi Vishwanath Temple',
    youtubeVideoId: 'kS5tPj8XJcI',
  },
  {
    id: 'tirupati-balaji',
    slug: 'tirupati-balaji',
    name: 'Tirupati Balaji',
    deity: 'Lord Venkateswara',
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    category: 'South Indian',
    description: 'Shri Venkateswara Swami Temple atop the seven hills of Tirumala is the most visited religious site in the world. Lord Venkateswara, the Lord of Seven Hills, is believed to fulfil all the wishes of devotees who seek his grace.',
    viewers: 41200,
    isLive: true,
    gradient: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 50%, #1B4332 100%)',
    image: 'tirupati.jpg',
    darshanTimings: '6:00 AM – 9:00 PM',
    aartTimings: [
      '3:00 AM – Thiruvanandal',
      '6:00 AM – Viswaroopa Darshanam',
      '8:00 AM – Tomala Seva',
      '1:00 PM – Arjita Brahmotsavam',
      '6:00 PM – Dolotsavam',
      '9:00 PM – Ekantha Seva',
    ],
    website: 'https://tirumala.org',
    youtubeChannelName: 'SVBC TTD',
    youtubeVideoId: 'kS5tPj8XJcI',
  },
  {
    id: 'shirdi-sai-baba',
    slug: 'shirdi-sai-baba',
    name: 'Shirdi Sai Baba',
    deity: 'Sai Baba',
    city: 'Shirdi',
    state: 'Maharashtra',
    category: 'Sai Temple',
    description: 'The Sai Baba Temple in Shirdi is one of the most visited pilgrimage sites in India. Sai Baba of Shirdi taught love, forgiveness and helping others. Devotees believe that sincere faith here manifests miracles in one\'s life.',
    viewers: 18750,
    isLive: true,
    gradient: 'linear-gradient(135deg, #C9A84C 0%, #E8C86C 50%, #B8943C 100%)',
    image: 'shirdi.jpg',
    darshanTimings: '4:00 AM – 11:30 PM',
    aartTimings: [
      '4:30 AM – Kakad Aarti',
      '12:00 PM – Madhyan Aarti',
      '6:00 PM – Dhoop Aarti',
      '9:00 PM – Shej Aarti',
    ],
    website: 'https://www.shrisaibabasansthan.org',
    youtubeChannelName: 'Shri Saibaba Sansthan Trust',
    youtubeVideoId: 'kS5tPj8XJcI',
  },
  {
    id: 'mahakaleshwar',
    slug: 'mahakaleshwar',
    name: 'Mahakaleshwar',
    deity: 'Lord Shiva',
    city: 'Ujjain',
    state: 'Madhya Pradesh',
    category: 'Jyotirlinga',
    description: 'The Mahakaleshwar Jyotirlinga in Ujjain is the only south-facing Jyotirlinga in the world. The Bhasma Aarti performed with sacred ash at 4 AM is a unique and awe-inspiring ritual found nowhere else.',
    viewers: 8940,
    isLive: true,
    gradient: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #6B3410 100%)',
    image: 'mahakaleshwar.jpg',
    darshanTimings: '4:00 AM – 11:00 PM',
    aartTimings: [
      '4:00 AM – Bhasma Aarti',
      '7:00 AM – Naivedya',
      '10:30 AM – Mahabhog',
      '5:00 PM – Sandhya Aarti',
      '10:30 PM – Shayan Bhog',
    ],
    website: 'https://mahakaleshwar.nic.in',
    youtubeChannelName: 'Mahakaleshwar Temple',
    youtubeVideoId: 'kS5tPj8XJcI',
  },
  {
    id: 'vaishno-devi',
    slug: 'vaishno-devi',
    name: 'Vaishno Devi',
    deity: 'Mata Vaishno Devi',
    city: 'Katra',
    state: 'Jammu & Kashmir',
    category: 'Shakti Peeth',
    description: 'Nestled in the Trikuta Mountains, the Vaishno Devi Temple is one of India\'s most sacred Shakti shrines. Mata Vaishno Devi is believed to call her devotees when they are spiritually ready for her darshan.',
    viewers: 15320,
    isLive: false,
    gradient: 'linear-gradient(135deg, #C0392B 0%, #E74C3C 50%, #922B21 100%)',
    image: 'vaishno.jpg',
    darshanTimings: '5:00 AM – 9:00 PM',
    aartTimings: [
      '5:00 AM – Pratah Aarti',
      '12:00 PM – Madhyan Aarti',
      '8:00 PM – Sandhya Aarti',
    ],
    website: 'https://www.maavaishnodevi.org',
    youtubeChannelName: 'Shri Mata Vaishno Devi Shrine Board',
    youtubeVideoId: 'kS5tPj8XJcI',
  },
  {
    id: 'iskcon-vrindavan',
    slug: 'iskcon-vrindavan',
    name: 'ISKCON Vrindavan',
    deity: 'Radha Krishna',
    city: 'Vrindavan',
    state: 'Uttar Pradesh',
    category: 'ISKCON',
    description: 'The Krishna Balaram Mandir in Vrindavan is a magnificent temple of the International Society for Krishna Consciousness. Daily kirtan, aarti, and Bhagavad Gita discourses draw devotees from around the world to this divine abode.',
    viewers: 9870,
    isLive: true,
    gradient: 'linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #0D47A1 100%)',
    image: 'iskcon.jpg',
    darshanTimings: '4:30 AM – 9:00 PM',
    aartTimings: [
      '4:30 AM – Mangal Aarti',
      '7:30 AM – Dhupa Aarti',
      '12:00 PM – Raj Bhoga Aarti',
      '4:00 PM – Utthapan',
      '6:30 PM – Sandhya Aarti',
      '8:30 PM – Shayan Aarti',
    ],
    website: 'https://iskconvrindavan.com',
    youtubeChannelName: 'ISKCON Desire Tree',
    youtubeVideoId: 'kS5tPj8XJcI',
  },
  {
    id: 'somnath',
    slug: 'somnath',
    name: 'Somnath Temple',
    deity: 'Lord Shiva',
    city: 'Somnath',
    state: 'Gujarat',
    category: 'Jyotirlinga',
    description: 'The Somnath Temple, built on the shores of the Arabian Sea, is the first among the twelve Jyotirlingas of Lord Shiva. Rebuilt seven times after repeated destruction, it stands as a testament to eternal faith and devotion.',
    viewers: 7650,
    isLive: false,
    gradient: 'linear-gradient(135deg, #1A6B8A 0%, #2196A8 50%, #145A74 100%)',
    image: 'somnath.jpg',
    darshanTimings: '6:00 AM – 9:30 PM',
    aartTimings: [
      '7:00 AM – Pratah Aarti',
      '12:00 PM – Madhyan Aarti',
      '7:00 PM – Sandhya Aarti',
    ],
    website: 'https://somnath.org',
    youtubeChannelName: 'Somnath Temple Trust',
    youtubeVideoId: 'kS5tPj8XJcI',
  },
  {
    id: 'jagannath-puri',
    slug: 'jagannath-puri',
    name: 'Jagannath Puri',
    deity: 'Lord Jagannath',
    city: 'Puri',
    state: 'Odisha',
    category: 'South Indian',
    description: 'The Jagannath Temple in Puri is one of the four sacred Char Dhams. Lord Jagannath, a form of Lord Vishnu, resides here with siblings Balabhadra and Subhadra. The famous annual Rath Yatra draws millions of devotees worldwide.',
    viewers: 11430,
    isLive: true,
    gradient: 'linear-gradient(135deg, #E67E22 0%, #F39C12 50%, #D35400 100%)',
    image: 'jagannath.jpg',
    darshanTimings: '5:00 AM – 12:00 AM',
    aartTimings: [
      '5:00 AM – Mangal Alati',
      '6:00 AM – Mailam',
      '10:00 AM – Ballav Dhupa',
      '1:00 PM – Madhyan Dhupa',
      '7:00 PM – Sandhya Dhupa',
      '9:00 PM – Chandanlagi',
    ],
    website: 'https://jagannath.nic.in',
    youtubeChannelName: 'Jagannath Temple Puri Official',
    youtubeVideoId: 'kS5tPj8XJcI',
  },
];

// ── Family events ──────────────────────────────────────────────────────────────
export const familyEvents: FamilyEvent[] = [
  {
    id: 'sharma-wedding',
    slug: 'sharma-wedding',
    title: 'Priya & Rahul Wedding',
    family: 'Sharma Family',
    type: 'Wedding',
    city: 'Jaipur',
    viewers: 340,
    isLive: true,
    gradient: 'linear-gradient(135deg, #E91E8C 0%, #F06292 50%, #C2185B 100%)',
    isPrivate: false,
    description: 'A grand traditional Rajasthani wedding ceremony with full rituals.',
  },
  {
    id: 'gupta-satyanarayan',
    slug: 'gupta-satyanarayan',
    title: 'Satyanarayan Puja',
    family: 'Gupta Family',
    type: 'Satyanarayan',
    city: 'Delhi',
    viewers: 87,
    isLive: true,
    gradient: 'linear-gradient(135deg, #C9A84C 0%, #E8C86C 50%, #B8943C 100%)',
    isPrivate: true,
    description: 'Auspicious Satyanarayan Katha and puja performed by family pandit.',
  },
  {
    id: 'patel-naming',
    slug: 'patel-naming',
    title: 'Naamkaran Ceremony',
    family: 'Patel Family',
    type: 'Naming Ceremony',
    city: 'Ahmedabad',
    viewers: 124,
    isLive: false,
    scheduledAt: 'Today, 11:00 AM',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 50%, #388E3C 100%)',
    isPrivate: false,
    description: 'Naming ceremony for the newborn with traditional rituals and blessings.',
  },
  {
    id: 'singh-anniversary',
    slug: 'singh-anniversary',
    title: '25th Anniversary Puja',
    family: 'Singh Family',
    type: 'Anniversary',
    city: 'Chandigarh',
    viewers: 56,
    isLive: false,
    scheduledAt: 'Tomorrow, 6:00 PM',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 50%, #7B1FA2 100%)',
    isPrivate: true,
    description: 'Silver jubilee anniversary celebration with Ganesh puja and family gathering.',
  },
];

// ── Upcoming events ────────────────────────────────────────────────────────────
export const upcomingEvents: UpcomingEvent[] = [
  { id: 'upc-1', title: 'Mahakaleshwar Bhasma Aarti',   subtitle: 'Mahakaleshwar Temple · Ujjain',       time: '4:00 AM',    isToday: true,  category: 'darshan' },
  { id: 'upc-2', title: 'Siddhivinayak Kakad Aarti',    subtitle: 'Siddhivinayak Temple · Mumbai',       time: '5:30 AM',    isToday: true,  category: 'darshan' },
  { id: 'upc-3', title: 'Naamkaran Ceremony',           subtitle: 'Patel Family · Ahmedabad',            time: '11:00 AM',   isToday: true,  category: 'family'  },
  { id: 'upc-4', title: 'Kashi Vishwanath Sandhya Aarti', subtitle: 'Kashi Vishwanath · Varanasi',      time: '7:00 PM',    isToday: true,  category: 'darshan' },
  { id: 'upc-5', title: 'Sharma Family Wedding',         subtitle: 'Sharma Family · Jaipur',             time: '8:00 PM',    isToday: true,  category: 'family'  },
  { id: 'upc-6', title: 'Rudrabhishek Puja',            subtitle: 'Somnath Temple · Gujarat',            time: 'Tomorrow',   isToday: false, category: 'darshan' },
  { id: 'upc-7', title: 'Singh Anniversary Puja',       subtitle: 'Singh Family · Chandigarh',           time: 'Tomorrow',   isToday: false, category: 'family'  },
];

// ── Sample prayer wall ─────────────────────────────────────────────────────────
export const samplePrayers: PrayerMessage[] = [
  { id: 'p1', emoji: '🙏', message: 'Please bless my family with health and happiness.', from: 'Priya Sharma', city: 'Delhi', time: '2 min ago' },
  { id: 'p2', emoji: '🕉️', message: 'Thank you Lord Ganesha for your blessings. We are forever grateful.', from: 'Rajesh Patel', city: 'Ahmedabad', time: '5 min ago' },
  { id: 'p3', emoji: '🌸', message: 'Seeking peace and prosperity for my entire family.', from: 'Ananya Iyer', city: 'Chennai', time: '8 min ago' },
  { id: 'p4', emoji: '✨', message: 'Baba, please guide me on the right path. I trust in you.', from: 'Mohan Singh', city: 'Chandigarh', time: '12 min ago' },
  { id: 'p5', emoji: '🪔', message: 'May the divine light always illuminate our lives.', from: 'Sunita Joshi', city: 'Pune', time: '15 min ago' },
  { id: 'p6', emoji: '🌺', message: 'Praying for my son\'s good health and success in exams.', from: 'Kavitha Reddy', city: 'Hyderabad', time: '18 min ago' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
export const formatViewers = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

export const streamCategories: StreamCategory[] = [
  'Jyotirlinga',
  'Shakti Peeth',
  'Ganesh Temple',
  'Sai Temple',
  'ISKCON',
  'South Indian',
];
