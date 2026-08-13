/**
 * Seeds the Temple / TempleImage / Puja tables from the dummy data the public
 * Puja pages currently render (frontend/src/data/temples.ts).
 *
 * The data is copied rather than imported: the frontend is a separate package
 * with its own tsconfig, and this seed must keep working even if that file is
 * later rewritten to read from the API.
 *
 * Safe to re-run — temples are upserted by slug, pujas are replaced wholesale,
 * and images are only uploaded for temples that don't have any yet.
 *
 *   npm run db:seed:puja                 seed everything, uploading images
 *   npm run db:seed:puja -- --skip-images   rows only, no Cloudinary calls
 *   npm run db:seed:puja -- --reset         delete the seeded temples first
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../../prisma.js";

interface SeedPuja {
  name: string;
  price: number;
  duration: string;
  benefits: string[];
}

interface SeedTemple {
  slug: string;
  name: string;
  location: string;
  state: string;
  deity: string;
  description: string;
  priceFrom: number;
  gradient: string;
  /** Filename under frontend/public/images/temples/ */
  image?: string;
  pujas: SeedPuja[];
}

const temples: SeedTemple[] = [
  {
    slug: "tirupati-balaji",
    name: "Tirupati Balaji",
    location: "Tirumala, Tirupati",
    state: "Andhra Pradesh",
    deity: "Lord Venkateswara",
    description:
      "One of the world's most visited religious sites, perched atop the sacred Tirumala hills.",
    priceFrom: 116,
    gradient: "linear-gradient(135deg, #2D1B69 0%, #6B3FA0 50%, #BC6A4D 100%)",
    image: "tirupati-balaji.png",
    pujas: [
      {
        name: "Suprabhatam Seva",
        price: 300,
        duration: "30 min",
        benefits: [
          "Divine awakening blessings",
          "Morning darshan priority",
          "Spiritual energy renewal",
          "Ancestral peace",
        ],
      },
      {
        name: "Abhishekam",
        price: 750,
        duration: "45 min",
        benefits: [
          "Purification of soul",
          "Health & longevity",
          "Removal of past karma",
          "Divine grace",
        ],
      },
      {
        name: "Sahasra Deepalankara Seva",
        price: 1200,
        duration: "1 hr",
        benefits: [
          "Illumination of consciousness",
          "Prosperity & wealth",
          "Marital harmony",
          "Family blessings",
        ],
      },
    ],
  },
  {
    slug: "kashi-vishwanath",
    name: "Kashi Vishwanath",
    location: "Varanasi",
    state: "Uttar Pradesh",
    deity: "Lord Shiva",
    description:
      "The most sacred Shiva temple, situated on the western bank of the holy Ganges river.",
    priceFrom: 116,
    gradient: "linear-gradient(135deg, #1A1A2E 0%, #4A2C6A 50%, #7B3D8A 100%)",
    image: "kashi-vishwanath.png",
    pujas: [
      {
        name: "Rudrabhishek",
        price: 501,
        duration: "45 min",
        benefits: [
          "Removal of negativity",
          "Protection from evil",
          "Health restoration",
          "Moksha blessings",
        ],
      },
      {
        name: "Ganga Aarti Participation",
        price: 251,
        duration: "1 hr",
        benefits: [
          "Spiritual upliftment",
          "Liberation of ancestors",
          "Inner peace",
          "Cosmic alignment",
        ],
      },
      {
        name: "Laghu Rudrabhishek",
        price: 1100,
        duration: "2 hrs",
        benefits: [
          "Complete Shiva blessings",
          "Marriage harmony",
          "Business success",
          "Longevity",
        ],
      },
    ],
  },
  {
    slug: "shirdi-sai-baba",
    name: "Shirdi Sai Baba",
    location: "Shirdi",
    state: "Maharashtra",
    deity: "Sai Baba",
    description:
      "The revered abode of Sai Baba, drawing millions seeking miracles and divine grace.",
    priceFrom: 50,
    gradient: "linear-gradient(135deg, #1B3A4B 0%, #2D6A4F 50%, #52B788 100%)",
    image: "shirdi-sai-baba.png",
    pujas: [
      {
        name: "Kakad Aarti",
        price: 200,
        duration: "30 min",
        benefits: [
          "Early morning divine blessings",
          "Positive start to day",
          "Protection",
          "Mental clarity",
        ],
      },
      {
        name: "Shej Aarti",
        price: 300,
        duration: "40 min",
        benefits: [
          "Evening divine grace",
          "Peace before sleep",
          "Dreams & visions",
          "Family wellbeing",
        ],
      },
      {
        name: "Satcharitra Parayan",
        price: 551,
        duration: "2 hrs",
        benefits: [
          "Life transformation",
          "Faith strengthening",
          "Miraculous solutions",
          "Wish fulfillment",
        ],
      },
    ],
  },
  {
    slug: "golden-temple",
    name: "Golden Temple",
    location: "Amritsar",
    state: "Punjab",
    deity: "Waheguru",
    description:
      "The holiest Sikh shrine, Harmandir Sahib, glistening in gold amid the sacred Amrit Sarovar.",
    priceFrom: 51,
    gradient: "linear-gradient(135deg, #7D4A00 0%, #C9840A 50%, #F0D060 100%)",
    image: "golden-temple.png",
    pujas: [
      {
        name: "Amrit Sanchar",
        price: 501,
        duration: "2 hrs",
        benefits: [
          "Spiritual initiation",
          "Divine connection",
          "Community bond",
          "Inner transformation",
        ],
      },
      {
        name: "Ardas",
        price: 151,
        duration: "20 min",
        benefits: [
          "Divine petition",
          "Collective prayer power",
          "Protection",
          "Gratitude offering",
        ],
      },
    ],
  },
  {
    slug: "vaishno-devi",
    name: "Vaishno Devi",
    location: "Katra, Reasi",
    state: "Jammu & Kashmir",
    deity: "Mata Vaishno Devi",
    description:
      "A sacred cave shrine in the Trikuta Mountains, the abode of the divine Mother Goddess.",
    priceFrom: 116,
    gradient: "linear-gradient(135deg, #3D0C02 0%, #8B1A1A 50%, #C0392B 100%)",
    image: "vaishno-devi.png",
    pujas: [
      {
        name: "Charan Amrit",
        price: 251,
        duration: "30 min",
        benefits: [
          "Mother's divine blessings",
          "Purification of past sins",
          "Protection on journey",
          "Wish fulfillment",
        ],
      },
      {
        name: "Navratri Puja",
        price: 1001,
        duration: "3 hrs",
        benefits: [
          "Nine forms of Durga blessings",
          "Business prosperity",
          "Victory over enemies",
          "Spiritual power",
        ],
      },
    ],
  },
  {
    slug: "somnath-temple",
    name: "Somnath Temple",
    location: "Prabhas Patan, Veraval",
    state: "Gujarat",
    deity: "Lord Shiva (Jyotirlinga)",
    description:
      "The first and foremost Jyotirlinga, standing as an eternal symbol of faith on Gujarat's coast.",
    priceFrom: 116,
    gradient: "linear-gradient(135deg, #0D3348 0%, #1A6A8A 50%, #2AAABF 100%)",
    image: "somnath-temple.png",
    pujas: [
      {
        name: "Jyotirlinga Abhishek",
        price: 1116,
        duration: "1 hr",
        benefits: [
          "Supreme Shiva blessings",
          "Liberation from birth cycle",
          "Protection from all evils",
          "Cosmic consciousness",
        ],
      },
      {
        name: "Sandhya Aarti",
        price: 501,
        duration: "45 min",
        benefits: [
          "Evening divine grace",
          "Ocean blessings",
          "Ancestral liberation",
          "Inner cleansing",
        ],
      },
    ],
  },
  {
    slug: "jagannath-puri",
    name: "Jagannath Temple",
    location: "Puri",
    state: "Odisha",
    deity: "Lord Jagannath",
    description:
      "One of the Char Dhams, home to the world-famous Rath Yatra chariot festival each year.",
    priceFrom: 116,
    gradient: "linear-gradient(135deg, #1A0033 0%, #4B0082 50%, #8B008B 100%)",
    image: "jagannath-puri.png",
    pujas: [
      {
        name: "Mahaprasad Seva",
        price: 301,
        duration: "30 min",
        benefits: [
          "Sacred food blessed by Lord",
          "Moksha guarantee",
          "All sins forgiven",
          "Divine nourishment",
        ],
      },
      {
        name: "Rath Yatra Darshan",
        price: 1001,
        duration: "2 hrs",
        benefits: [
          "Char Dham completion equivalent",
          "Rare divine vision",
          "Complete liberation",
          "Cosmic celebration",
        ],
      },
    ],
  },
  {
    slug: "siddhivinayak",
    name: "Siddhivinayak Temple",
    location: "Prabhadevi, Mumbai",
    state: "Maharashtra",
    deity: "Lord Ganesha",
    description:
      "Mumbai's most celebrated Ganesha temple, granting success and removing obstacles for devotees.",
    priceFrom: 125,
    gradient: "linear-gradient(135deg, #1A2A00 0%, #3D6B00 50%, #5C9E00 100%)",
    image: "siddhivinayak.png",
    pujas: [
      {
        name: "Ganesh Puja",
        price: 501,
        duration: "45 min",
        benefits: [
          "Obstacle removal",
          "New beginnings",
          "Success in ventures",
          "Intellect enhancement",
        ],
      },
      {
        name: "Modak Naivedya",
        price: 251,
        duration: "20 min",
        benefits: [
          "Ganesha's sweet blessings",
          "Joy & celebration",
          "Family harmony",
          "Academic success",
        ],
      },
    ],
  },
  {
    slug: "mahakaleshwar",
    name: "Mahakaleshwar",
    location: "Ujjain",
    state: "Madhya Pradesh",
    deity: "Lord Shiva (Mahakal)",
    description:
      "The only south-facing Jyotirlinga, where Bhasma Aarti with sacred ash is performed daily at dawn.",
    priceFrom: 250,
    gradient: "linear-gradient(135deg, #0A0A0A 0%, #2D2D2D 50%, #4A3000 100%)",
    image: "mahakaleshwar.png",
    pujas: [
      {
        name: "Bhasma Aarti",
        price: 750,
        duration: "1 hr",
        benefits: [
          "Rare cosmic blessing at dawn",
          "Victory over death",
          "Supreme Shiva grace",
          "Enlightenment",
        ],
      },
      {
        name: "Shiva Abhishek",
        price: 500,
        duration: "45 min",
        benefits: [
          "Time blessing (Mahakal)",
          "Protection from Kaal Sarpa",
          "Eternal peace",
          "Longevity",
        ],
      },
    ],
  },
  {
    slug: "iskcon-vrindavan",
    name: "ISKCON Vrindavan",
    location: "Vrindavan",
    state: "Uttar Pradesh",
    deity: "Lord Krishna & Radha",
    description:
      "The grand ISKCON temple in Krishna's birthplace, a beacon of Vaishnava devotion worldwide.",
    priceFrom: 116,
    gradient: "linear-gradient(135deg, #00264D 0%, #0052A3 50%, #1A8CFF 100%)",
    image: "iskcon-vrindavan.png",
    pujas: [
      {
        name: "Tulsi Puja",
        price: 251,
        duration: "20 min",
        benefits: [
          "Purification of home",
          "Devotion to Krishna",
          "Health protection",
          "Spiritual merit",
        ],
      },
      {
        name: "Radha Krishna Abhishek",
        price: 1001,
        duration: "1 hr",
        benefits: [
          "Divine love blessings",
          "Relationship harmony",
          "Artistic talents",
          "Joy & devotion",
        ],
      },
      {
        name: "Maha Aarti",
        price: 501,
        duration: "45 min",
        benefits: [
          "Evening Krishna blessings",
          "Bhakti intensification",
          "Karmic cleansing",
          "Divine music grace",
        ],
      },
    ],
  },
];

// ── Setup ───────────────────────────────────────────────────────────────────

const args = new Set(process.argv.slice(2));
const skipImages = args.has("--skip-images");
const reset = args.has("--reset");

const here = path.dirname(fileURLToPath(import.meta.url));
// backend/prisma/seeds → repo root → frontend/public/images/temples
const IMAGES_DIR = path.resolve(
  here,
  "../../../frontend/public/images/temples",
);

const CLOUDINARY_ROOT_FOLDER = "puja/temples";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

function uploadBuffer(
  buffer: Buffer,
  folder: string,
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload returned no result"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

// ── Seed ────────────────────────────────────────────────────────────────────

async function main() {
  const slugs = temples.map((t) => t.slug);

  if (reset) {
    // Cascades clear the pujas and image rows; Cloudinary assets are left in
    // place because the seed cannot tell them apart from manual uploads.
    const { count } = await prisma.temple.deleteMany({
      where: { slug: { in: slugs } },
    });
    console.log(`✓ Reset: removed ${count} previously seeded temple(s)`);
  }

  let created = 0;
  let updated = 0;
  let uploaded = 0;
  const imageFailures: string[] = [];

  for (const seed of temples) {
    const existing = await prisma.temple.findUnique({
      where: { slug: seed.slug },
      select: { id: true, _count: { select: { images: true } } },
    });

    const data = {
      name: seed.name,
      location: seed.location,
      state: seed.state,
      deity: seed.deity,
      description: seed.description,
      priceFrom: seed.priceFrom,
      gradient: seed.gradient,
    };

    const temple = await prisma.temple.upsert({
      where: { slug: seed.slug },
      update: data,
      create: { slug: seed.slug, ...data },
      select: { id: true, name: true },
    });

    if (existing) updated += 1;
    else created += 1;

    // Pujas have no natural key, so they are replaced rather than matched —
    // this keeps a re-run from stacking duplicates.
    await prisma.puja.deleteMany({ where: { templeId: temple.id } });
    await prisma.puja.createMany({
      data: seed.pujas.map((puja) => ({
        templeId: temple.id,
        name: puja.name,
        price: puja.price,
        duration: puja.duration,
        benefits: puja.benefits,
      })),
    });

    console.log(
      `${existing ? "↻" : "+"} ${temple.name} (${seed.pujas.length} puja(s))`,
    );

    // ── Image ──
    if (skipImages || !seed.image) continue;

    if (!cloudinaryConfigured) {
      imageFailures.push(`${seed.slug}: Cloudinary env vars not set`);
      continue;
    }

    // Already has images — leave them alone so re-runs don't duplicate or
    // clobber anything an admin uploaded through the panel.
    if (existing && existing._count.images > 0) {
      console.log(`    images: skipped (${existing._count.images} already present)`);
      continue;
    }

    const filePath = path.join(IMAGES_DIR, seed.image);
    let buffer: Buffer;
    try {
      buffer = await fs.readFile(filePath);
    } catch {
      imageFailures.push(`${seed.slug}: file not found at ${filePath}`);
      continue;
    }

    try {
      const asset = await uploadBuffer(
        buffer,
        `${CLOUDINARY_ROOT_FOLDER}/${seed.slug}`,
      );
      await prisma.templeImage.create({
        data: {
          templeId: temple.id,
          url: asset.url,
          publicId: asset.publicId,
        },
      });
      uploaded += 1;
      console.log(`    images: uploaded ${seed.image}`);
    } catch (error: any) {
      const code = error?.http_code ? ` (HTTP ${error.http_code})` : "";
      imageFailures.push(
        `${seed.slug}: ${error?.message ?? "upload failed"}${code}`,
      );
    }
  }

  console.log(
    `\n✓ Temples: ${created} created, ${updated} updated · images uploaded: ${uploaded}`,
  );

  if (imageFailures.length) {
    console.warn(
      `\n⚠ ${imageFailures.length} image(s) were not uploaded — temple and puja rows were still saved:`,
    );
    imageFailures.forEach((line) => console.warn(`  · ${line}`));
    console.warn(
      "\n  If these are 403s, the Cloudinary API key is missing the 'create'\n" +
        "  permission. Fix that, then re-run this seed to fill in the images.",
    );
  }
}

main()
  .catch((e) => {
    console.error("Puja temple seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
