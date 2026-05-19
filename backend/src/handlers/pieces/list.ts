import { withHandler } from "@/utils/handler";
import { parseListQuery } from "@/utils/parsing";
import { ok } from "@/utils/response";
import { listPiecesQuerySchema } from "@/utils/schemas";
import { createPieceUsecase } from "@/usecases/piece-usecase";

const usecase = createPieceUsecase();

export const handler = withHandler({
  handler: async ({ event }) => {
    const { limit, exclusiveStartKey } = parseListQuery(
      event.queryStringParameters,
      listPiecesQuerySchema,
    );
    const page = await usecase.list({ limit, exclusiveStartKey });
    return ok(page);
  },
});
