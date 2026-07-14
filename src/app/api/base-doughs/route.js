import { z } from "zod";
import prisma from "@/lib/prisma";
import { convertQuantity } from "@/utils/convertQuantity";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";

const doughIngredientSchema = z.object({
  ingredientId: z.string().min(1),
  quantityUsed: z.coerce.number().nonnegative(),
  unit: z.string().min(1),
});

const doughCreateSchema = z.object({
  name: z.string().trim().min(1),
  ingredients: z.array(doughIngredientSchema),
});

const doughUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  ingredients: z.array(doughIngredientSchema),
});

const idSchema = z.object({
  id: z.string().min(1),
});

// =======================
// GET: Listar masas base
// =======================
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const doughs = await prisma.baseDough.findMany({
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(doughs);
  } catch (error) {
    console.error("❌ Error GET base-doughs:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// =======================
// POST: Crear nueva masa
// =======================
export async function POST(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data: body, response } = await parseJsonBody(req, doughCreateSchema);
    if (response) return response;
    const { name, ingredients } = body;

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
        ing.unit,
        dbIngredient.unitType,
        dbIngredient.name
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

    const newDough = await prisma.baseDough.create({
      data: {
        name,
        totalCost,
        ingredients: { create: ingredientsData },
      },
      include: { ingredients: { include: { ingredient: true } } },
    });

    return Response.json(newDough);
  } catch (error) {
    console.error("❌ Error POST dough:", error);
    return new Response(error.message || "Error creating base dough", {
      status: 500,
    });
  }
}

// =======================
// PUT: Actualizar masa
// =======================
export async function PUT(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data: body, response } = await parseJsonBody(req, doughUpdateSchema);
    if (response) return response;
    const { id, name, ingredients } = body;

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
        ing.unit,
        dbIngredient.unitType,
        dbIngredient.name
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

    // Limpiar ingredientes previos
    await prisma.baseDoughIngredient.deleteMany({ where: { baseDoughId: id } });

    const updatedDough = await prisma.baseDough.update({
      where: { id },
      data: {
        name,
        totalCost,
        ingredients: { create: ingredientsData },
      },
      include: { ingredients: { include: { ingredient: true } } },
    });

    return Response.json(updatedDough);
  } catch (error) {
    console.error("❌ Error PUT dough:", error);
    return new Response(error.message || "Error updating base dough", {
      status: 500,
    });
  }
}

// =======================
// DELETE: Eliminar masa
// =======================
export async function DELETE(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, idSchema);
    if (response) return response;
    const { id } = data;

    await prisma.baseDoughIngredient.deleteMany({ where: { baseDoughId: id } });
    await prisma.baseDough.delete({ where: { id } });

    return new Response("Dough deleted successfully", { status: 200 });
  } catch (error) {
    console.error("❌ Error DELETE dough:", error);
    return new Response(error.message || "Error deleting base dough", {
      status: 500,
    });
  }
}
