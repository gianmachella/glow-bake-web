import prisma from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/apiResponse";

// GET /api/gallery/active — public: published media only, in display order.
// The storefront gallery renders nothing at all when this comes back empty.
export async function GET() {
  try {
    const items = await prisma.galleryMedia.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    return apiSuccess(items);
  } catch (err) {
    console.error("❌ Error GET /api/gallery/active:", err);
    return apiError(err.message, 500);
  }
}
