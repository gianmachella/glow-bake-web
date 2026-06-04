import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
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
