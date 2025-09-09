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

    // 👇 Debug temporal con coordenadas fijas
    const testUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=-96.502784,33.190223&end=-96.636885,33.130533`;

    const response = await fetch(testUrl);
    const data = await response.json();

    console.log("💡 OpenRoute raw:", data);

    if (!data.features) {
      return new Response(
        JSON.stringify({ error: "No route found", details: data }),
        {
          status: 400,
        }
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
