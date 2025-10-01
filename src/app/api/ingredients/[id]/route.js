import prisma from "@/lib/prisma";

// ✅ UPDATE ingredient
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, name, unitType, unitQuantity, price, remaining, packages } =
      body;

    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        unitType,
        unitQuantity: parseFloat(unitQuantity),
        price: parseFloat(price),
        remaining: parseFloat(remaining),
        packages: parseInt(packages ?? 1),
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
