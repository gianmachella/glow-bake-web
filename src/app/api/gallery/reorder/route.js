import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";
import { apiError, apiSuccess } from "@/lib/apiResponse";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().nonnegative(),
    })
  ).min(1),
});

// PATCH /api/gallery/reorder — admin: bulk-update display order, used by the
// gallery manager's move up/down controls.
export async function PATCH(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, reorderSchema);
    if (response) return response;

    await prisma.$transaction(
      data.items.map((item) =>
        prisma.galleryMedia.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    const items = await prisma.galleryMedia.findMany({ orderBy: { order: "asc" } });
    return apiSuccess(items);
  } catch (err) {
    console.error("❌ Error PATCH /api/gallery/reorder:", err);
    return apiError(err.message, 500);
  }
}
