// src/app/api/distance/route.js
import { z } from "zod";
import { parseJsonBody } from "@/lib/validate";

const distanceSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
});

export async function POST(req) {
  try {
    const { data: body, response: validationError } = await parseJsonBody(req, distanceSchema);
    if (validationError) return validationError;
    const { origin, destination } = body;

    const apiKey = process.env.OPENROUTE_API_KEY;

    // ✅ Construir la URL dinámica con origin y destination reales
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${origin}&end=${destination}`;

    const routeRes = await fetch(url);
    const routeData = await routeRes.json();

    console.log("💡 OpenRoute raw:", routeData);

    if (!routeData.features) {
      return new Response(
        JSON.stringify({ error: "No route found", details: routeData }),
        { status: 400 }
      );
    }

    const meters = routeData.features[0].properties.summary.distance;
    const miles = meters / 1609.34;

    return Response.json({ miles });
  } catch (err) {
    console.error("Distance API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
