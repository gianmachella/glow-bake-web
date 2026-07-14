import { NextResponse } from "next/server";

export function apiError(message, status = 500, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function apiSuccess(data, status = 200) {
  return NextResponse.json(data, { status });
}
