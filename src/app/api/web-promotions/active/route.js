import prisma from "@/lib/prisma";
import { startOfDay } from "@/lib/dateWindow";

// GET — public: active web promotions valid for today, for home page display
export async function GET() {
  const now = new Date();
  const promotions = await prisma.webPromotion.findMany({
    where: {
      active: true,
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: startOfDay(now) } }] }],
    },
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      cookieId: true,
      type: true,
      discountType: true,
      discountValue: true,
      minQuantity: true,
      active: true,
      cookie: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(promotions);
}
