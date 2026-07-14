import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";

const deliverySettingsSchema = z.object({
  enableSaturday: z.boolean(),
  extraDays: z.any(),
  specialDates: z
    .array(
      z.object({
        productId: z.string().min(1),
        date: z.string().min(1),
      })
    )
    .optional(),
});

export async function POST(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data: body, response } = await parseJsonBody(req, deliverySettingsSchema);
    if (response) return response;

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
