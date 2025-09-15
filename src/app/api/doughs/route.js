import { prisma } from "@/lib/prisma";

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

  // convierte a base (g o ml) y luego a la unidad destino
  return (value * factors[fromUnit]) / factors[toUnit];
}

// GET: todas las masas base
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
    console.error("❌ Error GET doughs:", error);
    return new Response("Error fetching base doughs", { status: 500 });
  }
}

// POST: crear nueva masa base
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

      // convertir la cantidad usada a la unidad del inventario
      const qtyInInventoryUnit = convertQuantity(
        qty,
        ing.unitType, // unidad enviada desde el cliente
        dbIngredient.unitType // unidad en inventario
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
    return new Response("Error creating base dough", { status: 500 });
  }
}

// PUT: actualizar masa base
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
    console.error("❌ Error PUT base dough:", error);
    return new Response("Error updating base dough", { status: 500 });
  }
}

// DELETE: eliminar masa base
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
    console.error("❌ Error DELETE base dough:", error);
    return new Response("Error deleting base dough", { status: 500 });
  }
}
