import prisma from "@/lib/prisma";

// 📍 GET → listar clientes
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify(customers), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error fetching customers:", err);
    return new Response(JSON.stringify({ error: "Error fetching customers" }), {
      status: 500,
    });
  }
}

// 📍 POST → crear cliente
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, lastName, email, phone, address } = body;

    const customer = await prisma.customer.create({
      data: { name, lastName, email, phone, address },
    });

    return new Response(JSON.stringify(customer), { status: 201 });
  } catch (err) {
    console.error("❌ Error creating customer:", err);
    return new Response(JSON.stringify({ error: "Error creating customer" }), {
      status: 500,
    });
  }
}

// 📍 PUT → actualizar cliente
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    const customer = await prisma.customer.update({
      where: { id },
      data: updates,
    });

    return new Response(JSON.stringify(customer), { status: 200 });
  } catch (err) {
    console.error("❌ Error updating customer:", err);
    return new Response(JSON.stringify({ error: "Error updating customer" }), {
      status: 500,
    });
  }
}

// 📍 DELETE → eliminar cliente
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    await prisma.customer.delete({ where: { id } });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
    return new Response(JSON.stringify({ error: "Error deleting customer" }), {
      status: 500,
    });
  }
}
