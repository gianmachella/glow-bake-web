import crypto from "crypto";

// Generates a short, human-typeable unique code, e.g. "GLOW-4F9A2C1B".
export function generateCouponCode(prefix = "GLOW") {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${random}`;
}
