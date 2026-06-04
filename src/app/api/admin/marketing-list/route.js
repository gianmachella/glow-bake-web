import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Obtenemos emails de clientes que ya compraron
    const customers = await prisma.customer.findMany({
      select: { email: true, name: true },
    });

    // 2. Obtenemos emails de los que pidieron cupón
    const promoLeads = await prisma.promotion.findMany({
      select: { email: true },
    });

    // 3. Combinamos y eliminamos duplicados usando un Map
    const masterList = new Map();

    // Priorizamos los datos de 'Customer' porque suelen tener nombre
    customers.forEach((c) => {
      if (c.email)
        masterList.set(c.email.toLowerCase(), {
          email: c.email.toLowerCase(),
          source: "Customer",
          name: c.name || "Friend",
        });
    });

    // Añadimos los de promociones si no existen ya
    promoLeads.forEach((p) => {
      const email = p.email.toLowerCase();
      if (!masterList.has(email)) {
        masterList.set(email, {
          email: email,
          source: "Promo Lead",
          name: "Friend",
        });
      }
    });

    return NextResponse.json(Array.from(masterList.values()), { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error combining lists" },
      { status: 500 },
    );
  }
}
