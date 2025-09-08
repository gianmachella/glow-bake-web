import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 👀 prueba básica: contar clientes
    const count = await prisma.customer.count();
    return new Response(JSON.stringify({ ok: true, customers: count }), {
      status: 200,
    });
  } catch (err) {
    console.error("DB connection error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
