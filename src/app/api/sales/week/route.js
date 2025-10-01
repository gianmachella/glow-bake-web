import prisma from "@/lib/prisma";

function getWeekRange() {
  const now = new Date();

  const day = now.getDay();
  let diff = day - 6;

  if (diff < 0) diff += 7;

  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - diff,
    9,
    0,
    0,
    0 // 👈 sábado 9:00 AM
  );

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  endOfWeek.setHours(8, 59, 59, 999); // 👈 siguiente sábado 8:59 AM

  return { startOfWeek, endOfWeek };
}

export async function GET() {
  try {
    const { startOfWeek, endOfWeek } = getWeekRange();

    // Traer todas las ventas de la semana Glow Bake
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      include: {
        items: { include: { cookie: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // 🔹 Resultado inicial con Thursday y Friday vacíos
    const result = {
      Thursday: { totalOrders: 0, totalCookies: 0, cookies: {} },
      Friday: { totalOrders: 0, totalCookies: 0, cookies: {} },
    };

    for (const sale of sales) {
      const dayName = sale.deliveryDay; // 👈 Usamos deliveryDay en vez de createdAt

      if (dayName === "Thursday" || dayName === "Friday") {
        result[dayName].totalOrders += 1;

        for (const item of sale.items) {
          const cookieName = item.cookie?.name || "Unknown";
          result[dayName].totalCookies += item.quantity;
          result[dayName].cookies[cookieName] =
            (result[dayName].cookies[cookieName] || 0) + item.quantity;
        }
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error fetching weekly sales:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
