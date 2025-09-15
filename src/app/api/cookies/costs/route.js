import { prisma } from "@/lib/prisma";

// 🔧 Función para recalcular costo de la cookie
async function recalcCookieCost(cookieId) {
  const recipes = await prisma.recipe.findMany({
    where: { cookieId },
    include: { baseDough: true, ingredients: true },
  });

  if (!recipes.length) return 0;

  return recipes.reduce((acc, recipe) => acc + recipe.totalCost, 0);
}

// 📍 GET → devuelve costo, precio y ganancia de una cookie
export async function GET(_, { params }) {
  try {
    const { id } = params;

    // buscamos la cookie
    const cookie = await prisma.cookie.findUnique({
      where: { id },
    });
    if (!cookie) {
      return Response.json({ error: "Cookie no encontrada" }, { status: 404 });
    }

    // recalculamos costo real desde recetas
    const cost = await recalcCookieCost(id);

    // actualizamos DB para mantener sincronizado
    await prisma.cookie.update({
      where: { id },
      data: { cost },
    });

    // calculamos profit y margen
    const profit = cookie.price - cost;
    const margin = cookie.price > 0 ? (profit / cookie.price) * 100 : 0;

    return Response.json({
      id: cookie.id,
      name: cookie.name,
      price: cookie.price,
      cost,
      profit,
      margin: Number(margin.toFixed(2)), // porcentaje con 2 decimales
    });
  } catch (error) {
    console.error("❌ Error GET cookie cost:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
