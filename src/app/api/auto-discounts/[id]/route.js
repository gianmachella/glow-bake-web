import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";
import { apiError } from "@/lib/apiResponse";

const autoDiscountUpdateSchema = z
  .object({
    cookieId: z.string().min(1),
    type: z.enum(["FIXED", "VOLUME"]),
    discountType: z.enum(["PERCENTAGE", "FIXED"]).optional().default("FIXED"),
    discountValue: z.coerce.number().positive(),
    minQuantity: z.coerce.number().int().positive().optional().default(1),
    active: z.boolean().optional().default(true),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
  })
  .transform((data) => {
    if (data.type === "FIXED") {
      return { ...data, discountType: "FIXED", minQuantity: 1 };
    }
    return data;
  })
  .refine((data) => data.type !== "VOLUME" || data.minQuantity >= 2, {
    message: "Volume discounts require a minimum quantity of at least 2",
    path: ["minQuantity"],
  });

// PUT — admin: update automatic discount
export async function PUT(req, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data, response } = await parseJsonBody(req, autoDiscountUpdateSchema);
  if (response) return response;

  const existing = await prisma.autoDiscount.findUnique({ where: { id: params.id } });
  if (!existing) return apiError("Not found", 404);

  const updated = await prisma.autoDiscount.update({
    where: { id: params.id },
    data: {
      cookieId: data.cookieId,
      type: data.type,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minQuantity: data.minQuantity,
      active: data.active,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  });

  return Response.json(updated);
}

// DELETE — admin: remove automatic discount
export async function DELETE(req, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  await prisma.autoDiscount.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}
