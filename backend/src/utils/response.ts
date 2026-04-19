import { StatusCodes } from "http-status-codes";

export const ok = (body: unknown) => {
  return {
    statusCode: StatusCodes.OK,
    body,
  };
};

export const created = (body: unknown) => {
  return {
    statusCode: StatusCodes.CREATED,
    body,
  };
};

export const noContent = () => {
  return {
    statusCode: StatusCodes.NO_CONTENT,
    body: "",
  };
};

export const badRequest = (error: string, message: string) => {
  return {
    statusCode: StatusCodes.BAD_REQUEST,
    body: { error, message },
  };
};

export const unauthorized = (error: string, message: string) => {
  return {
    statusCode: StatusCodes.UNAUTHORIZED,
    body: { error, message },
  };
};

export const forbidden = (error: string, message: string) => {
  return {
    statusCode: StatusCodes.FORBIDDEN,
    body: { error, message },
  };
};

export const tooManyRequests = (message = "Too many attempts. Please try again later.") => {
  return {
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    body: { error: "TooManyRequests", message },
  };
};

export const internalError = () => {
  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    body: { message: "Internal server error" },
  };
};
