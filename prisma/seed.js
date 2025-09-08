import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Ingredientes
  const flour = await prisma.ingredient.create({
    data: { name: "Harina", unit: "gramos", unitPrice: 0.002 },
  });
  const sugar = await prisma.ingredient.create({
    data: { name: "Azúcar", unit: "gramos", unitPrice: 0.003 },
  });
  const nutella = await prisma.ingredient.create({
    data: { name: "Nutella", unit: "gramos", unitPrice: 0.05 },
  });

  // Cookie con imágenes
  const cookie = await prisma.cookie.create({
    data: {
      name: "Nutella Cookie",
      price: 2.5,
      shortDescription: "Stuffed with smooth chocolate-hazelnut magic.",
      description:
        "A cookie filled with creamy Nutella that melts into every bite.",
      ingredients: "Harina, Azúcar, Nutella",
      image: "https://placehold.co/300x300.png", // principal
      images: [
        "https://placehold.co/300x300.png",
        "https://placehold.co/400x400.png",
      ],
    },
  });

  // Receta de la cookie
  await prisma.recipe.createMany({
    data: [
      { cookieId: cookie.id, ingredientId: flour.id, quantity: 50 },
      { cookieId: cookie.id, ingredientId: sugar.id, quantity: 20 },
      { cookieId: cookie.id, ingredientId: nutella.id, quantity: 30 },
    ],
  });

  // Cliente
  const customer = await prisma.customer.create({
    data: {
      name: "Juan",
      lastName: "Pérez",
      email: "juanperez@example.com",
      phone: "1234567890",
      address: "123 Main St, Princeton, TX",
    },
  });

  // Venta
  await prisma.sale.create({
    data: {
      cookieId: cookie.id,
      customerId: customer.id,
      quantity: 2,
      total: 5.0,
    },
  });

  // Gasto
  await prisma.expense.create({
    data: {
      description: "Compra de empaques",
      amount: 15.0,
    },
  });

  console.log("✅ Seed finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
