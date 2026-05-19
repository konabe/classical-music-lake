import { withHandler } from "@/utils/handler";
import { verifyEmailSchema } from "@/utils/schemas";
import { createAuthUsecase } from "@/usecases/auth-usecase";

const usecase = createAuthUsecase();

export const handler = withHandler({
  schema: verifyEmailSchema,
  handler: async ({ body }) => usecase.verifyEmail(body.email, body.code),
});
