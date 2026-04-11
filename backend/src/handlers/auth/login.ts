import { StatusCodes } from "http-status-codes";

import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { loginSchema } from "../../utils/schemas";
import { loginUser } from "../../usecases/auth/login-user";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, loginSchema);
  const result = await loginUser(input.email, input.password);
  if (result.success) {
    return { statusCode: StatusCodes.OK, body: result.body };
  }
  return { statusCode: result.statusCode, body: result.body };
}).use(jsonBodyParser);
