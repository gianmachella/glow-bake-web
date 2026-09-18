import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { parseWeekStart } from "@/lib/weekWindow";

const weeklyMenuUpdateSchema = z.object({
  weekStart: z.string().min(1),
  items: z.array(
    z.object({
      cookieId: z.string().min(1),
      batchLimit: z.number().int().nonnegative(),
    })
  ),
});

async function buildWeekView(weekStart) {
  // Every cookie in the catalog is listed here, regardless of its `visible`
  // flag — the admin needs to see (and be able to toggle on) the full set,
  // not just whatever already happens to be shown on the storefront.
  const [cookies, menuItems] = await Promise.all([
    prisma.cookie.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, image: true, price: true, visible: true },
    }),
    prisma.weeklyMenuItem.findMany({ where: { weekStart } }),
  ]);

  const itemByCookieId = new Map(menuItems.map((i) => [i.cookieId, i]));

  const cookiesView = cookies.map((c) => {
    const item = itemByCookieId.get(c.id);
    const remaining = item ? Math.max(item.batchLimit - item.sold, 0) : 0;
    return {
      cookieId: c.id,
      name: c.name,
      image: c.image,
      price: c.price,
      visible: c.visible,
      included: !!item?.active,
      batchLimit: item?.batchLimit ?? 0,
      sold: item?.sold ?? 0,
      remaining,
    };
  });

  return { weekStart, cookies: cookiesView };
}

// GET /api/weekly-menu?week=YYYY-MM-DD — admin view of every cookie in the
// catalog (visible or hidden) plus its (if any) batch assignment for that
// week, for the weekly selector UI.
export async function GET(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(req.url);
    const weekStart = parseWeekStart(searchParams.get("week"));
    return apiSuccess(await buildWeekView(weekStart));
  } catch (err) {
    console.error("❌ Error GET /api/weekly-menu:", err);
    return apiError(err.message, 500);
  }
}

// PUT /api/weekly-menu — replace the batch assignments for a given week.
// Body: { weekStart, items: [{ cookieId, batchLimit }] }. Cookies included get
// upserted active with the given batchLimit; any cookie previously assigned to
// that week but left out of the payload is marked inactive (its `sold` count,
// and history, is kept rather than deleted).
export async function PUT(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, weeklyMenuUpdateSchema);
    if (response) return response;

    const weekStart = parseWeekStart(data.weekStart);
    const selectedIds = data.items.map((i) => i.cookieId);

    await prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        await tx.weeklyMenuItem.upsert({
          where: { cookieId_weekStart: { cookieId: item.cookieId, weekStart } },
          create: {
            cookieId: item.cookieId,
            weekStart,
            batchLimit: item.batchLimit,
            active: true,
          },
          update: { batchLimit: item.batchLimit, active: true },
        });
      }

      await tx.weeklyMenuItem.updateMany({
        where: {
          weekStart,
          cookieId: { notIn: selectedIds.length ? selectedIds : ["__none__"] },
        },
        data: { active: false },
      });
    });

    return apiSuccess(await buildWeekView(weekStart));
  } catch (err) {
    console.error("❌ Error PUT /api/weekly-menu:", err);
    return apiError(err.message, 500);
  }
}
