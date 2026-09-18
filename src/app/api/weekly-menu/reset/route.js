import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { parseWeekStart } from "@/lib/weekWindow";

const resetSchema = z.object({
  cookieId: z.string().min(1),
  weekStart: z.string().min(1),
});

// POST /api/weekly-menu/reset — wipes a cookie's weekly metrics back to zero
// (sold = 0, batchLimit = 0) for the given week. For undoing a bad batch
// setup or clearing stale numbers, not normal restocking — the admin has to
// set a new batch limit afterward via the weekly menu selector, since a
// cookie left at batchLimit 0 shows as sold out on the storefront.
export async function POST(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, resetSchema);
    if (response) return response;

    const weekStart = parseWeekStart(data.weekStart);
    const existing = await prisma.weeklyMenuItem.findUnique({
      where: { cookieId_weekStart: { cookieId: data.cookieId, weekStart } },
    });
    if (!existing) {
      return apiError("This cookie isn't on the menu for that week", 404);
    }

    const updated = await prisma.weeklyMenuItem.update({
      where: { id: existing.id },
      data: { sold: 0, batchLimit: 0 },
    });

    return apiSuccess({
      cookieId: updated.cookieId,
      batchLimit: updated.batchLimit,
      sold: updated.sold,
      remaining: 0,
    });
  } catch (err) {
    console.error("❌ Error POST /api/weekly-menu/reset:", err);
    return apiError(err.message, 500);
  }
}
