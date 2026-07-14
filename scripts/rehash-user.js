import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "machellaeleana@gmail.com";
  const plainPassword = "GE1131ge!!";

  const user = await prisma.user.findUnique({ where: { email } });
  const isValid = await bcrypt.compare(plainPassword, user.password);

  console.log("🔍 Hash en DB:", user.password);
  console.log("¿Coincide?", isValid);
}
main();
