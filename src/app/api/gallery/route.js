import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/apiAuth";
import { parseJsonBody } from "@/lib/validate";
import { apiError, apiSuccess } from "@/lib/apiResponse";

const ALLOWED_TYPES = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "video/mp4": "VIDEO",
  "video/quicktime": "VIDEO", // .mov
};

async function uploadGalleryFile(file) {
  const filename = `gallery/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("cookies")
    .upload(filename, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  return supabase.storage.from("cookies").getPublicUrl(filename).data.publicUrl;
}

const updateSchema = z.object({
  id: z.string().min(1),
  published: z.boolean().optional(),
  caption: z.string().optional(),
});

// GET /api/gallery — admin: every media item, in display order.
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const items = await prisma.galleryMedia.findMany({ orderBy: { order: "asc" } });
    return apiSuccess(items);
  } catch (err) {
    console.error("❌ Error GET /api/gallery:", err);
    return apiError(err.message, 500);
  }
}

// POST /api/gallery — admin: upload a photo or video. New items are appended
// to the end of the display order.
export async function POST(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const caption = formData.get("caption") || null;

    if (!file || typeof file !== "object" || !file.size) {
      return apiError("A file is required", 400);
    }

    const type = ALLOWED_TYPES[file.type];
    if (!type) {
      return apiError(
        "Unsupported file type. Allowed: JPEG, PNG, WEBP, MP4, MOV",
        400
      );
    }

    const url = await uploadGalleryFile(file);

    const last = await prisma.galleryMedia.findFirst({ orderBy: { order: "desc" } });
    const order = (last?.order ?? -1) + 1;

    const item = await prisma.galleryMedia.create({
      data: { url, type, caption, order },
    });

    return apiSuccess(item, 201);
  } catch (err) {
    console.error("❌ Error POST /api/gallery:", err);
    return apiError(err.message, 500);
  }
}

// PUT /api/gallery — admin: toggle published / edit caption.
export async function PUT(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { data, response } = await parseJsonBody(req, updateSchema);
    if (response) return response;

    const { id, ...rest } = data;
    const updated = await prisma.galleryMedia.update({ where: { id }, data: rest });
    return apiSuccess(updated);
  } catch (err) {
    console.error("❌ Error PUT /api/gallery:", err);
    return apiError(err.message, 500);
  }
}

// DELETE /api/gallery — admin: remove a media item.
export async function DELETE(req) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return apiError("Missing id", 400);

    await prisma.galleryMedia.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error DELETE /api/gallery:", err);
    return apiError(err.message, 500);
  }
}
