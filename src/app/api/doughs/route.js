import { prisma } from "@/lib/prisma";

// Conversión de unidades a una base (gramos o mililitros)
function convertQuantity(value, fromUnit, toUnit, ingredientName = "") {
  const factors = {
    g: 1,
    kg: 1000,
    mg: 0.001,
    lb: 453.592,
    oz: 28.3495,
    ml: 1,
    l: 1000,
    cup: 240,
    tbsp: 15,
    tsp: 5,
    unidad: 1,
    pack: 1,
  };

  // normalizar a minúsculas
  fromUnit = fromUnit?.toLowerCase();
  toUnit = toUnit?.toLowerCase();

  if (!fromUnit) {
    throw new Error(
      `⚠️ Falta seleccionar unidad para el ingrediente "${ingredientName}"`
    );
  }

  if (!factors[fromUnit] || !factors[toUnit]) {
    throw new Error(`❌ Conversión no soportada: ${fromUnit} -> ${toUnit}`);
  }

  // convertir a gramos/ml base
  const baseValue = value * factors[fromUnit];
  return baseValue / factors[toUnit];
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

      const qtyInInventoryUnit = convertQuantity(
        qty,
        ing.unit, // 👈 unidad enviada desde el cliente
        dbIngredient.unitType,
        dbIngredient.name // 👈 para mensaje claro
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
    console.error("❌ Error POST dough:", error.message || error);
    return new Response(error.message || "Error creating base dough", {
      status: 500,
    });
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
    console.error("❌ Error PUT dough:", error.message || error);
    return new Response(error.message || "Error updating base dough", {
      status: 500,
    });
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
    console.error("❌ Error DELETE dough:", error.message || error);
    return new Response(error.message || "Error deleting base dough", {
      status: 500,
    });
  }
}
