import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Ventas totales
    const totalSales = await prisma.sale.aggregate({
      _sum: { total: true },
      _count: true,
    });

    // Galletas más vendidas (basado en SaleItem)
    const topCookies = await prisma.saleItem.groupBy({
      by: ["cookieId"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    // Buscar info de cada galleta
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

    // Gastos extras
    const expenses = await prisma.expense.aggregate({
      _sum: { amount: true },
    });

    // Ganancias netas (ventas – gastos)
    const netProfit =
      (totalSales._sum.total ?? 0) - (expenses._sum.amount ?? 0);

    const summary = {
      totalRevenue: totalSales._sum.total ?? 0,
      totalOrders: totalSales._count,
      expenses: expenses._sum.amount ?? 0,
      netProfit,
      topCookies: cookiesData,
    };

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error generating summary:", error);
    return new Response(JSON.stringify({ error: "Error generating summary" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
