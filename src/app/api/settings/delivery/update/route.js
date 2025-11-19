import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();

    const { enableSaturday, extraDays, specialDates } = body;

    // Update main settings
    await prisma.deliverySettings.update({
      where: { id: 1 },
      data: {
        enableSaturday,
        extraDays,
      },
    });

    // Delete old special dates
    await prisma.specialDate.deleteMany({
      where: { settingsId: 1 },
    });

    // Insert new special dates
    if (specialDates && specialDates.length > 0) {
      await prisma.specialDate.createMany({
        data: specialDates.map((s) => ({
          productId: s.productId,
          date: new Date(s.date),
          settingsId: 1,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update delivery settings." },
      { status: 500 }
    );
  }
}
