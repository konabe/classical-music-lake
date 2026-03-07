import type { ApiErrorResponse } from "../types";

// CORS ヘッダーと JSON シリアライズは @middy/http-cors・@middy/http-response-serializer が担当。
// ここではステータスコードとボディ構造のみを定義する。

export const ok = (body: unknown) => ({ statusCode: 200, body });

export const created = (body: unknown) => ({ statusCode: 201, body });

export const notFound = (message: string) => {
  const body: ApiErrorResponse = { message };
  return { statusCode: 404, body };
};

export const badRequest = (message: string) => {
  const body: ApiErrorResponse = { message };
  return { statusCode: 400, body };
};

export const internalError = (error: unknown) => {
  console.error(error);
  const body: ApiErrorResponse = { message: "Internal server error" };
  return { statusCode: 500, body };
};

export const noContent = () => ({ statusCode: 204, body: "" });
