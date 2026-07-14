import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiResponse";

async function uploadImage(file) {
  const filename = `web-promotions/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("cookies")
    .upload(filename, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  return supabase.storage.from("cookies").getPublicUrl(filename).data.publicUrl;
}

function parseAndValidate(formData) {
  const name = formData.get("name");
  const description = formData.get("description") || null;
  const customInstructions = formData.get("customInstructions") || null;
  const cookieId = formData.get("cookieId") || null; // empty/absent = applies to all cookies
  const type = formData.get("type"); // FIXED | VOLUME
  const discountValue = parseFloat(formData.get("discountValue"));
  const active = formData.get("active") === "true";
  const startDate = formData.get("startDate") || null;
  const endDate = formData.get("endDate") || null;

  let discountType = formData.get("discountType") || "FIXED";
  let minQuantity = parseInt(formData.get("minQuantity"), 10) || 1;

  if (type === "FIXED") {
    discountType = "FIXED";
    minQuantity = 1;
  }

  if (!name || !type || isNaN(discountValue)) {
    return { error: "Name, strategy and discount value are required" };
  }
  if (!["FIXED", "VOLUME"].includes(type)) {
    return { error: "Invalid strategy type" };
  }
  if (type === "VOLUME" && minQuantity < 2) {
    return { error: "Volume discounts require a minimum quantity of at least 2" };
  }

  return {
    data: {
      name,
      description,
      customInstructions,
      cookieId,
      type,
      discountType,
      discountValue,
      minQuantity,
      active,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  };
}

// GET — admin: all web promotions with cookie name + claim stats
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const promotions = await prisma.webPromotion.findMany({
    include: {
      cookie: { select: { name: true } },
      claims: { select: { id: true, used: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(promotions);
}

// POST — admin: create web promotion
export async function POST(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const formData = await req.formData();
  const { data, error } = parseAndValidate(formData);
  if (error) return apiError(error, 400);

  let image = null;
  const imageFile = formData.get("image");
  if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
    image = await uploadImage(imageFile);
  }

  const promotion = await prisma.webPromotion.create({
    data: { ...data, image },
  });

  return NextResponse.json(promotion, { status: 201 });
}
