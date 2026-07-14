import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(
      JSON.stringify({ auth: false, message: "❌ No hay sesión activa" }),
      { status: 401 }
    );
  }

  return new Response(JSON.stringify({ auth: true, session }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
