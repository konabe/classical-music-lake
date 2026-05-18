import { withHandler } from "@/utils/handler";
import { resendVerificationCodeSchema } from "@/utils/schemas";
import { createAuthUsecase } from "@/usecases/auth-usecase";

const usecase = createAuthUsecase();

export const handler = withHandler({
  schema: resendVerificationCodeSchema,
  handler: async ({ body }) => usecase.resendVerificationCode(body.email),
});
