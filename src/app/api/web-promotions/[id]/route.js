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
  const type = formData.get("type");
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

// PUT — admin: update web promotion
export async function PUT(req, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const existing = await prisma.webPromotion.findUnique({ where: { id: params.id } });
  if (!existing) return apiError("Not found", 404);

  const formData = await req.formData();
  const { data, error } = parseAndValidate(formData);
  if (error) return apiError(error, 400);

  let image = existing.image;
  const removeImage = formData.get("removeImage") === "true";
  const imageFile = formData.get("image");
  if (removeImage) image = null;
  if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
    image = await uploadImage(imageFile);
  }

  const updated = await prisma.webPromotion.update({
    where: { id: params.id },
    data: { ...data, image },
  });

  return NextResponse.json(updated);
}

// DELETE — admin: remove web promotion (and its claims, via cascade)
export async function DELETE(req, { params }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  await prisma.webPromotion.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
