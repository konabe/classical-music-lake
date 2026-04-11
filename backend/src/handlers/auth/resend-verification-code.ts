import { StatusCodes } from "http-status-codes";

import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { resendVerificationCodeSchema } from "../../utils/schemas";
import { resendVerificationCode } from "../../usecases/auth/resend-verification-code";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, resendVerificationCodeSchema);
  const result = await resendVerificationCode(input.email);
  if (result.success) {
    return { statusCode: StatusCodes.OK, body: result.body };
  }
  return { statusCode: result.statusCode, body: result.body };
}).use(jsonBodyParser);
