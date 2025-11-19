import prisma from "@/lib/prisma";

export async function GET() {
  return Response.json({
    models: Object.keys(prisma),
  });
}
