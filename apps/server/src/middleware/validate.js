import { AppError } from "./errorHandler.js";

export function parseOrThrow(schema, data) {
  const result = schema.safeParse(data ?? {});
  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid input.";
    throw new AppError(400, "VALIDATION_ERROR", message);
  }
  return result.data;
}
