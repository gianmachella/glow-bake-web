import prisma from "@/lib/prisma";
import { convertQuantity } from "@/utils/convertQuantity";

// =======================
// GET: Listar masas base
// =======================
export async function GET() {
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
  try {
    const body = await req.json();
    const { name, ingredients } = body;

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
  try {
    const body = await req.json();
    const { id, name, ingredients } = body;

    if (!id) {
      return new Response("Missing dough ID", { status: 400 });
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
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response("Missing dough ID", { status: 400 });
    }

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
