import type { APIGatewayProxyResult } from "aws-lambda";
import type { ApiErrorResponse } from "../types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.CORS_ALLOW_ORIGIN ?? "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Content-Type": "application/json",
};

export function ok(body: unknown): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function created(body: unknown): APIGatewayProxyResult {
  return {
    statusCode: 201,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function notFound(message: string): APIGatewayProxyResult {
  const body: ApiErrorResponse = { message };
  return {
    statusCode: 404,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function badRequest(message: string): APIGatewayProxyResult {
  const body: ApiErrorResponse = { message };
  return {
    statusCode: 400,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function internalError(error: unknown): APIGatewayProxyResult {
  console.error(error);
  const body: ApiErrorResponse = { message: "Internal server error" };
  return {
    statusCode: 500,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function noContent(): APIGatewayProxyResult {
  return {
    statusCode: 204,
    headers: CORS_HEADERS,
    body: "",
  };
}
