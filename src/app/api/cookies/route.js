// src/app/api/cookies/route.js
import { Buffer } from "buffer";
import prisma from "@/lib/prisma"; // ✅ solo este, sin duplicar
import { supabase } from "@/lib/supabase";

// 📍 GET → lista todas las cookies
export async function GET() {
  try {
    const cookies = await prisma.cookie.findMany();
    return Response.json(cookies);
  } catch (err) {
    console.error("❌ Error fetching cookies:", err);
    return Response.json([], { status: 200 }); // devolvemos [] para no romper el FE
  }
}

// 📍 POST → crea cookie con imágenes
export async function POST(req) {
  try {
    const formData = await req.formData();

    const name = formData.get("name");
    const price = parseFloat(formData.get("price"));
    const shortDescription = formData.get("shortDescription");
    const description = formData.get("description");
    const ingredients = formData.get("ingredients");

    const files = formData.getAll("images");
    const uploads = [];

    for (const file of files) {
      if (file && typeof file === "object") {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const filename = `${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from("cookies")
          .upload(filename, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("cookies")
          .getPublicUrl(filename);

        uploads.push(urlData.publicUrl);
      }
    }

    const cookie = await prisma.cookie.create({
      data: {
        name,
        price,
        shortDescription,
        description,
        ingredients,
        image: uploads[0] || null,
        images: uploads, // ✅ en tu schema ya debe ser Json o String[]
      },
    });

    return new Response(JSON.stringify(cookie), { status: 201 });
  } catch (err) {
    console.error("❌ Error creando cookie:", err);
    return new Response(
      JSON.stringify({ error: "Error creando cookie", details: err.message }),
      { status: 500 }
    );
  }
}

// 📍 PUT → editar cookie existente
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    const cookie = await prisma.cookie.update({
      where: { id },
      data: updates,
    });

    return new Response(JSON.stringify(cookie), { status: 200 });
  } catch (err) {
    console.error("❌ Error actualizando cookie:", err);
    return new Response(
      JSON.stringify({
        error: "Error actualizando cookie",
        details: err.message,
      }),
      { status: 500 }
    );
  }
}

// 📍 DELETE → eliminar cookie
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    await prisma.cookie.delete({ where: { id } });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("❌ Error eliminando cookie:", err);
    return new Response(
      JSON.stringify({
        error: "Error eliminando cookie",
        details: err.message,
      }),
      { status: 500 }
    );
  }
}
