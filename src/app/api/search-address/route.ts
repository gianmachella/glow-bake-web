import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
        q
      )}&viewbox=-97.0,34.0,-95.5,32.5&bounded=1`,
      {
        headers: {
          "User-Agent": "GlowBakeApp/1.0 (glowbake.com)", // 👈 IMPORTANTE
        },
      }
    );

    if (!res.ok) {
      console.error("❌ Error Nominatim status:", res.status);
      return NextResponse.json([], { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Error Nominatim:", err);
    return NextResponse.json([], { status: 500 });
  }
}
