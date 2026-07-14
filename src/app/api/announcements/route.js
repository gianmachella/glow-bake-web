import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { startOfDay } from "@/lib/dateWindow";

async function uploadImage(file) {
  const filename = `announcements/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("cookies")
    .upload(filename, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  return supabase.storage.from("cookies").getPublicUrl(filename).data.publicUrl;
}

// GET — public: returns active announcements valid for today
export async function GET() {
  const now = new Date();
  const announcements = await prisma.announcement.findMany({
    where: {
      enabled: true,
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: startOfDay(now) } }] }],
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(announcements);
}

// POST — admin only: create announcement
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const title = formData.get("title");
  const content = formData.get("content");
  const startDate = formData.get("startDate") || null;
  const endDate = formData.get("endDate") || null;
  const enabled = formData.get("enabled") === "true";
  const alwaysShow = formData.get("alwaysShow") === "true";
  const imageFile = formData.get("image");

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  let image = null;
  if (imageFile && imageFile.size > 0) {
    image = await uploadImage(imageFile);
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      image,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      enabled,
      alwaysShow,
    },
  });

  return NextResponse.json(announcement, { status: 201 });
}
