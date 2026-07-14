import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";

const addIngredientSchema = z.object({
  baseDoughId: z.string().min(1),
  ingredientId: z.string().min(1),
  quantityUsed: z.coerce.number().positive(),
  unit: z.string().min(1),
});

const updateIngredientSchema = z.object({
  cookieIngredientId: z.string().min(1),
  quantityUsed: z.coerce.number().positive(),
  unit: z.string().min(1),
});

const deleteIngredientSchema = z.object({
  cookieIngredientId: z.string().min(1),
});

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

import { convertQuantity } from "@/utils/convertQuantity";

// GET: lista de ingredientes de la receta de una cookie
export async function GET(req, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

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

export async function POST(req, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params; // cookieId
    const { data, response } = await parseJsonBody(req, addIngredientSchema);
    if (response) return response;
    const { baseDoughId, ingredientId, quantityUsed, unit } = data;

    // buscar o crear receta
    let recipe = await prisma.recipe.findFirst({
      where: { cookieId: id, baseDoughId },
    });

    if (!recipe) {
      recipe = await prisma.recipe.create({
        data: { cookieId: id, baseDoughId },
      });
    }

    const dbIngredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!dbIngredient) {
      return NextResponse.json(
        { error: "Ingrediente no encontrado" },
        { status: 404 }
      );
    }

    const qty = quantityUsed;
    const cost = (dbIngredient.price / dbIngredient.unitQuantity) * qty;

    await prisma.recipeIngredient.create({
      data: {
        recipeId: recipe.id,
        ingredientId,
        quantityUsed: qty,
        cost,
      },
    });

    // 👇 ahora devolvemos la receta con todos los ingredientes actualizados
    const updatedRecipe = await prisma.recipe.findUnique({
      where: { id: recipe.id },
      include: {
        ingredients: { include: { ingredient: true } },
        baseDough: true,
      },
    });

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("❌ Error POST cookie ingredient:", error);
    return NextResponse.json(
      { error: error.message || "Error agregando ingrediente" },
      { status: 500 }
    );
  }
}

// PUT: actualizar ingrediente de una cookie
export async function PUT(req, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const { data, response } = await parseJsonBody(req, updateIngredientSchema);
    if (response) return response;
    const { cookieIngredientId, quantityUsed, unit } = data;

    const dbCI = await prisma.cookieIngredient.findUnique({
      where: { id: cookieIngredientId },
      include: { ingredient: true },
    });
    if (!dbCI) {
      return NextResponse.json(
        { error: "Relación cookie-ingrediente no encontrada" },
        { status: 404 }
      );
    }

    const cost =
      (dbCI.ingredient.price / dbCI.ingredient.unitQuantity) * quantityUsed;

    const updated = await prisma.cookieIngredient.update({
      where: { id: cookieIngredientId },
      data: { quantityUsed, unit, cost },
      include: { ingredient: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("❌ Error PUT cookie ingredient:", error);
    return NextResponse.json(
      { error: error.message || "Error actualizando ingrediente" },
      { status: 500 }
    );
  }
}

// DELETE: eliminar ingrediente de una cookie
export async function DELETE(req, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, deleteIngredientSchema);
    if (response) return response;
    const { cookieIngredientId } = data;

    await prisma.cookieIngredient.delete({
      where: { id: cookieIngredientId },
    });

    return NextResponse.json({ message: "Ingrediente eliminado" });
  } catch (error) {
    console.error("❌ Error DELETE cookie ingredient:", error);
    return NextResponse.json(
      { error: error.message || "Error eliminando ingrediente" },
      { status: 500 }
    );
  }
}
