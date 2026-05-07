import type { z } from "zod";
import { AppError } from "@/lib/errors/app-error";

export async function validateJson<TSchema extends z.ZodType>(
  request: Request,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new AppError("Request body must be valid JSON", "VALIDATION_ERROR", 400);
  }

  return schema.parse(body);
}
