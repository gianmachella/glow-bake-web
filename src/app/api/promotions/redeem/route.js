import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";

const redeemSchema = z.object({
  id: z.string().min(1),
});

// Staff-only: redeemed via the QR scanner on the /dashboard/promotions page
export async function POST(request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(request, redeemSchema);
    if (response) return response;
    const { id } = data;

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
