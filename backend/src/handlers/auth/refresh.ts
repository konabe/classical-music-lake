import { withHandler } from "@/utils/handler";
import { refreshTokenSchema } from "@/utils/schemas";
import { createAuthUsecase } from "@/usecases/auth-usecase";

const usecase = createAuthUsecase();

export const handler = withHandler({
  schema: refreshTokenSchema,
  handler: async ({ body }) => usecase.refreshToken(body.refreshToken),
});
