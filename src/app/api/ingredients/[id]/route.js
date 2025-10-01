import prisma from "@/lib/prisma";

export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const {
      name,
      unitType,
      unitQuantity,
      price,
      remaining,
      packages,
      addPackage,
      removePackage,
    } = body;

    // Obtenemos el ingrediente actual
    const ingredient = await prisma.ingredient.findUnique({ where: { id } });

    let newRemaining = remaining ?? ingredient.remaining;
    let newPackages = packages ?? ingredient.packages;

    // Si se agrega un paquete
    if (addPackage) {
      newPackages = ingredient.packages + 1;
      newRemaining = ingredient.remaining + ingredient.unitQuantity;
    }

    // Si se quita un paquete
    if (removePackage && ingredient.packages > 0) {
      newPackages = ingredient.packages - 1;
      newRemaining = ingredient.remaining - ingredient.unitQuantity;
    }

    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        unitType,
        unitQuantity: parseFloat(unitQuantity),
        price: parseFloat(price),
        remaining: newRemaining,
        packages: newPackages,
      },
    });

    return Response.json(updatedIngredient);
  } catch (error) {
    console.error("❌ Error PUT ingredient:", error);
    return new Response(
      JSON.stringify({
        error: "Error updating ingredient",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}

// ✅ DELETE ingredient
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    await prisma.ingredient.delete({ where: { id } });
    return Response.json({ message: "Ingredient deleted" });
  } catch (error) {
    console.error("❌ Error DELETE ingredient:", error);
    return new Response(
      JSON.stringify({
        error: "Error deleting ingredient",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
