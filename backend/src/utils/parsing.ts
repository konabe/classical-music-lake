import createError from "http-errors";

export function parseRequestBody<T>(body: unknown): T {
  if (body === null || body === undefined) {
    throw new createError.BadRequest("Request body is required");
  }
  if (typeof body !== "object" || Array.isArray(body)) {
    throw new createError.BadRequest("Request body must be a JSON object");
  }
  return body as T;
}
