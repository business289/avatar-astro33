// Seeds/updates the Temple collection from config/temples.json.
// Safe to re-run any time — upserts by slug, so editing a channelId in the
// JSON file and re-running this script updates the DB without duplicating
// records or touching any application code.
//
// Usage: npm run seed:temples   (from backend/)

import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Temple from '../models/Temple.js';
import temples from '../config/temples.json' with { type: 'json' };

dotenv.config();

// Opt-in only: some local/router DNS resolvers refuse SRV queries from
// Node's resolver (c-ares) even though the OS resolver handles them fine,
// which breaks mongodb+srv:// lookups with "querySrv ECONNREFUSED".
// Reproduced on this dev machine's network; not assumed to apply elsewhere,
// so it only activates when MONGODB_DNS_SERVERS is explicitly set.
if (process.env.MONGODB_DNS_SERVERS) {
  dns.setServers(process.env.MONGODB_DNS_SERVERS.split(',').map((s) => s.trim()));
}

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/astrology';
  await mongoose.connect(MONGODB_URI);
  console.log('✓ MongoDB connected');

  let upserted = 0;
  for (const t of temples) {
    await Temple.findOneAndUpdate(
      { slug: t.slug },
      { name: t.name, slug: t.slug, youtubeChannelId: t.youtubeChannelId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    upserted++;
  }

  console.log(`✓ Seeded/updated ${upserted} temples from config/temples.json`);
  const missingChannelId = temples.filter((t) => !t.youtubeChannelId).map((t) => t.slug);
  if (missingChannelId.length > 0) {
    console.log(`⚠ ${missingChannelId.length} temple(s) still need a real youtubeChannelId: ${missingChannelId.join(', ')}`);
    console.log('  Edit backend/src/config/temples.json and re-run this script.');
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
