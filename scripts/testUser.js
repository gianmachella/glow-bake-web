import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Modelos disponibles:", Object.keys(prisma));
  const users = await prisma.user.findMany();
  console.log("Usuarios:", users);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
