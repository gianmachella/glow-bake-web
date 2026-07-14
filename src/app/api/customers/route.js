import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";

const customerCreateSchema = z.object({
  name: z.string().trim().min(1),
  lastName: z.string().trim().optional(),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

const customerUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).optional(),
  lastName: z.string().trim().optional(),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

const customerDeleteSchema = z.object({
  id: z.string().min(1),
});

// 📍 GET → listar clientes (paginated via ?take & ?cursor)
export async function GET(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(req.url);
    const take = Math.min(parseInt(searchParams.get("take")) || 50, 200);
    const cursor = searchParams.get("cursor");

    const customers = await prisma.customer.findMany({
      take: take + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
    });

    const hasMore = customers.length > take;
    const data = hasMore ? customers.slice(0, take) : customers;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return new Response(JSON.stringify({ data, nextCursor }), {
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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, customerCreateSchema);
    if (response) return response;

    const customer = await prisma.customer.create({ data });

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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, customerUpdateSchema);
    if (response) return response;
    const { id, ...updates } = data;

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
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, customerDeleteSchema);
    if (response) return response;
    const { id } = data;

    await prisma.customer.delete({ where: { id } });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
    return new Response(JSON.stringify({ error: "Error deleting customer" }), {
      status: 500,
    });
  }
}
