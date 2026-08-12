/**
 * Seeds shop categories and products from the same demo catalog the
 * customer-facing Shop pages currently render statically
 * (frontend/src/data/products.ts).
 *
 * The data is copied rather than imported: the frontend is a separate
 * package with its own tsconfig, and this seed must keep working even after
 * the frontend is later switched to read from the API.
 *
 * Safe to re-run — categories are matched by slug, products by slug, and
 * both are upserted in place rather than duplicated.
 *
 *   npm run db:seed:shop
 */

import "dotenv/config";
import prisma from "../../prisma.js";

interface SeedProduct {
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  benefits: string[];
  authenticity: string;
  gradient: string;
}

interface SeedCategory {
  name: string;
  slug: string;
  products: SeedProduct[];
}

const CATEGORIES: SeedCategory[] = [
  {
    name: "Gemstones",
    slug: "gemstones",
    products: [
      {
        slug: "blue-sapphire",
        name: "Blue Sapphire (Neelam)",
        price: 4999,
        originalPrice: 6999,
        description:
          "Natural Ceylon Blue Sapphire, energized with Vedic rituals for Saturn's blessings.",
        benefits: [
          "Career advancement",
          "Discipline & focus",
          "Saturn's divine grace",
          "Protection from negativity",
        ],
        authenticity: "GIA Certified · Untreated · Sri Lanka Origin",
        gradient: "linear-gradient(135deg, #0A0A2E 0%, #1A1A6E 50%, #4444CC 100%)",
      },
      {
        slug: "yellow-sapphire",
        name: "Yellow Sapphire (Pukhraj)",
        price: 3499,
        originalPrice: 4999,
        description:
          "Authentic Yellow Sapphire from Madagascar, blessed by Jupiter for wisdom and prosperity.",
        benefits: [
          "Wisdom & knowledge",
          "Marriage prospects",
          "Financial growth",
          "Jupiter blessings",
        ],
        authenticity: "Gemological Certified · Natural · Madagascar Origin",
        gradient: "linear-gradient(135deg, #3D2A00 0%, #8B6500 50%, #D4A017 100%)",
      },
      {
        slug: "emerald",
        name: "Colombian Emerald (Panna)",
        price: 5499,
        description:
          "Premium Colombian Emerald for Mercury's blessings, enhancing intelligence and communication.",
        benefits: [
          "Intelligence boost",
          "Business success",
          "Communication skills",
          "Mercury harmony",
        ],
        authenticity: "AGL Certified · Colombian Origin · Natural",
        gradient: "linear-gradient(135deg, #003300 0%, #006600 50%, #00AA44 100%)",
      },
      {
        slug: "red-coral",
        name: "Red Coral (Moonga)",
        price: 2199,
        description:
          "Italian Red Coral for Mars energy, boosting courage and physical vitality.",
        benefits: [
          "Courage & strength",
          "Health vitality",
          "Mars blessings",
          "Leadership qualities",
        ],
        authenticity: "IGI Certified · Italian Mediterranean · Natural",
        gradient: "linear-gradient(135deg, #4D0000 0%, #990000 50%, #CC3333 100%)",
      },
    ],
  },
  {
    name: "Bracelets",
    slug: "bracelets",
    products: [
      {
        slug: "rudraksha-gold-bracelet",
        name: "Rudraksha Gold Bracelet",
        price: 1299,
        description:
          "5-mukhi Rudraksha beads set in 18K gold plating, energized at Kashi Vishwanath.",
        benefits: [
          "Health & wellbeing",
          "Shiva blessings",
          "Mental peace",
          "Aura purification",
        ],
        authenticity: "Authentic Nepal Rudraksha · 18K Gold Plated · Temple Energized",
        gradient: "linear-gradient(135deg, #2D1B00 0%, #6B4400 50%, #BC8A2D 100%)",
      },
      {
        slug: "crystal-healing-bracelet",
        name: "7-Chakra Crystal Bracelet",
        price: 799,
        description:
          "Seven authentic crystals aligned to chakras — amethyst, carnelian, citrine, and more.",
        benefits: [
          "Chakra alignment",
          "Energy balance",
          "Emotional healing",
          "Spiritual awareness",
        ],
        authenticity: "Natural Crystals · Reiki Energized · Handcrafted",
        gradient: "linear-gradient(135deg, #1A0033 0%, #6600CC 50%, #CC4499 100%)",
      },
      {
        slug: "tiger-eye-bracelet",
        name: "Tiger Eye Bracelet",
        price: 649,
        description:
          "Natural Tiger Eye stones for confidence, protection, and grounding energy.",
        benefits: [
          "Confidence boost",
          "Protection shield",
          "Grounding energy",
          "Focus enhancement",
        ],
        authenticity: "Natural Tiger Eye · South Africa Origin · Handcrafted",
        gradient: "linear-gradient(135deg, #2D1B00 0%, #8B5E00 50%, #C8901A 100%)",
      },
    ],
  },
  {
    name: "Rudraksha",
    slug: "rudraksha",
    products: [
      {
        slug: "panchmukhi-rudraksha",
        name: "Panchmukhi Rudraksha Mala",
        price: 1999,
        originalPrice: 2999,
        description:
          "108+1 beads of 5-Mukhi Rudraksha from Nepal, strung in red silk thread.",
        benefits: [
          "Peace of mind",
          "Blood pressure control",
          "Shiva's constant grace",
          "All-round protection",
        ],
        authenticity: "Nepal Origin · Pandit Verified · 5-Mukhi Certified",
        gradient: "linear-gradient(135deg, #3D1A00 0%, #8B3A00 50%, #D45500 100%)",
      },
      {
        slug: "gauri-shankar-rudraksha",
        name: "Gauri Shankar Rudraksha",
        price: 3499,
        description:
          "Two naturally joined Rudraksha beads representing divine union of Shiva and Parvati.",
        benefits: [
          "Marital bliss",
          "Unity & love",
          "Spiritual growth",
          "Shiva-Shakti balance",
        ],
        authenticity: "Rare Nepal Origin · Astrologically Verified · Natural Joint",
        gradient: "linear-gradient(135deg, #2D0014 0%, #800040 50%, #CC0066 100%)",
      },
      {
        slug: "ekamukhi-rudraksha",
        name: "Ekamukhi (1-Mukhi) Rudraksha",
        price: 8999,
        description:
          "The rarest and most powerful Rudraksha, a single-faced bead representing pure consciousness.",
        benefits: [
          "Supreme Shiva connection",
          "Enlightenment path",
          "Ego dissolution",
          "Moksha",
        ],
        authenticity: "Certified Rare · Nepal Origin · Pandit Verified",
        gradient: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #3D3D00 100%)",
      },
    ],
  },
  {
    name: "Yantras",
    slug: "yantras",
    products: [
      {
        slug: "sri-yantra",
        name: "Sri Yantra (Copper)",
        price: 1499,
        description:
          "Hand-etched Sri Yantra on pure copper, energized during auspicious Navratri rituals.",
        benefits: [
          "Wealth & abundance",
          "Goddess Lakshmi blessings",
          "Cosmic energy activation",
          "Business success",
        ],
        authenticity: "Pure Copper · Hand Etched · Navratri Energized",
        gradient: "linear-gradient(135deg, #4D2900 0%, #CC6600 50%, #FF9933 100%)",
      },
      {
        slug: "vastu-yantra",
        name: "Vastu Dosh Nivaran Yantra",
        price: 999,
        description:
          "Corrects Vastu defects in homes and offices, bringing harmony and positive energy flow.",
        benefits: [
          "Vastu correction",
          "Home harmony",
          "Positive energy flow",
          "Family prosperity",
        ],
        authenticity: "Copper · Vastu Expert Verified · Temple Energized",
        gradient: "linear-gradient(135deg, #001A33 0%, #003366 50%, #0055AA 100%)",
      },
    ],
  },
  {
    name: "Puja Kits",
    slug: "puja-kits",
    products: [
      {
        slug: "navratri-puja-kit",
        name: "Navratri Puja Kit",
        price: 1299,
        description:
          "Complete 9-day Navratri worship kit with all sacred items for Durga puja.",
        benefits: [
          "Complete Navratri worship",
          "Durga's nine forms invoked",
          "Family protection",
          "Victory & power",
        ],
        authenticity: "Brahmin Curated · Natural Materials · Pure",
        gradient: "linear-gradient(135deg, #330000 0%, #990000 50%, #CC3300 100%)",
      },
      {
        slug: "satyanarayan-puja-kit",
        name: "Satyanarayan Puja Kit",
        price: 899,
        description:
          "All-inclusive kit for performing the auspicious Satyanarayan Puja at home.",
        benefits: [
          "Vishnu blessings",
          "Home purification",
          "Wealth & prosperity",
          "Family harmony",
        ],
        authenticity: "Pandit Approved · Natural Ingredients · Complete Set",
        gradient: "linear-gradient(135deg, #001A00 0%, #003300 50%, #005500 100%)",
      },
    ],
  },
  {
    name: "Temple Prasad",
    slug: "temple-prasad",
    products: [
      {
        slug: "tirupati-ladoo-prasad",
        name: "Tirupati Ladoo Prasad",
        price: 499,
        description:
          "The famous Tirupati Balaji Ladoo, directly sourced from the TTD trust kitchens.",
        benefits: [
          "Venkateswara's blessings",
          "Divine nourishment",
          "Wish fulfillment",
          "Sacred energy",
        ],
        authenticity: "TTD Official · Direct Sourced · Pure Ghee",
        gradient: "linear-gradient(135deg, #2D1B69 0%, #6B3FA0 50%, #BC6A4D 100%)",
      },
      {
        slug: "vrindavan-peda-prasad",
        name: "Vrindavan Peda Prasad",
        price: 399,
        description:
          "Authentic Mathura-style Peda from Vrindavan temples, a beloved Krishna offering.",
        benefits: [
          "Krishna's sweet blessings",
          "Joy & happiness",
          "Devotion increase",
          "Auspiciousness",
        ],
        authenticity: "Temple Origin · Pure Milk · Handmade",
        gradient: "linear-gradient(135deg, #00264D 0%, #0052A3 50%, #1A8CFF 100%)",
      },
    ],
  },
];

async function main() {
  let categoriesCreated = 0;
  let categoriesUpdated = 0;
  let productsCreated = 0;
  let productsUpdated = 0;

  for (const category of CATEGORIES) {
    const existingCategory = await prisma.shopCategory.findUnique({
      where: { slug: category.slug },
    });

    const categoryRow = existingCategory
      ? await prisma.shopCategory.update({
          where: { id: existingCategory.id },
          data: { name: category.name },
        })
      : await prisma.shopCategory.create({
          data: { name: category.name, slug: category.slug, isActive: true },
        });

    if (existingCategory) categoriesUpdated += 1;
    else categoriesCreated += 1;

    for (const product of category.products) {
      const existingProduct = await prisma.shopProduct.findUnique({
        where: { slug: product.slug },
      });

      const data = {
        categoryId: categoryRow.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        description: product.description,
        benefits: product.benefits,
        authenticity: product.authenticity,
        gradient: product.gradient,
        isActive: true,
      };

      if (existingProduct) {
        await prisma.shopProduct.update({
          where: { id: existingProduct.id },
          data,
        });
        productsUpdated += 1;
      } else {
        await prisma.shopProduct.create({
          data: { ...data, slug: product.slug },
        });
        productsCreated += 1;
      }
    }

    console.log(`✓ ${category.name} — ${category.products.length} product(s)`);
  }

  console.log(
    `\n✓ Done: ${categoriesCreated} categories created, ${categoriesUpdated} updated; ` +
      `${productsCreated} products created, ${productsUpdated} updated`,
  );
}

main()
  .catch((e) => {
    console.error("Shop seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
