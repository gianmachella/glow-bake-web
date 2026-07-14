import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";

const expenseCreateSchema = z.object({
  description: z.string().trim().min(1),
  amount: z.coerce.number().nonnegative(),
  category: z.string().trim().optional(),
});

const expenseUpdateSchema = z.object({
  id: z.string().min(1),
  description: z.string().trim().min(1).optional(),
  amount: z.coerce.number().nonnegative().optional(),
  category: z.string().trim().optional(),
});

const expenseDeleteSchema = z.object({
  id: z.string().min(1),
});

// 📍 GET → listar gastos
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, expenseCreateSchema);
    if (response) return response;

    const expense = await prisma.expense.create({ data });

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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, expenseUpdateSchema);
    if (response) return response;
    const { id, ...updates } = data;

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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, expenseDeleteSchema);
    if (response) return response;
    const { id } = data;

    await prisma.expense.delete({ where: { id } });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("❌ Error deleting expense:", err);
    return new Response(JSON.stringify({ error: "Error deleting expense" }), {
      status: 500,
    });
  }
}
