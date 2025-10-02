import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 📍 GET: listado de inventario de masas
export async function GET() {
  try {
    const inventories = await prisma.doughInventory.findMany({
      include: { cookie: true },
    });

    const data = inventories.map((i) => ({
      id: i.id,
      cookieId: i.cookieId,
      cookieName: i.cookie.name,
      frozenStock: i.quantity,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error GET /api/dough-inventory:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 📍 POST: cargar una nueva masa (8 galletas congeladas)
export async function POST(req) {
  try {
    const { cookieId } = await req.json();

    let dough = await prisma.doughInventory.findFirst({
      where: { cookieId },
    });

    // Buscar ingredientes de la cookie
    const ingredients = await prisma.cookieIngredient.findMany({
      where: { cookieId },
    });

    // Descontar ingredientes ×8
    for (const ing of ingredients) {
      const totalToConsume = ing.quantityUsed * 8;
      await prisma.ingredient.update({
        where: { id: ing.ingredientId },
        data: { remaining: { decrement: totalToConsume } },
      });
    }

    // Actualizar o crear DoughInventory
    if (dough) {
      dough = await prisma.doughInventory.update({
        where: { id: dough.id },
        data: { quantity: { increment: 8 } },
        include: { cookie: true },
      });
    } else {
      dough = await prisma.doughInventory.create({
        data: { cookieId, quantity: 8 },
        include: { cookie: true },
      });
    }

    return new Response(JSON.stringify(dough), { status: 200 });
  } catch (err) {
    console.error("❌ Error POST dough-inventory:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// 📍 PATCH → restar 1 cookie manualmente (devolver ingredientes ×1)
export async function PATCH(req) {
  try {
    const { cookieId } = await req.json();
    if (!cookieId) {
      return new Response(JSON.stringify({ error: "Missing cookieId" }), {
        status: 400,
      });
    }

    const dough = await prisma.doughInventory.findFirst({
      where: { cookieId },
    });
    if (!dough || dough.quantity <= 0) {
      return new Response(
        JSON.stringify({ error: "No frozen cookies available" }),
        { status: 400 }
      );
    }

    // Restar 1
    await prisma.doughInventory.update({
      where: { id: dough.id },
      data: { quantity: { decrement: 1 } },
    });

    // Devolver ingredientes ×1
    const cookieIngredients = await prisma.cookieIngredient.findMany({
      where: { cookieId },
    });

    for (const ing of cookieIngredients) {
      await prisma.ingredient.update({
        where: { id: ing.ingredientId },
        data: { remaining: { increment: ing.quantityUsed } },
      });
    }

    // Devolver cookie con stock actualizado
    const updatedCookie = await prisma.cookie.findUnique({
      where: { id: cookieId },
      include: { doughInventories: true },
    });

    const frozenStock = updatedCookie.doughInventories.reduce(
      (acc, d) => acc + d.quantity,
      0
    );

    return new Response(JSON.stringify({ ...updatedCookie, frozenStock }), {
      status: 200,
    });
  } catch (err) {
    console.error("❌ Error PATCH dough-inventory:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// 📍 DELETE → eliminar masa completa (8 galletas, devolver ingredientes ×8)
export async function DELETE(req) {
  try {
    const { cookieId } = await req.json();
    if (!cookieId) {
      return new Response("Missing cookieId", { status: 400 });
    }

    const dough = await prisma.doughInventory.findFirst({
      where: { cookieId },
    });
    if (!dough || dough.quantity < 8) {
      return new Response("Not enough frozen cookies", { status: 400 });
    }

    // Devolver ingredientes ×8
    const cookieIngredients = await prisma.cookieIngredient.findMany({
      where: { cookieId },
    });

    for (const ing of cookieIngredients) {
      await prisma.ingredient.update({
        where: { id: ing.ingredientId },
        data: { remaining: { increment: ing.quantityUsed * 8 } },
      });
    }

    // Restar del inventario
    const updated = await prisma.doughInventory.update({
      where: { id: dough.id },
      data: { quantity: { decrement: 8 } },
      include: { cookie: true },
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (err) {
    console.error("❌ Error DELETE dough-inventory:", err);
    return new Response("Error deleting dough inventory", { status: 500 });
  }
}

// 📍 PUT → restar cookies por ventas reales (NO devuelve ingredientes)
export async function PUT(req) {
  try {
    const { id, amount } = await req.json();
    if (!id || !amount) {
      return new Response("Missing id or amount", { status: 400 });
    }

    const dough = await prisma.doughInventory.findUnique({ where: { id } });
    if (!dough) {
      return new Response("Dough inventory not found", { status: 404 });
    }

    const newQty = Math.max(dough.quantity - amount, 0);

    const updated = await prisma.doughInventory.update({
      where: { id },
      data: { quantity: newQty },
      include: { cookie: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ Error PUT dough-inventory:", err);
    return new Response("Error updating dough inventory", { status: 500 });
  }
}
