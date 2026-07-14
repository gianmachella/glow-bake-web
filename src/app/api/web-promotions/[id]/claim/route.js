import { Resend } from "resend";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { parseJsonBody } from "@/lib/validate";
import { apiError } from "@/lib/apiResponse";
import { generateCouponCode } from "@/lib/couponCode";
import { isWithinDateWindow } from "@/lib/dateWindow";

const claimSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDiscount(promotion) {
  const amount =
    promotion.discountType === "PERCENTAGE"
      ? `${promotion.discountValue}%`
      : `$${promotion.discountValue}`;
  const scope = promotion.cookie?.name ? promotion.cookie.name : "every cookie";
  if (promotion.type === "VOLUME") {
    return `${amount} off ${scope} when you buy ${promotion.minQuantity}+ cookies`;
  }
  return `${amount} off ${scope}`;
}

async function sendClaimEmail({ to, name, promotion, code }) {
  if (!process.env.RESEND_API_KEY) {
    console.error("Resend not configured: RESEND_API_KEY is missing, skipping claim email");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const safeName = escapeHtml(name);
  const discountLine = formatDiscount(promotion);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #fce7f3; border-radius: 20px; overflow: hidden;">
      <div style="background-color: #ec4899; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-style: italic;">GlowBake</h1>
      </div>
      <div style="padding: 30px; text-align: center; background-color: white;">
        <img src="https://glowbake.com/images/logo-circle.png" alt="Glow Bake" style="max-width: 150px; margin-bottom: 20px;" />
        <h2 style="color: #333; margin-bottom: 4px;">Hi ${safeName}!</h2>
        <p style="color: #666;">Here's your unique code for <strong>${escapeHtml(promotion.name)}</strong>:</p>

        <div style="margin: 20px 0; padding: 16px; background-color: #fdf2f8; border: 2px dashed #ec4899; border-radius: 12px;">
          <span style="font-size: 26px; font-weight: bold; color: #ec4899; letter-spacing: 2px;">${code}</span>
        </div>

        <p style="color: #333; font-weight: bold; margin-bottom: 4px;">${discountLine}</p>
        ${promotion.description ? `<p style="color: #888; font-size: 13px; margin-top: 4px;">${escapeHtml(promotion.description)}</p>` : ""}

        ${
          promotion.customInstructions
            ? `<div style="margin-top: 20px; padding: 14px; background-color: #fff7ed; border-radius: 10px; text-align: left;">
                 <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: bold;">How to redeem:</p>
                 <p style="color: #78350f; font-size: 13px; margin: 6px 0 0; white-space: pre-wrap;">${escapeHtml(promotion.customInstructions)}</p>
               </div>`
            : `<p style="color: #999; font-size: 13px; margin-top: 16px;">Enter this code in the coupon field at checkout to apply your discount.</p>`
        }

        <p style="font-size: 11px; color: #999; line-height: 1.4; margin-top: 20px;">
          * This code is single-use and tied to your email.
        </p>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "GlowBake <hello@glowbake.com>",
    to,
    subject: `Your Glow Bake code for ${promotion.name}`,
    html,
  });

  if (error) {
    console.error("Resend error (claim email):", {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
    });
  }
}

// POST — public: claim a web promotion with name + email, get back a unique code
export async function POST(req, { params }) {
  const { data, response } = await parseJsonBody(req, claimSchema);
  if (response) return response;
  const email = data.email.toLowerCase();
  const { name } = data;

  const promotion = await prisma.webPromotion.findUnique({
    where: { id: params.id },
    include: { cookie: { select: { name: true } } },
  });
  if (!promotion) return apiError("Promotion not found", 404);

  const now = new Date();
  if (!promotion.active || !isWithinDateWindow(promotion.startDate, promotion.endDate, now)) {
    return apiError("This promotion is no longer active", 400);
  }

  // One code per email per promotion — if they've already claimed it, resend the same code.
  const existing = await prisma.webPromotionClaim.findUnique({
    where: { webPromotionId_email: { webPromotionId: promotion.id, email } },
  });
  if (existing) {
    await sendClaimEmail({ to: email, name, promotion, code: existing.code });
    return Response.json({ code: existing.code, used: existing.used });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCouponCode();
    try {
      const claim = await prisma.webPromotionClaim.create({
        data: { webPromotionId: promotion.id, code, name, email },
      });
      await sendClaimEmail({ to: email, name, promotion, code: claim.code });
      return Response.json({ code: claim.code, used: false }, { status: 201 });
    } catch (err) {
      if (err.code === "P2002" && err.meta?.target?.includes("code")) continue; // code collision, retry
      if (err.code === "P2002") {
        // Someone else claimed this email/promotion concurrently — return that claim's code.
        const raceExisting = await prisma.webPromotionClaim.findUnique({
          where: { webPromotionId_email: { webPromotionId: promotion.id, email } },
        });
        if (raceExisting) {
          await sendClaimEmail({ to: email, name, promotion, code: raceExisting.code });
          return Response.json({ code: raceExisting.code, used: raceExisting.used });
        }
      }
      throw err;
    }
  }

  return apiError("Could not generate a unique code, please try again", 500);
}
