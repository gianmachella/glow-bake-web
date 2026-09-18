import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { parseWeekStart } from "@/lib/weekWindow";
import { adjustWeeklySold } from "@/lib/weeklyStock";

const adjustSchema = z.object({
  cookieId: z.string().min(1),
  weekStart: z.string().min(1),
  amount: z.number().int().positive(),
});

// POST /api/weekly-menu/adjust — admin manual stock decrement: records
// `amount` units as sold against a cookie's current weekly batch (in-person
// sale, waste, any offline adjustment that didn't go through checkout),
// without needing a Sale/SaleItem row. Clamped so `sold` never exceeds the
// batch limit — repeated clicks just settle at 0 remaining.
export async function POST(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, adjustSchema);
    if (response) return response;

    const weekStart = parseWeekStart(data.weekStart);
    const updated = await prisma.$transaction((tx) =>
      adjustWeeklySold(tx, data.cookieId, weekStart, data.amount)
    );

    if (!updated) {
      return apiError("This cookie isn't on the menu for that week", 404);
    }

    return apiSuccess({
      cookieId: updated.cookieId,
      batchLimit: updated.batchLimit,
      sold: updated.sold,
      remaining: Math.max(updated.batchLimit - updated.sold, 0),
    });
  } catch (err) {
    console.error("❌ Error POST /api/weekly-menu/adjust:", err);
    return apiError(err.message, 500);
  }
}
