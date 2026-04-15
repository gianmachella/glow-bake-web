import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
