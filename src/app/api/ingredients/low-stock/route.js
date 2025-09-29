import prisma from "@/lib/prisma";

export async function GET() {
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
