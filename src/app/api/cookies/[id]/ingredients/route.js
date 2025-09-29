import prisma from "@/lib/prisma";

// 🔧 recalcula costo total de la cookie según sus recetas
async function recalcCookieCost(cookieId) {
  const recipes = await prisma.recipe.findMany({
    where: { cookieId },
    include: { baseDough: true, ingredients: true },
  });

  if (!recipes.length) return 0;

  let totalCost = 0;
  for (const recipe of recipes) {
    totalCost += recipe.totalCost;
  }
  return totalCost;
}

// Conversión de unidades
function convertQuantity(value, fromUnit, toUnit) {
  const factors = {
    G: 1,
    KG: 1000,
    MG: 0.001,
    LB: 453.592,
    OZ: 28.3495,
    ML: 1,
    L: 1000,
    FLOZ: 29.5735,
    CUP: 240,
    TBSP: 15,
    TSP: 5,
    PT: 473.176,
    QT: 946.353,
    GAL: 3785.41,
    UNIT: 1,
    PACK: 1,
  };

  if (!factors[fromUnit] || !factors[toUnit]) {
    throw new Error(`Conversión no soportada: ${fromUnit} -> ${toUnit}`);
  }

  return (value * factors[fromUnit]) / factors[toUnit];
}

// GET: lista de ingredientes de la receta de una cookie
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const recipe = await prisma.recipe.findFirst({
      where: { cookieId: id },
      include: { ingredients: { include: { ingredient: true } } },
    });

    if (!recipe) return Response.json([], { status: 200 });

    return Response.json(recipe.ingredients);
  } catch (error) {
    console.error("❌ Error GET cookie ingredients:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST: agregar ingrediente a la receta de una galleta
export async function POST(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { ingredientId, quantityUsed, unitType } = body;

    const dbIngredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });
    if (!dbIngredient) {
      return Response.json(
        { error: "Ingrediente no encontrado" },
        { status: 404 }
      );
    }

    const qtyInInventoryUnit = convertQuantity(
      Number(quantityUsed) || 0,
      unitType,
      dbIngredient.unitType
    );

    const cost =
      (dbIngredient.price / dbIngredient.unitQuantity) * qtyInInventoryUnit;

    // buscamos receta de la cookie, si no existe la creamos
    let recipe = await prisma.recipe.findFirst({ where: { cookieId: id } });
    if (!recipe) {
      const baseDough = await prisma.baseDough.create({
        data: { name: `Base para ${id}` },
      });
      recipe = await prisma.recipe.create({
        data: { cookieId: id, baseDoughId: baseDough.id },
      });
    }

    const recipeIngredient = await prisma.recipeIngredient.create({
      data: { recipeId: recipe.id, ingredientId, quantityUsed, cost },
      include: { ingredient: true },
    });

    // actualizar costo total de la receta
    const ingredients = await prisma.recipeIngredient.findMany({
      where: { recipeId: recipe.id },
    });
    const totalCost = ingredients.reduce((acc, ing) => acc + ing.cost, 0);
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { totalCost },
    });

    // actualizar costo de la cookie
    const cookieCost = await recalcCookieCost(id);
    await prisma.cookie.update({
      where: { id },
      data: { cost: cookieCost },
    });

    return Response.json(recipeIngredient);
  } catch (error) {
    console.error("❌ Error POST cookie ingredient:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
