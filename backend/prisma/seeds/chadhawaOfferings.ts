/**
 * Seeds the same six Chadhawa offerings the public detail page currently
 * renders (frontend/src/pages/Chadhawa/ChadhawaDetail.tsx) onto every temple.
 *
 * The data is copied rather than imported: the frontend is a separate package
 * with its own tsconfig, and this seed must keep working even if that file is
 * later rewritten to read from the API.
 *
 * Safe to re-run — an offering is matched per temple by name, then updated in
 * place, so repeated runs never duplicate rows.
 *
 *   npm run db:seed:chadhawa                    seed/refresh every temple
 *   npm run db:seed:chadhawa -- --temple=<slug>  one temple only (repeatable)
 *   npm run db:seed:chadhawa -- --reset          delete existing offerings first
 */

import "dotenv/config";
import prisma from "../../prisma.js";

interface SeedOffering {
  name: string;
  description: string;
  price: number;
  emoji: string;
}

/** Order here becomes displayOrder 1..n. */
const OFFERINGS: SeedOffering[] = [
  {
    name: "Kumkum",
    emoji: "🔴",
    price: 51,
    description:
      "Auspicious red powder applied on the deity's forehead as a mark of devotion.",
  },
  {
    name: "Mehendi",
    emoji: "🌿",
    price: 51,
    description:
      "Sacred henna offering symbolising beauty, devotion, and divine feminine grace.",
  },
  {
    name: "Flower Basket",
    emoji: "🌸",
    price: 71,
    description:
      "Offering a basket of fresh flowers as a symbol of worship and prosperity.",
  },
  {
    name: "Red Bangles",
    emoji: "💫",
    price: 81,
    description:
      "Red bangles are a symbol of power, passion and good fortune in tradition.",
  },
  {
    name: "Lotus",
    emoji: "🪷",
    price: 101,
    description:
      "Offer a lotus to Goddess Mahalaxmi as a symbol of purity and admiration.",
  },
  {
    name: "Chunri",
    emoji: "🧣",
    price: 101,
    description:
      "Chunri is a decorative cloth offered to goddesses, especially during festivals.",
  },
];

const args = process.argv.slice(2);
const reset = args.includes("--reset");
const templeSlugs = args
  .filter((arg) => arg.startsWith("--temple="))
  .map((arg) => arg.slice("--temple=".length).trim())
  .filter(Boolean);

async function main() {
  const temples = await prisma.temple.findMany({
    where: templeSlugs.length ? { slug: { in: templeSlugs } } : undefined,
    select: { id: true, slug: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  if (!temples.length) {
    console.log(
      templeSlugs.length
        ? `No temples matched: ${templeSlugs.join(", ")}`
        : "No temples found — run `npm run db:seed:puja` first.",
    );
    return;
  }

  if (templeSlugs.length && templeSlugs.length !== temples.length) {
    const found = new Set(temples.map((t) => t.slug));
    const missing = templeSlugs.filter((slug) => !found.has(slug));
    console.log(`⚠ Skipping unknown temple slug(s): ${missing.join(", ")}`);
  }

  if (reset) {
    const { count } = await prisma.chadhawa.deleteMany({
      where: { templeId: { in: temples.map((t) => t.id) } },
    });
    console.log(`Removed ${count} existing offering(s)`);
  }

  let created = 0;
  let updated = 0;

  for (const temple of temples) {
    for (const [index, offering] of OFFERINGS.entries()) {
      const displayOrder = index + 1;

      // No unique constraint on (templeId, name) — the admin API enforces it
      // at the application layer, so match the same way here.
      const existing = await prisma.chadhawa.findFirst({
        where: {
          templeId: temple.id,
          name: { equals: offering.name, mode: "insensitive" },
        },
        select: { id: true },
      });

      if (existing) {
        await prisma.chadhawa.update({
          where: { id: existing.id },
          data: {
            description: offering.description,
            price: offering.price,
            emoji: offering.emoji,
            displayOrder,
            isActive: true,
          },
        });
        updated += 1;
      } else {
        await prisma.chadhawa.create({
          data: {
            templeId: temple.id,
            name: offering.name,
            description: offering.description,
            price: offering.price,
            emoji: offering.emoji,
            displayOrder,
            isActive: true,
          },
        });
        created += 1;
      }
    }

    console.log(`✓ ${temple.name} — ${OFFERINGS.length} offering(s)`);
  }

  console.log(
    `\n✓ Done: ${created} created, ${updated} updated across ${temples.length} temple(s)`,
  );
}

main()
  .catch((e) => {
    console.error("Chadhawa seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
