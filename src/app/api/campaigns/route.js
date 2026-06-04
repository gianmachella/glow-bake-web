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

// GET — admin: all campaigns
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(campaigns);
}

// POST — admin: create campaign
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const name = formData.get("name");
  const description = formData.get("description") || null;
  const discountType = formData.get("discountType"); // PERCENTAGE | FIXED
  const discountValue = parseFloat(formData.get("discountValue"));
  const startDate = formData.get("startDate") || null;
  const endDate = formData.get("endDate") || null;
  const active = formData.get("active") === "true";
  const targetType = formData.get("targetType") || "ALL"; // ALL | SPECIFIC
  const targetEmailsRaw = formData.get("targetEmails") || "[]";
  const couponCode = formData.get("couponCode") || null;
  const imageFile = formData.get("image");

  if (!name || !discountType || isNaN(discountValue)) {
    return NextResponse.json({ error: "Name, discountType and discountValue are required" }, { status: 400 });
  }

  let targetEmails = null;
  if (targetType === "SPECIFIC") {
    targetEmails = JSON.parse(targetEmailsRaw);
  }

  let image = null;
  if (imageFile && imageFile.size > 0) {
    image = await uploadImage(imageFile);
  }

  const campaign = await prisma.campaign.create({
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
      targetEmails,
      couponCode: couponCode || null,
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}
