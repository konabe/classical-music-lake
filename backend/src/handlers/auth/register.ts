import { StatusCodes } from "http-status-codes";

import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { registerSchema } from "../../utils/schemas";
import { registerUser } from "../../usecases/auth/register-user";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, registerSchema);
  const result = await registerUser(input.email, input.password);
  if (result.success) {
    return { statusCode: StatusCodes.CREATED, body: result.body };
  }
  return { statusCode: result.statusCode, body: result.body };
}).use(jsonBodyParser);
