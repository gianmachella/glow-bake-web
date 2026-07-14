import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET(req, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { email } = params;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    // Buscar cliente con sus ventas
    const customer = await prisma.customer.findUnique({
      where: { email },
      include: {
        sales: {
          orderBy: { date: "desc" },
          include: { cookie: true }, // 👈 trae también info de la cookie
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer, { status: 200 });
  } catch (err) {
    console.error("Error fetching customer history:", err);
    return NextResponse.json(
      { error: "Error fetching customer history" },
      { status: 500 }
    );
  }
}
