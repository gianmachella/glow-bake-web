import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";

const ingredientCreateSchema = z.object({
  name: z.string().trim().min(1),
  unitType: z.string().trim().min(1),
  unitQuantity: z.coerce.number().positive(),
  price: z.coerce.number().nonnegative(),
  remaining: z.coerce.number().nonnegative(),
  packages: z.coerce.number().int().nonnegative().optional().default(1),
});

// ✅ GET all ingredients
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json(ingredients);
  } catch (error) {
    console.error("❌ Error GET ingredients:", error);
    return new Response(
      JSON.stringify({
        error: "Error fetching ingredients",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}

// ✅ CREATE ingredient
export async function POST(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, ingredientCreateSchema);
    if (response) return response;
    const { name, unitType, unitQuantity, price, remaining, packages } = data;

    const newIngredient = await prisma.ingredient.create({
      data: {
        name,
        unitType: unitType.toLowerCase(),
        unitQuantity,
        price,
        remaining,
        packages,
      },
    });

    return Response.json(newIngredient);
  } catch (error) {
    console.error("❌ Error creando ingrediente:", error);
    return Response.json(
      { error: "Error creando ingrediente", details: error.message },
      { status: 500 }
    );
  }
}
