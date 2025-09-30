import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "all";

    const now = new Date();
    let start, end;

    if (range === "weekly") {
      // Semana actual: desde sábado anterior hasta viernes
      const day = now.getDay(); // 0=Dom, 6=Sáb
      const diffToSaturday = (day + 1) % 7;
      start = new Date(now);
      start.setDate(now.getDate() - diffToSaturday);
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (range === "monthly") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (range === "yearly") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else {
      start = new Date(2000, 0, 1); // todo
      end = new Date(2100, 0, 1);
    }

    // 📊 Ventas totales
    const totalSales = await prisma.sale.aggregate({
      where: { createdAt: { gte: start, lte: end } },
      _sum: { total: true },
      _count: true,
    });

    // 📊 Top galletas
    const topCookies = await prisma.saleItem.groupBy({
      by: ["cookieId"],
      where: { sale: { createdAt: { gte: start, lte: end } } },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const cookiesData = await Promise.all(
      topCookies.map(async (item) => {
        const cookie = await prisma.cookie.findUnique({
          where: { id: item.cookieId },
        });
        return {
          cookieId: item.cookieId,
          name: cookie?.name ?? "Desconocida",
          totalSold: item._sum.quantity ?? 0,
          totalRevenue: (item._sum.quantity ?? 0) * (cookie?.price ?? 0),
        };
      })
    );

    const summary = {
      totalRevenue: totalSales._sum.total ?? 0,
      totalOrders: totalSales._count,
      topCookies: cookiesData,
    };

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error generating summary:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
