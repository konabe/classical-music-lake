import { StatusCodes } from "http-status-codes";

export const ok = (body: Record<string, unknown>) => ({
  statusCode: StatusCodes.OK,
  body,
});

export const created = (body: Record<string, unknown>) => ({
  statusCode: StatusCodes.CREATED,
  body,
});

export const badRequest = (error: string, message: string) => ({
  statusCode: StatusCodes.BAD_REQUEST,
  body: { error, message },
});

export const unauthorized = (error: string, message: string) => ({
  statusCode: StatusCodes.UNAUTHORIZED,
  body: { error, message },
});

export const forbidden = (error: string, message: string) => ({
  statusCode: StatusCodes.FORBIDDEN,
  body: { error, message },
});

export const tooManyRequests = (message = "Too many attempts. Please try again later.") => ({
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
  body: { error: "TooManyRequests", message },
});

export const internalError = () => ({
  statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
  body: { message: "Internal server error" },
});
