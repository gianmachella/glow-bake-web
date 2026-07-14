import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: {
        createdAt: "desc", // Los más nuevos primero
      },
    });

    return NextResponse.json(promotions, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener la lista" },
      { status: 500 },
    );
  }
}
