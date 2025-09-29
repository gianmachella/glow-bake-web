import prisma from "@/lib/prisma";

// 📍 GET → lista ventas con detalle
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: { include: { cookie: true } },
      },
    });

    return new Response(JSON.stringify(sales), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching sales:", error);
    return new Response(JSON.stringify({ error: "Error fetching sales" }), {
      status: 500,
    });
  }
}

// 📍 POST → crear venta y descontar inventario
export async function POST(req) {
  try {
    const body = await req.json();
    const { customerId, items, deliveryDay } = body; // añadimos deliveryDay
    const total = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const sale = await prisma.sale.create({
      data: {
        customerId,
        total,
        deliveryDay, // ✅ guardamos día
        items: {
          create: items.map((item) => ({
            cookieId: item.cookieId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: { include: { cookie: true } } },
    });

    return new Response(JSON.stringify(sale), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error creating sale:", error);
    return new Response(JSON.stringify({ error: "Error creating sale" }), {
      status: 500,
    });
  }
}

// 📍 DELETE → borrar venta
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Sale ID required" }), {
        status: 400,
      });
    }

    // ✅ Borramos items primero
    await prisma.saleItem.deleteMany({ where: { saleId: id } });
    await prisma.sale.delete({ where: { id } });

    return new Response(
      JSON.stringify({ message: "Sale deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting sale:", error);
    return new Response(JSON.stringify({ error: "Error deleting sale" }), {
      status: 500,
    });
  }
}
