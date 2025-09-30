import prisma from "@/lib/prisma";

// 👉 Función para calcular el inicio del "sábado" más reciente
function getWeekRange() {
  const now = new Date();

  // Tomamos el último sábado
  const day = now.getDay(); // 0=domingo, 6=sábado
  const diff = (day + 1) % 7; // cuánto retroceder para llegar al sábado
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - diff
  );
  startOfWeek.setHours(0, 0, 0, 0);

  return { startOfWeek, endOfWeek: now };
}

export async function GET() {
  try {
    const { startOfWeek, endOfWeek } = getWeekRange();

    // Traemos todas las ventas de la semana actual
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      include: {
        items: {
          include: { cookie: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Agrupamos en Thursday y Friday
    const result = {
      Thursday: { totalOrders: 0, totalCookies: 0, cookies: {} },
      Friday: { totalOrders: 0, totalCookies: 0, cookies: {} },
    };

    for (const sale of sales) {
      const dayName = sale.createdAt.toLocaleDateString("en-US", {
        weekday: "long",
      });

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
