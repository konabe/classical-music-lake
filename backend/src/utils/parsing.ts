import createError from "http-errors";
import type { ZodType } from "zod";

import { decodeCursor, InvalidCursorError } from "./cursor";

export function parseRequestBody<T>(body: unknown, schema?: ZodType<T>): T {
  if (body === null || body === undefined) {
    throw new createError.BadRequest("Request body is required");
  }
  if (typeof body !== "object" || Array.isArray(body)) {
    throw new createError.BadRequest("Request body must be a JSON object");
  }
  if (schema !== undefined) {
    const result = schema.safeParse(body);
    if (!result.success) {
      throw new createError.BadRequest(result.error.issues[0].message);
    }
    return result.data;
  }
  return body as T;
}

type ListQueryInput = { limit: number; cursor?: string };

export interface ListQueryOutput {
  limit: number;
  exclusiveStartKey?: Record<string, unknown>;
}

/**
 * カーソル型ページング API（`GET /pieces`・`GET /composers` など）のクエリパラメータを検証し、
 * `limit` とデコード済み `exclusiveStartKey` を返す。
 *
 * スキーマ検証失敗・不正カーソルはいずれも `400 Bad Request` として投げる。
 */
export function parseListQuery(
  queryParams: Record<string, string | undefined> | null | undefined,
  schema: ZodType<ListQueryInput>,
): ListQueryOutput {
  const parsed = schema.safeParse(queryParams ?? {});
  if (!parsed.success) {
    throw new createError.BadRequest(parsed.error.issues[0]?.message ?? "Invalid query parameter");
  }
  const { limit, cursor } = parsed.data;

  if (cursor === undefined) {
    return { limit, exclusiveStartKey: undefined };
  }

  try {
    return { limit, exclusiveStartKey: decodeCursor(cursor) };
  } catch (err) {
    if (err instanceof InvalidCursorError) {
      throw new createError.BadRequest(err.message);
    }
    throw err;
  }
}
