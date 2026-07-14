import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const lowStock = await prisma.ingredient.findMany({
      where: {
        remaining: {
          lt: 0.25, // ⚠️ aquí necesitamos dividir por la unidad total real
        },
      },
    });

    return Response.json(lowStock);
  } catch (error) {
    console.error(error);
    return new Response("Error fetching low stock", { status: 500 });
  }
}
