import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";

const ingredientUpdateSchema = z.object({
  name: z.string().trim().min(1),
  unitType: z.string().trim().min(1),
  unitQuantity: z.coerce.number().positive(),
  price: z.coerce.number().nonnegative(),
  remaining: z.coerce.number().nonnegative().optional(),
  packages: z.coerce.number().int().nonnegative().optional(),
  addPackage: z.boolean().optional(),
  removePackage: z.boolean().optional(),
});

export async function PUT(req, context) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const { data: body, response } = await parseJsonBody(req, ingredientUpdateSchema);
    if (response) return response;
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
        unitQuantity,
        price,
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

export async function DELETE(req, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = params;

    await prisma.ingredient.delete({ where: { id } });

    return Response.json({ message: "Ingredient deleted" });
  } catch (error) {
    console.error("❌ Error DELETE ingredient:", error);
    return new Response(
      JSON.stringify({ error: "Error deleting ingredient" }),
      { status: 500 }
    );
  }
}
