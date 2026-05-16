import { createHandler, jsonBodyParser } from "@/utils/middleware";
import { parseRequestBody } from "@/utils/parsing";
import { resendVerificationCodeSchema } from "@/utils/schemas";
import { createAuthUsecase } from "@/usecases/auth-usecase";

const usecase = createAuthUsecase();

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, resendVerificationCodeSchema);
  return usecase.resendVerificationCode(input.email);
}).use(jsonBodyParser);
