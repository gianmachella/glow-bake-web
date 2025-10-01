import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const cookie = await prisma.cookie.findUnique({
      where: { id },
      include: {
        recipes: {
          include: {
            baseDough: true,
            ingredients: true,
          },
        },
      },
    });

    if (!cookie) {
      return NextResponse.json({ error: "Cookie not found" }, { status: 404 });
    }

    // 🚩 Calcular costo base de la masa (dividido entre 8 porque rinde 8 galletas)
    let masaCost = 0;
    cookie.recipes.forEach((recipe) => {
      masaCost += (recipe.baseDough?.totalCost || 0) / 8;
    });

    // 🚩 Calcular costo de ingredientes extras
    let extrasCost = 0;
    cookie.recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ing) => {
        extrasCost += ing.cost || 0;
      });
    });

    // 🚩 Buscar gastos por galleta
    const perCookieExpenses = await prisma.expense.findMany({
      where: { category: "per-cookie" },
    });

    const perCookieExtra = perCookieExpenses.reduce(
      (acc, e) => acc + (e.amount || 0),
      0
    );

    // 🚩 Total costo
    const totalCost = parseFloat(
      (masaCost + extrasCost + perCookieExtra).toFixed(2)
    );

    // 🚩 Ganancia
    const profit = parseFloat((cookie.price - totalCost).toFixed(2));

    return NextResponse.json({
      cost: totalCost,
      profit,
    });
  } catch (error) {
    console.error("Error in /api/cookies/[id]/costs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
