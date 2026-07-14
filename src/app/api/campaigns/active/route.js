import prisma from "@/lib/prisma";
import { startOfDay } from "@/lib/dateWindow";

// GET — public: active, site-wide campaigns valid for today
export async function GET() {
  const now = new Date();
  const campaigns = await prisma.campaign.findMany({
    where: {
      active: true,
      targetType: "ALL",
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: startOfDay(now) } }] }],
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(campaigns);
}
