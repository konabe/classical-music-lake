import { withHandler } from "@/utils/handler";
import { ok } from "@/utils/response";
import { createConcertLogUsecase } from "@/usecases/concert-log-usecase";

const usecase = createConcertLogUsecase();

export const handler = withHandler({
  userId: true,
  handler: async ({ userId }) => {
    const logs = await usecase.list(userId);
    return ok(logs);
  },
});
