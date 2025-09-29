import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "machellaeleana@gmail.com";
  const plain = "GE1131ge!!";

  const user = await prisma.user.findUnique({ where: { email } });
  console.log("🔍 Hash en DB:", user.password);

  const isValid = await bcrypt.compare(plain, user.password);
  console.log("¿Coincide?", isValid);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
