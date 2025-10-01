import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { id } = await params; // 👈 await porque params es async en Next 13+
    const cookie = await prisma.cookie.findUnique({
      where: { id },
      include: {
        recipes: {
          include: {
            baseDough: true,
            ingredients: {
              include: { ingredient: true },
            },
          },
        },
      },
    });

    if (!cookie) {
      return NextResponse.json({ error: "Cookie not found" }, { status: 404 });
    }

    return NextResponse.json(cookie);
  } catch (error) {
    console.error("❌ Error GET cookie:", error);
    return NextResponse.json(
      { error: error.message || "Error fetching cookie" },
      { status: 500 }
    );
  }
}
