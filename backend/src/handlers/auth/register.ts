import { createHandler, jsonBodyParser } from "@/utils/middleware";
import { parseRequestBody } from "@/utils/parsing";
import { registerSchema } from "@/utils/schemas";
import { createAuthUsecase } from "@/usecases/auth-usecase";

const usecase = createAuthUsecase();

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body, registerSchema);
  return usecase.register(input.email, input.password);
}).use(jsonBodyParser);
