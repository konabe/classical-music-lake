import { withHandler } from "@/utils/handler";
import { createPieceSchema } from "@/utils/schemas";
import { created } from "@/utils/response";
import { createPieceUsecase } from "@/usecases/piece-usecase";

const usecase = createPieceUsecase();

export const handler = withHandler({
  admin: true,
  schema: createPieceSchema,
  handler: async ({ body }) => {
    const piece = await usecase.create(body);
    return created(piece);
  },
});
