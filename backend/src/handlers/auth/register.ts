import { withHandler } from "@/utils/handler";
import { registerSchema } from "@/utils/schemas";
import { createAuthUsecase } from "@/usecases/auth-usecase";

const usecase = createAuthUsecase();

export const handler = withHandler({
  schema: registerSchema,
  handler: async ({ body }) => usecase.register(body.email, body.password),
});
