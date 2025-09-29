import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "machellaeleana@gmail.com";
  const plainPassword = "GE1131ge!!";

  // Generar hash nuevo
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Actualizar el user
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log("✅ Password actualizado:", user.email);
}

main()
  .catch((err) => {
    console.error("❌ Error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
