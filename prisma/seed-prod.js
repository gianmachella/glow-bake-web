// prisma/seed-prod.js
import { PrismaClient } from "@prisma/client";
import { cookies } from "../src/utils/CookiesData.js"; // 👈 tu mock con todas las cookies

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding cookies into DB...");

  for (const cookie of cookies) {
    await prisma.cookie.upsert({
      where: { name: cookie.name },
      update: {
        price: cookie.price,
        description: cookie.description,
        ingredients: cookie.ingredients,
        image: cookie.image || null,
        images: cookie.images || [], // 👈 acá guardas las dos
      },
      create: {
        name: cookie.name,
        price: cookie.price,
        description: cookie.description,
        ingredients: cookie.ingredients,
        image: cookie.image || null,
        images: cookie.images || [],
      },
    });

    console.log(`✅ Cookie saved: ${cookie.name}`);
  }

  console.log("🌱 Done seeding cookies!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
