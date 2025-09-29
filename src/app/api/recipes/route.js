import prisma from "@/lib/prisma";

// Conversión de unidades a una base (gramos o mililitros)
function convertQuantity(value, fromUnit, toUnit) {
  const factors = {
    // masa
    G: 1,
    KG: 1000,
    MG: 0.001,
    LB: 453.592,
    OZ: 28.3495,
    // volumen
    ML: 1,
    L: 1000,
    FLOZ: 29.5735,
    CUP: 240,
    TBSP: 15,
    TSP: 5,
    PT: 473.176,
    QT: 946.353,
    GAL: 3785.41,
    // universales
    UNIT: 1,
    PACK: 1,
  };

  if (!factors[fromUnit] || !factors[toUnit]) {
    throw new Error(`Conversión no soportada: ${fromUnit} -> ${toUnit}`);
  }

  return (value * factors[fromUnit]) / factors[toUnit];
}

// GET: recetas de un cookieId (o todas si no se pasa cookieId)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cookieId = searchParams.get("cookieId");

    const recipes = await prisma.recipe.findMany({
      where: cookieId ? { cookieId } : {},
      include: {
        baseDough: true,
        ingredients: {
          include: { ingredient: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(recipes);
  } catch (error) {
    console.error("❌ Error GET recipes:", error);
    return new Response("Error fetching recipes", { status: 500 });
  }
}

// POST: crear nueva receta
export async function POST(req) {
  try {
    const body = await req.json();
    const { cookieId, baseDoughId, ingredients } = body;
    // ingredients = [{ ingredientId, quantityUsed, unitType }]

    let totalCost = 0;
    const ingredientsData = [];

    for (const ing of ingredients) {
      const dbIngredient = await prisma.ingredient.findUnique({
        where: { id: ing.ingredientId },
      });
      if (!dbIngredient) continue;

      const qty = Number(ing.quantityUsed) || 0;
      const qtyInInventoryUnit = convertQuantity(
        qty,
        ing.unitType,
        dbIngredient.unitType
      );

      const cost =
        (dbIngredient.price / dbIngredient.unitQuantity) * qtyInInventoryUnit;

      totalCost += cost;

      ingredientsData.push({
        ingredientId: ing.ingredientId,
        quantityUsed: qty,
        cost,
      });
    }

    // sumar costo de la masa base
    const baseDough = await prisma.baseDough.findUnique({
      where: { id: baseDoughId },
    });
    if (baseDough) totalCost += baseDough.totalCost;

    const recipe = await prisma.recipe.create({
      data: {
        cookieId,
        baseDoughId,
        totalCost,
        ingredients: { create: ingredientsData },
      },
      include: {
        baseDough: true,
        ingredients: { include: { ingredient: true } },
      },
    });

    return Response.json(recipe);
  } catch (error) {
    console.error("❌ Error POST recipe:", error);
    return new Response("Error creating recipe", { status: 500 });
  }
}

// PUT: actualizar receta existente
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, cookieId, baseDoughId, ingredients } = body;

    if (!id) {
      return new Response("Missing recipe ID", { status: 400 });
    }

    let totalCost = 0;
    const ingredientsData = [];

    for (const ing of ingredients) {
      const dbIngredient = await prisma.ingredient.findUnique({
        where: { id: ing.ingredientId },
      });
      if (!dbIngredient) continue;

      const qty = Number(ing.quantityUsed) || 0;
      const qtyInInventoryUnit = convertQuantity(
        qty,
        ing.unitType,
        dbIngredient.unitType
      );

      const cost =
        (dbIngredient.price / dbIngredient.unitQuantity) * qtyInInventoryUnit;

      totalCost += cost;

      ingredientsData.push({
        ingredientId: ing.ingredientId,
        quantityUsed: qty,
        cost,
      });
    }

    const baseDough = await prisma.baseDough.findUnique({
      where: { id: baseDoughId },
    });
    if (baseDough) totalCost += baseDough.totalCost;

    // borrar ingredientes viejos y re-crear
    await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        cookieId,
        baseDoughId,
        totalCost,
        ingredients: { create: ingredientsData },
      },
      include: {
        baseDough: true,
        ingredients: { include: { ingredient: true } },
      },
    });

    return Response.json(updatedRecipe);
  } catch (error) {
    console.error("❌ Error PUT recipe:", error);
    return new Response("Error updating recipe", { status: 500 });
  }
}

// DELETE: eliminar receta
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response("Missing recipe ID", { status: 400 });
    }

    await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
    await prisma.recipe.delete({ where: { id } });

    return new Response("Recipe deleted successfully", { status: 200 });
  } catch (error) {
    console.error("❌ Error DELETE recipe:", error);
    return new Response("Error deleting recipe", { status: 500 });
  }
}
