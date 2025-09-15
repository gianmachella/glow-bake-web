import { Buffer } from "buffer";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

const uploadDir = path.join(process.cwd(), "public", "images", "cookies");

async function recalcCookieCost(cookieId) {
  const recipes = await prisma.recipe.findMany({
    where: { cookieId },
    include: { baseDough: true, ingredients: true },
  });

  if (!recipes.length) return 0;

  return recipes.reduce((acc, r) => acc + r.totalCost, 0);
}

// 📍 GET
export async function GET() {
  try {
    const cookies = await prisma.cookie.findMany({
      where: { visible: true }, // 👈 solo cookies visibles
      include: {
        recipes: { include: { baseDough: true, ingredients: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify(cookies), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error fetching cookies:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// 📍 POST
export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const price = parseFloat(formData.get("price"));
    const shortDescription = formData.get("shortDescription");
    const description = formData.get("description");
    const ingredients = formData.get("ingredients");
    const visible = formData.get("visible") === "true";

    const files = formData.getAll("images").slice(0, 2);
    const uploads = [];

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    for (const file of files) {
      if (file && typeof file === "object") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name}`;
        fs.writeFileSync(path.join(uploadDir, filename), buffer);
        uploads.push(`/images/cookies/${filename}`);
      }
    }

    const cookie = await prisma.cookie.create({
      data: {
        name,
        price,
        shortDescription,
        description,
        ingredients,
        visible,
        image: uploads[0] || null,
        images: uploads,
      },
    });

    const cost = await recalcCookieCost(cookie.id);
    const updated = await prisma.cookie.update({
      where: { id: cookie.id },
      data: { cost },
    });

    return new Response(JSON.stringify(updated), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error creando cookie:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// 📍 PUT
export async function PUT(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const id = formData.get("id");
      const updates = {
        name: formData.get("name"),
        price: parseFloat(formData.get("price")),
        shortDescription: formData.get("shortDescription"),
        description: formData.get("description"),
        ingredients: formData.get("ingredients"),
        visible: formData.get("visible") === "true",
      };

      const files = formData.getAll("images").slice(0, 2);
      const uploads = [];
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      for (const file of files) {
        if (file && typeof file === "object") {
          const buffer = Buffer.from(await file.arrayBuffer());
          const filename = `${Date.now()}-${file.name}`;
          fs.writeFileSync(path.join(uploadDir, filename), buffer);
          uploads.push(`/images/cookies/${filename}`);
        }
      }

      if (uploads.length) {
        updates.image = uploads[0];
        updates.images = uploads;
      }

      const cookie = await prisma.cookie.update({
        where: { id },
        data: updates,
      });
      const cost = await recalcCookieCost(cookie.id);
      const updated = await prisma.cookie.update({
        where: { id: cookie.id },
        data: { cost },
      });

      return new Response(JSON.stringify(updated), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { id, ...rest } = body;
    const cookie = await prisma.cookie.update({ where: { id }, data: rest });
    const cost = await recalcCookieCost(cookie.id);
    const updated = await prisma.cookie.update({
      where: { id: cookie.id },
      data: { cost },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error actualizando cookie:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// 📍 DELETE con opción soft/hard
export async function DELETE(req) {
  try {
    const { id, soft } = await req.json();
    if (!id)
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
      });

    if (soft) {
      const updated = await prisma.cookie.update({
        where: { id },
        data: { visible: false },
      });
      return new Response(JSON.stringify(updated), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      await prisma.cookie.delete({ where: { id } });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("❌ Error eliminando cookie:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
