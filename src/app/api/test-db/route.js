import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.deliverySettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        enableSaturday: true,
        extraDays: [],
      },
    });

    return Response.json(settings);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
