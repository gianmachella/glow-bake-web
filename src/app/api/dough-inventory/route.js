import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";

const cookieIdSchema = z.object({
  cookieId: z.string().min(1),
});

const doughAdjustSchema = z.object({
  id: z.string().min(1),
  amount: z.number().positive(),
});

// 📍 GET: listado de inventario de masas
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, cookieIdSchema);
    if (response) return response;
    const { cookieId } = data;

    let dough = await prisma.doughInventory.findFirst({
      where: { cookieId },
    });

    // Buscar ingredientes de la cookie
    const ingredients = await prisma.cookieIngredient.findMany({
      where: { cookieId },
    });

    // Descontar ingredientes ×8 y actualizar inventario en una sola transacción
    dough = await prisma.$transaction(async (tx) => {
      for (const ing of ingredients) {
        await tx.ingredient.update({
          where: { id: ing.ingredientId },
          data: { remaining: { decrement: ing.quantityUsed * 8 } },
        });
      }

      if (dough) {
        return tx.doughInventory.update({
          where: { id: dough.id },
          data: { quantity: { increment: 8 } },
          include: { cookie: true },
        });
      } else {
        return tx.doughInventory.create({
          data: { cookieId, quantity: 8 },
          include: { cookie: true },
        });
      }
    });

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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, cookieIdSchema);
    if (response) return response;
    const { cookieId } = data;

    const dough = await prisma.doughInventory.findFirst({
      where: { cookieId },
    });
    if (!dough || dough.quantity <= 0) {
      return new Response(
        JSON.stringify({ error: "No frozen cookies available" }),
        { status: 400 }
      );
    }

    const cookieIngredients = await prisma.cookieIngredient.findMany({
      where: { cookieId },
    });

    await prisma.$transaction(async (tx) => {
      await tx.doughInventory.update({
        where: { id: dough.id },
        data: { quantity: { decrement: 1 } },
      });
      for (const ing of cookieIngredients) {
        await tx.ingredient.update({
          where: { id: ing.ingredientId },
          data: { remaining: { increment: ing.quantityUsed } },
        });
      }
    });

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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, cookieIdSchema);
    if (response) return response;
    const { cookieId } = data;

    const dough = await prisma.doughInventory.findFirst({
      where: { cookieId },
    });
    if (!dough || dough.quantity < 8) {
      return new Response("Not enough frozen cookies", { status: 400 });
    }

    const cookieIngredients = await prisma.cookieIngredient.findMany({
      where: { cookieId },
    });

    const updated = await prisma.$transaction(async (tx) => {
      for (const ing of cookieIngredients) {
        await tx.ingredient.update({
          where: { id: ing.ingredientId },
          data: { remaining: { increment: ing.quantityUsed * 8 } },
        });
      }
      return tx.doughInventory.update({
        where: { id: dough.id },
        data: { quantity: { decrement: 8 } },
        include: { cookie: true },
      });
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (err) {
    console.error("❌ Error DELETE dough-inventory:", err);
    return new Response("Error deleting dough inventory", { status: 500 });
  }
}

// 📍 PUT → restar cookies por ventas reales (NO devuelve ingredientes)
export async function PUT(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, doughAdjustSchema);
    if (response) return response;
    const { id, amount } = data;

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
