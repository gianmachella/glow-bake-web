import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

async function uploadImage(file) {
  const filename = `announcements/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("cookies")
    .upload(filename, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  return supabase.storage.from("cookies").getPublicUrl(filename).data.publicUrl;
}

async function requireAdmin(req) {
  const session = await getServerSession(authOptions);
  if (!session) return false;
  return true;
}

// GET /api/announcements/[id] — admin full list (no date filter)
export async function GET(req, { params }) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const announcement = await prisma.announcement.findUnique({ where: { id: params.id } });
  if (!announcement) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(announcement);
}

// PUT /api/announcements/[id] — update
export async function PUT(req, { params }) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const title = formData.get("title");
  const content = formData.get("content");
  const startDate = formData.get("startDate") || null;
  const endDate = formData.get("endDate") || null;
  const enabled = formData.get("enabled") === "true";
  const alwaysShow = formData.get("alwaysShow") === "true";
  const imageFile = formData.get("image");
  const removeImage = formData.get("removeImage") === "true";

  const existing = await prisma.announcement.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let image = existing.image;
  if (removeImage) image = null;
  if (imageFile && imageFile.size > 0) image = await uploadImage(imageFile);

  const updated = await prisma.announcement.update({
    where: { id: params.id },
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

  return NextResponse.json(updated);
}

// DELETE /api/announcements/[id]
export async function DELETE(req, { params }) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.announcement.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
