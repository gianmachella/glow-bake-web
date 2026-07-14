import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

// ➕ POST /api/dough-inventory/bake-day
export async function POST(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { day } = await req.json();

    if (!day) {
      return NextResponse.json({ error: "Day is required" }, { status: 400 });
    }

    // 1. Buscar ventas de ese día
    const sales = await prisma.sale.findMany({
      where: { deliveryDay: day },
      include: { items: true },
    });

    if (sales.length === 0) {
      return NextResponse.json({ message: "No sales for this day" });
    }

    // 2. Restar inventario de dough
    for (const sale of sales) {
      for (const item of sale.items) {
        await prisma.doughInventory.updateMany({
          where: { cookieId: item.cookieId },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }

    return NextResponse.json({
      message: "Dough inventory updated successfully",
    });
  } catch (error) {
    console.error("❌ Error in POST /api/dough-inventory/bake-day:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
