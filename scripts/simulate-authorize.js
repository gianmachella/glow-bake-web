import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function simulateAuthorize(email, plainPassword) {
  console.log("👉 Intento de login con:", { email, plainPassword });

  if (!email || !plainPassword) {
    console.log("❌ Faltan credenciales");
    return null;
  }

  // Normalizar email
  email = email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("🔍 Usuario encontrado en DB:", user);

    if (!user) {
      console.log("❌ Usuario no encontrado");
      return null;
    }

    const isValid = await bcrypt.compare(plainPassword, user.password);
    console.log("🔑 ¿Password válida?", isValid);

    if (!isValid) {
      console.log("❌ Password incorrecto");
      return null;
    }

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.email,
    };

    console.log("✅ Login correcto, devolviendo:", userData);
    return userData;
  } catch (err) {
    console.error("🔥 Error en authorize:", err);
    return null;
  }
}

const email = "machellaeleana@gmail.com";
const password = "GE1131ge!!";

simulateAuthorize(email, password).then(() => {
  prisma.$disconnect();
});
