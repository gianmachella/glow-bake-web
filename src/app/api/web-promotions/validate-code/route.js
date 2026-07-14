import { z } from "zod";
import prisma from "@/lib/prisma";
import { parseJsonBody } from "@/lib/validate";
import { apiError } from "@/lib/apiResponse";
import { isWithinDateWindow } from "@/lib/dateWindow";

const validateSchema = z.object({
  code: z.string().trim().min(1),
});

// POST — public: validate a claimed coupon code for use at checkout (does not mark it used)
export async function POST(req) {
  const { data, response } = await parseJsonBody(req, validateSchema);
  if (response) return response;
  const code = data.code.trim().toUpperCase();

  const claim = await prisma.webPromotionClaim.findUnique({
    where: { code },
    include: { webPromotion: { include: { cookie: { select: { name: true } } } } },
  });

  if (!claim) return apiError("Invalid coupon code", 400);
  if (claim.used) return apiError("This coupon code has already been used", 400);

  const now = new Date();
  const { webPromotion: promo } = claim;
  if (!promo.active || !isWithinDateWindow(promo.startDate, promo.endDate, now)) {
    return apiError("This promotion is no longer active", 400);
  }

  const { webPromotion } = claim;
  return Response.json({
    code: claim.code,
    cookieId: webPromotion.cookieId,
    cookieName: webPromotion.cookie?.name || "All Cookies",
    promotionName: webPromotion.name,
    type: webPromotion.type,
    discountType: webPromotion.discountType,
    discountValue: webPromotion.discountValue,
    minQuantity: webPromotion.minQuantity,
  });
}
