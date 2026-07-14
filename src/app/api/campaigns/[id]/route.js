import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

async function uploadImage(file) {
  const filename = `campaigns/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("cookies")
    .upload(filename, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  return supabase.storage.from("cookies").getPublicUrl(filename).data.publicUrl;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session;
}

// PUT — update campaign
export async function PUT(req, { params }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const name = formData.get("name");
  const description = formData.get("description") || null;
  const discountType = formData.get("discountType");
  const discountValue = parseFloat(formData.get("discountValue"));
  const startDate = formData.get("startDate") || null;
  const endDate = formData.get("endDate") || null;
  const active = formData.get("active") === "true";
  const targetType = formData.get("targetType") || "ALL";
  const targetEmailsRaw = formData.get("targetEmails") || "[]";
  const couponCode = formData.get("couponCode") || null;
  const imageFile = formData.get("image");
  const removeImage = formData.get("removeImage") === "true";

  const existing = await prisma.campaign.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let image = existing.image;
  if (removeImage) image = null;
  if (imageFile && imageFile.size > 0) image = await uploadImage(imageFile);

  const updated = await prisma.campaign.update({
    where: { id: params.id },
    data: {
      name,
      description,
      discountType,
      discountValue,
      image,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      active,
      targetType,
      targetEmails: targetType === "SPECIFIC" ? JSON.parse(targetEmailsRaw) : null,
      couponCode: couponCode || null,
    },
  });

  return NextResponse.json(updated);
}

// DELETE — remove campaign
export async function DELETE(req, { params }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.campaign.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
