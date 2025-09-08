import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
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
