import prisma from "@/lib/prisma";
import { startOfDay } from "@/lib/dateWindow";

// GET — public: active automatic discounts, valid for today
export async function GET() {
  const now = new Date();
  const discounts = await prisma.autoDiscount.findMany({
    where: {
      active: true,
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: startOfDay(now) } }] }],
    },
    select: {
      id: true,
      cookieId: true,
      type: true,
      discountType: true,
      discountValue: true,
      minQuantity: true,
      active: true,
    },
  });
  return Response.json(discounts);
}
