import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "machellaeleana@gmail.com";
  const passwordPlain = "GE1131ge!!";
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ User creado/actualizado:", user);
}

main()
  .catch((e) => {
    console.error("❌ Error creando el user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
