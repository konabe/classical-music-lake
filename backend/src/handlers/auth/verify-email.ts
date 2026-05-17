import { createHandler, jsonBodyParser } from "@/utils/middleware";
import { parseRequestBody } from "@/utils/parsing";
import { verifyEmailSchema } from "@/utils/schemas";
import { createAuthUsecase } from "@/usecases/auth-usecase";

const usecase = createAuthUsecase();

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body, verifyEmailSchema);
  return usecase.verifyEmail(input.email, input.code);
}).use(jsonBodyParser);
