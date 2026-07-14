import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

async function main() {
  const hashed = await bcrypt.hash("GE1131ge!!", 10); // ahora con bcryptjs
  await prisma.user.upsert({
    where: { email: "admin@glowbake.com" },
    update: {},
    create: {
      email: "admin@glowbake.com",
      password: hashed,
      role: "admin",
    },
  });
  console.log("✅ User created with bcryptjs");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
