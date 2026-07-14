import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";

const autoDiscountSchema = z
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

// GET — admin: all automatic discounts
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const discounts = await prisma.autoDiscount.findMany({
    include: { cookie: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(discounts);
}

// POST — admin: create automatic discount
export async function POST(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { data, response } = await parseJsonBody(req, autoDiscountSchema);
  if (response) return response;

  const discount = await prisma.autoDiscount.create({
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

  return Response.json(discount, { status: 201 });
}
