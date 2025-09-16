import { prisma } from "@/lib/prisma";

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
        stack: error.stack, // 👈 agrega esto para debug
      }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, unitType, unitQuantity, price, remaining } = body;

    const newIngredient = await prisma.ingredient.create({
      data: {
        name,
        unitType: unitType.toLowerCase(), // 👈 normaliza siempre
        unitQuantity,
        price,
        remaining,
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
