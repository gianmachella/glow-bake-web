import prisma from "@/lib/prisma";

async function recalcCookieCost(cookieId) {
  const recipes = await prisma.recipe.findMany({
    where: { cookieId },
    include: { baseDough: true, ingredients: true },
  });

  if (!recipes.length) return 0;

  return recipes.reduce((acc, recipe) => acc + recipe.totalCost, 0);
}

import { z } from "zod";
import { convertQuantity } from "@/utils/convertQuantity";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";

const updateRecipeIngredientSchema = z.object({
  quantityUsed: z.coerce.number().nonnegative(),
  unitType: z.string().min(1),
});

// PUT: actualizar ingrediente en receta
export async function PUT(req, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { ingredientId, id: cookieId } = params;
    const { data: body, response } = await parseJsonBody(req, updateRecipeIngredientSchema);
    if (response) return response;
    const { quantityUsed, unitType } = body;

    const recipeIngredient = await prisma.recipeIngredient.findUnique({
      where: { id: ingredientId },
      include: { ingredient: true, recipe: true },
    });
    if (!recipeIngredient) {
      return Response.json(
        { error: "RecipeIngredient no encontrado" },
        { status: 404 }
      );
    }

    const dbIngredient = await prisma.ingredient.findUnique({
      where: { id: recipeIngredient.ingredientId },
    });

    const qtyInInventoryUnit = convertQuantity(
      quantityUsed,
      unitType,
      dbIngredient.unitType
    );

    const cost =
      (dbIngredient.price / dbIngredient.unitQuantity) * qtyInInventoryUnit;

    const updated = await prisma.recipeIngredient.update({
      where: { id: ingredientId },
      data: { quantityUsed, cost },
      include: { ingredient: true },
    });

    // recalcular costo de la receta
    const ingredients = await prisma.recipeIngredient.findMany({
      where: { recipeId: recipeIngredient.recipeId },
    });
    const totalCost = ingredients.reduce((acc, ing) => acc + ing.cost, 0);
    await prisma.recipe.update({
      where: { id: recipeIngredient.recipeId },
      data: { totalCost },
    });

    // recalcular costo de la cookie
    const cookieCost = await recalcCookieCost(cookieId);
    await prisma.cookie.update({
      where: { id: cookieId },
      data: { cost: cookieCost },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("❌ Error PUT recipe ingredient:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: eliminar ingrediente de receta
export async function DELETE(_, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { ingredientId, id: cookieId } = params;

    const recipeIngredient = await prisma.recipeIngredient.findUnique({
      where: { id: ingredientId },
    });
    if (!recipeIngredient) {
      return Response.json(
        { error: "RecipeIngredient no encontrado" },
        { status: 404 }
      );
    }

    await prisma.recipeIngredient.delete({ where: { id: ingredientId } });

    // recalcular costo de la receta
    const ingredients = await prisma.recipeIngredient.findMany({
      where: { recipeId: recipeIngredient.recipeId },
    });
    const totalCost = ingredients.reduce((acc, ing) => acc + ing.cost, 0);
    await prisma.recipe.update({
      where: { id: recipeIngredient.recipeId },
      data: { totalCost },
    });

    // recalcular costo de la cookie
    const cookieCost = await recalcCookieCost(cookieId);
    await prisma.cookie.update({
      where: { id: cookieId },
      data: { cost: cookieCost },
    });

    return Response.json({
      message: "Ingrediente eliminado y costos actualizados",
    });
  } catch (error) {
    console.error("❌ Error DELETE recipe ingredient:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
