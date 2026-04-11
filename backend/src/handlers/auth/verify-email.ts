import { StatusCodes } from "http-status-codes";

import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { verifyEmailSchema } from "../../utils/schemas";
import { verifyEmail } from "../../usecases/auth/verify-email";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, verifyEmailSchema);
  const result = await verifyEmail(input.email, input.code);
  if (result.success) {
    return { statusCode: StatusCodes.OK, body: result.body };
  }
  return { statusCode: result.statusCode, body: result.body };
}).use(jsonBodyParser);
