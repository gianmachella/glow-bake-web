import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "weekly";

    let startDate = new Date();
    if (range === "weekly") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (range === "yearly") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // 🔹 Ventas
    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: startDate } },
      include: {
        items: {
          include: {
            cookie: {
              include: {
                recipes: { include: { baseDough: true, ingredients: true } },
              },
            },
          },
        },
      },
    });

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
    const totalOrders = sales.length;

    // 🔹 Calcular costo real de cada galleta vendida
    let totalCookieCosts = 0;

    for (const sale of sales) {
      for (const item of sale.items) {
        const cookie = item.cookie;
        if (!cookie) continue;

        // costo de masa base ÷ 8
        let cost = 0;
        cookie.recipes.forEach((recipe) => {
          cost += (recipe.baseDough?.totalCost || 0) / 8;
          recipe.ingredients.forEach((ing) => {
            cost += ing.cost || 0;
          });
        });

        // gastos per-cookie
        const perCookieExpenses = await prisma.expense.findMany({
          where: { category: "per-cookie" },
        });
        const perCookieExtra = perCookieExpenses.reduce(
          (acc, e) => acc + (e.amount || 0),
          0
        );

        cost += perCookieExtra;

        totalCookieCosts += cost * item.quantity;
      }
    }

    // 🔹 Gastos generales
    const generalExpenses = await prisma.expense.findMany({
      where: {
        createdAt: { gte: startDate },
        NOT: { category: "per-cookie" },
      },
    });
    const generalTotal = generalExpenses.reduce(
      (acc, e) => acc + (e.amount || 0),
      0
    );

    // 🔹 Totales
    const expenses = totalCookieCosts + generalTotal;
    const netProfit = totalRevenue - expenses;

    // 🔹 Top cookies
    const cookieMap = {};
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!cookieMap[item.cookieId]) {
          cookieMap[item.cookieId] = {
            cookieId: item.cookieId,
            name: item.cookie?.name,
            totalSold: 0,
            totalRevenue: 0,
          };
        }
        cookieMap[item.cookieId].totalSold += item.quantity;
        cookieMap[item.cookieId].totalRevenue += item.price * item.quantity;
      });
    });

    const topCookies = Object.values(cookieMap).sort(
      (a, b) => b.totalSold - a.totalSold
    );

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      expenses,
      netProfit,
      topCookies,
    });
  } catch (error) {
    console.error("❌ Error summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
