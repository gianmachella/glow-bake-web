// prisma/seed-cookies.js
import { PrismaClient } from "@prisma/client";
import { cookies } from "../src/utils/CookiesData.js";

const prisma = new PrismaClient();

async function main() {
  for (const cookie of cookies) {
    await prisma.cookie.upsert({
      where: { name: cookie.name },
      update: {},
      create: {
        name: cookie.name,
        price: cookie.price,
        description: cookie.description,
        ingredients: cookie.ingredients,
        image: cookie.image || null,
      },
    });
  }
  console.log("🍪 Cookies seeded!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
