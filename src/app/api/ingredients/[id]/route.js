import { prisma } from "@/lib/prisma";

export async function PUT(req, context) {
  try {
    const { id } = await context.params; // 👈 await aquí
    const body = await req.json();
    const { name, unitType, unitQuantity, price, remaining } = body;

    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        unitType,
        unitQuantity: parseFloat(unitQuantity),
        price: parseFloat(price),
        remaining: parseFloat(remaining),
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

export async function DELETE(_, context) {
  try {
    const { id } = await context.params; // 👈 await aquí también

    await prisma.ingredient.delete({
      where: { id },
    });

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
