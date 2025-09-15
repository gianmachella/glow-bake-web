import prisma from "./src/lib/prisma.js";

console.log("✅ Prisma client cargado");
console.log("Modelos disponibles:", Object.keys(prisma));
