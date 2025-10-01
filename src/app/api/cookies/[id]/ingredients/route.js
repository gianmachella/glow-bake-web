import { NextResponse } from "next/server";
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

export async function POST(req, { params }) {
  try {
    const { id } = await params; // cookieId
    const { baseDoughId, ingredientId, quantityUsed, unit } = await req.json();

    if (!ingredientId || !quantityUsed || !unit || !baseDoughId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

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

    const qty = parseFloat(quantityUsed);
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
  try {
    const { id } = await params;
    const { cookieIngredientId, quantityUsed, unit } = await req.json();

    if (!cookieIngredientId) {
      return NextResponse.json(
        { error: "Falta cookieIngredientId" },
        { status: 400 }
      );
    }

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
  try {
    const { cookieIngredientId } = await req.json();

    if (!cookieIngredientId) {
      return NextResponse.json(
        { error: "Falta cookieIngredientId" },
        { status: 400 }
      );
    }

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
