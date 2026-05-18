import { withHandler } from "@/utils/handler";
import { ok } from "@/utils/response";
import { ConcertLogId, createConcertLogUsecase } from "@/usecases/concert-log-usecase";

const usecase = createConcertLogUsecase();

export const handler = withHandler({
  idFrom: ConcertLogId.from,
  userId: true,
  handler: async ({ id, userId }) => {
    const log = await usecase.get(id, userId);
    return ok(log);
  },
});
