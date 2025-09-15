import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // buscar ventas solo de Thursday y Friday
    const sales = await prisma.sale.findMany({
      where: {
        deliveryDay: { in: ["Thursday", "Friday"] },
      },
      include: {
        items: { include: { cookie: true } },
      },
    });

    // estructura agrupada
    const grouped = {
      Thursday: { totalOrders: 0, totalCookies: 0, cookies: {} },
      Friday: { totalOrders: 0, totalCookies: 0, cookies: {} },
    };

    sales.forEach((sale) => {
      const day = sale.deliveryDay;
      if (!day || !grouped[day]) return;

      grouped[day].totalOrders += 1;

      sale.items.forEach((item) => {
        const cookieName = item.cookie?.name || "Unknown";
        grouped[day].cookies[cookieName] =
          (grouped[day].cookies[cookieName] || 0) + item.quantity;

        grouped[day].totalCookies += item.quantity;
      });
    });

    return new Response(JSON.stringify(grouped), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error en /api/sales/week:", err);
    return new Response(
      JSON.stringify({ error: "Error fetching weekly sales" }),
      { status: 500 }
    );
  }
}
