import prisma from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getWeekStart } from "@/lib/weekWindow";

// GET /api/weekly-menu/active — public: the current week's active menu, one
// entry per cookie that is visible AND has an active WeeklyMenuItem row for
// this week. This is the single source of truth the storefront (menu grid,
// cookie detail page, suggested-cookies) filters against so nothing outside
// the active weekly menu can ever be shown as purchasable.
export async function GET() {
  try {
    const weekStart = getWeekStart();

    const items = await prisma.weeklyMenuItem.findMany({
      where: { weekStart, active: true, cookie: { visible: true } },
      include: { cookie: true },
    });

    const cookies = items.map(({ cookie, batchLimit, sold }) => {
      const remaining = Math.max(batchLimit - sold, 0);
      return {
        ...cookie,
        batchLimit,
        sold,
        remaining,
        soldOut: remaining <= 0,
      };
    });

    return apiSuccess({ weekStart, cookies });
  } catch (err) {
    console.error("❌ Error GET /api/weekly-menu/active:", err);
    return apiError(err.message, 500);
  }
}
