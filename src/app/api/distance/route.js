// src/app/api/distance/route.js
export async function POST(req) {
  try {
    const { origin, destination } = await req.json();

    if (!origin || !destination) {
      return new Response(JSON.stringify({ error: "Missing params" }), {
        status: 400,
      });
    }

    const apiKey = process.env.OPENROUTE_API_KEY;

    // ✅ Construir la URL dinámica con origin y destination reales
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${origin}&end=${destination}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("💡 OpenRoute raw:", data);

    if (!data.features) {
      return new Response(
        JSON.stringify({ error: "No route found", details: data }),
        { status: 400 }
      );
    }

    const meters = data.features[0].properties.summary.distance;
    const miles = meters / 1609.34;

    return Response.json({ miles });
  } catch (err) {
    console.error("Distance API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
