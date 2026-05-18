import { withHandler } from "@/utils/handler";
import { updateConcertLogSchema } from "@/utils/schemas";
import { ok } from "@/utils/response";
import { ConcertLogId, createConcertLogUsecase } from "@/usecases/concert-log-usecase";

const usecase = createConcertLogUsecase();

export const handler = withHandler({
  idFrom: ConcertLogId.from,
  schema: updateConcertLogSchema,
  userId: true,
  handler: async ({ id, body, userId }) => {
    const updated = await usecase.update(id, body, userId);
    return ok(updated);
  },
});
