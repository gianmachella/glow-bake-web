import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Shared guard for admin-only API routes. Usage:
//   const { unauthorized } = await requireAdmin();
//   if (unauthorized) return unauthorized;
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      session: null,
      unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, unauthorized: null };
}
