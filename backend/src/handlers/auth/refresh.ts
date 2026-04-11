import { StatusCodes } from "http-status-codes";

import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { refreshTokenSchema } from "../../utils/schemas";
import { createAuthUsecase } from "../../usecases/auth-usecase";

const usecase = createAuthUsecase();

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, refreshTokenSchema);
  const result = await usecase.refreshToken(input.refreshToken);
  if (result.success) {
    return { statusCode: StatusCodes.OK, body: result.body };
  }
  return { statusCode: result.statusCode, body: result.body };
}).use(jsonBodyParser);
