// scripts/debug-login.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "machellaeleana@gmail.com";
  const plainPassword = "GE1131ge!!";

  // Buscar user
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log("❌ Usuario no encontrado");
    return;
  }

  console.log("📦 Hash guardado en DB:", user.password);

  // Generar hash nuevo del password plano (solo para comparar visualmente)
  const newHash = await bcrypt.hash(plainPassword, 10);
  console.log("🆕 Hash recién generado con bcryptjs:", newHash);

  // Comparación real
  const isValid = await bcrypt.compare(plainPassword, user.password);
  console.log("🔑 ¿Coincide password con hash en DB?:", isValid);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
