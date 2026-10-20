import prisma from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/apiResponse";

// This GET handler takes no request-derived input (no searchParams, cookies,
// headers), which makes it eligible for Next.js's full route cache in a
// production build — meaning it could get statically rendered ONCE at build
// time and serve that same (possibly empty) response forever afterward,
// regardless of what the admin uploads later. force-dynamic guarantees it's
// re-evaluated against the database on every request instead.
export const dynamic = "force-dynamic";

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
