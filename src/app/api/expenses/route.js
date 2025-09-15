import prisma from "@/lib/prisma";

// 📍 GET → listar gastos
export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify(expenses), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error fetching expenses:", err);
    return new Response(JSON.stringify({ error: "Error fetching expenses" }), {
      status: 500,
    });
  }
}

// 📍 POST → crear gasto
export async function POST(req) {
  try {
    const body = await req.json();
    const { description, amount } = body;

    const expense = await prisma.expense.create({
      data: { description, amount: parseFloat(amount) },
    });

    return new Response(JSON.stringify(expense), { status: 201 });
  } catch (err) {
    console.error("❌ Error creating expense:", err);
    return new Response(JSON.stringify({ error: "Error creating expense" }), {
      status: 500,
    });
  }
}

// 📍 PUT → actualizar gasto
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    const expense = await prisma.expense.update({
      where: { id },
      data: updates,
    });

    return new Response(JSON.stringify(expense), { status: 200 });
  } catch (err) {
    console.error("❌ Error updating expense:", err);
    return new Response(JSON.stringify({ error: "Error updating expense" }), {
      status: 500,
    });
  }
}

// 📍 DELETE → eliminar gasto
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    await prisma.expense.delete({ where: { id } });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("❌ Error deleting expense:", err);
    return new Response(JSON.stringify({ error: "Error deleting expense" }), {
      status: 500,
    });
  }
}
