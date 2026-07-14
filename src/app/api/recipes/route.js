import { z } from "zod";
import prisma from "@/lib/prisma";
import { convertQuantity } from "@/utils/convertQuantity";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";

const recipeIngredientSchema = z.object({
  ingredientId: z.string().min(1),
  quantityUsed: z.coerce.number().nonnegative(),
  unitType: z.string().min(1),
});

const recipeCreateSchema = z.object({
  cookieId: z.string().min(1),
  baseDoughId: z.string().min(1),
  ingredients: z.array(recipeIngredientSchema),
});

const recipeUpdateSchema = z.object({
  id: z.string().min(1),
  cookieId: z.string().min(1),
  baseDoughId: z.string().min(1),
  ingredients: z.array(recipeIngredientSchema),
});

const idSchema = z.object({
  id: z.string().min(1),
});

// GET: recetas de un cookieId (o todas si no se pasa cookieId)
export async function GET(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data: body, response } = await parseJsonBody(req, recipeCreateSchema);
    if (response) return response;
    const { cookieId, baseDoughId, ingredients } = body;
    // ingredients = [{ ingredientId, quantityUsed, unitType }]

    const dbIngredients = await prisma.ingredient.findMany({
      where: { id: { in: ingredients.map((ing) => ing.ingredientId) } },
    });
    const ingredientById = new Map(dbIngredients.map((i) => [i.id, i]));

    let totalCost = 0;
    const ingredientsData = [];

    for (const ing of ingredients) {
      const dbIngredient = ingredientById.get(ing.ingredientId);
      if (!dbIngredient) continue;

      const qty = ing.quantityUsed;
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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data: body, response } = await parseJsonBody(req, recipeUpdateSchema);
    if (response) return response;
    const { id, cookieId, baseDoughId, ingredients } = body;

    const dbIngredients = await prisma.ingredient.findMany({
      where: { id: { in: ingredients.map((ing) => ing.ingredientId) } },
    });
    const ingredientById = new Map(dbIngredients.map((i) => [i.id, i]));

    let totalCost = 0;
    const ingredientsData = [];

    for (const ing of ingredients) {
      const dbIngredient = ingredientById.get(ing.ingredientId);
      if (!dbIngredient) continue;

      const qty = ing.quantityUsed;
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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, idSchema);
    if (response) return response;
    const { id } = data;

    await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
    await prisma.recipe.delete({ where: { id } });

    return new Response("Recipe deleted successfully", { status: 200 });
  } catch (error) {
    console.error("❌ Error DELETE recipe:", error);
    return new Response("Error deleting recipe", { status: 500 });
  }
}
