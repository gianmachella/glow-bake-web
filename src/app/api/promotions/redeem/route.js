import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { id } = await request.json();

    const promo = await prisma.promotion.findUnique({ where: { id } });

    if (!promo) {
      return NextResponse.json(
        { error: "Cupón no encontrado" },
        { status: 404 },
      );
    }

    if (promo.used) {
      return NextResponse.json(
        {
          error: "Este cupón ya fue usado",
          usedAt: promo.usedAt,
        },
        { status: 400 },
      );
    }

    // Marcar como usado
    const updated = await prisma.promotion.update({
      where: { id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "¡Cupón válido!",
        email: updated.email,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar el cupón" },
      { status: 500 },
    );
  }
}
