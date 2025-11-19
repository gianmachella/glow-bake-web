import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.deliverySettings.findUnique({
      where: { id: 1 },
      include: { specialDates: true },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load delivery settings." },
      { status: 500 }
    );
  }
}
