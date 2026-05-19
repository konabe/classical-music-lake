import { withHandler } from "@/utils/handler";
import { noContent } from "@/utils/response";
import { ConcertLogId, createConcertLogUsecase } from "@/usecases/concert-log-usecase";

const usecase = createConcertLogUsecase();

export const handler = withHandler({
  idFrom: ConcertLogId.from,
  userId: true,
  handler: async ({ id, userId }) => {
    await usecase.delete(id, userId);
    return noContent();
  },
});
