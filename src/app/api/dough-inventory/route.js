import { prisma } from "@/lib/prisma";

// 📍 GET → listar todas las masas en inventario
export async function GET() {
  try {
    const doughs = await prisma.doughInventory.findMany({
      include: { cookie: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(doughs);
  } catch (err) {
    console.error("❌ Error GET dough-inventory:", err);
    return new Response("Error fetching dough inventory", { status: 500 });
  }
}

// 📍 POST → registrar nueva masa en inventario
export async function POST(req) {
  try {
    const body = await req.json();
    const { cookieId, quantity } = body;

    if (!cookieId || !quantity) {
      return new Response("Missing cookieId or quantity", { status: 400 });
    }

    // cada masa rinde 8 galletas
    const totalGalletas = quantity * 8;

    const dough = await prisma.doughInventory.create({
      data: {
        cookieId,
        quantity: totalGalletas,
      },
      include: { cookie: true },
    });

    return Response.json(dough, { status: 201 });
  } catch (err) {
    console.error("❌ Error POST dough-inventory:", err);
    return new Response("Error creating dough inventory", { status: 500 });
  }
}

// 📍 PUT → restar galletas por venta
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, amount } = body;

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

    return Response.json(updated);
  } catch (err) {
    console.error("❌ Error PUT dough-inventory:", err);
    return new Response("Error updating dough inventory", { status: 500 });
  }
}

// 📍 DELETE → eliminar masa del inventario
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return new Response("Missing id", { status: 400 });
    }

    await prisma.doughInventory.delete({ where: { id } });

    return new Response("Dough inventory deleted", { status: 200 });
  } catch (err) {
    console.error("❌ Error DELETE dough-inventory:", err);
    return new Response("Error deleting dough inventory", { status: 500 });
  }
}
