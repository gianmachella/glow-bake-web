import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // --- Ingredientes ---
  const harina = await prisma.ingredient.create({
    data: {
      name: "Harina de trigo",
      unitType: "KG",
      unitQuantity: 25,
      price: 18.0,
      remaining: 25,
    },
  });

  const huevo = await prisma.ingredient.create({
    data: {
      name: "Huevo",
      unitType: "UNIT",
      unitQuantity: 12,
      price: 2.8,
      remaining: 12,
    },
  });

  const mantequilla = await prisma.ingredient.create({
    data: {
      name: "Mantequilla",
      unitType: "LB",
      unitQuantity: 2,
      price: 5.2,
      remaining: 2,
    },
  });

  // --- Masa base ---
  const masaBase = await prisma.baseDough.create({
    data: {
      name: "Masa básica vainilla",
      ingredients: {
        create: [
          {
            ingredientId: harina.id,
            quantityUsed: 1, // 1 kg
            cost: (18 / 25) * 1, // costo proporcional
          },
          {
            ingredientId: huevo.id,
            quantityUsed: 2, // 2 huevos
            cost: (2.8 / 12) * 2,
          },
          {
            ingredientId: mantequilla.id,
            quantityUsed: 0.5, // 0.5 lb
            cost: (5.2 / 2) * 0.5,
          },
        ],
      },
    },
  });

  // --- Cookie ---
  const cookie = await prisma.cookie.create({
    data: {
      name: "Chocolate Chip",
      price: 3.5,
      shortDescription: "Classic cookie with chocolate chips",
      description: "Soft, chewy, and filled with semi-sweet chocolate chips.",
      cost: 1.2, // costo aproximado
      recipes: {
        create: {
          baseDoughId: masaBase.id,
          ingredients: {
            create: [
              {
                ingredientId: mantequilla.id,
                quantityUsed: 0.1, // extra mantequilla
                cost: (5.2 / 2) * 0.1,
              },
            ],
          },
        },
      },
    },
  });

  console.log("Seed completed ✅", {
    harina,
    huevo,
    mantequilla,
    masaBase,
    cookie,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
