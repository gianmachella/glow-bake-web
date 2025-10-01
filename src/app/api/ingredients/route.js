import prisma from "@/lib/prisma";

// ✅ GET all ingredients
export async function GET() {
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
  try {
    const body = await req.json();
    const { name, unitType, unitQuantity, price, remaining, packages } = body;

    const newIngredient = await prisma.ingredient.create({
      data: {
        name,
        unitType: unitType.toLowerCase(),
        unitQuantity: parseFloat(unitQuantity),
        price: parseFloat(price),
        remaining: parseFloat(remaining),
        packages: parseInt(packages ?? 1),
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
