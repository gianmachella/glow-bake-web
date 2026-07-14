import { apiError } from "@/lib/apiResponse";

// Parses a request's JSON body against a zod schema.
// Returns { data } on success, or { response } (a 400 to return as-is) on failure.
export async function parseJsonBody(req, schema) {
  let body;
  try {
    body = await req.json();
  } catch {
    return { response: apiError("Invalid JSON body", 400) };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      response: apiError("Validation failed", 400, {
        details: result.error.flatten().fieldErrors,
      }),
    };
  }
  return { data: result.data };
}
