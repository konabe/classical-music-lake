import { withHandler } from "@/utils/handler";
import { loginSchema } from "@/utils/schemas";
import { createAuthUsecase } from "@/usecases/auth-usecase";

const usecase = createAuthUsecase();

export const handler = withHandler({
  schema: loginSchema,
  handler: async ({ body }) => usecase.login(body.email, body.password),
});
