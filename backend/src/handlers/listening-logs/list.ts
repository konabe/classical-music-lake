import { withHandler } from "@/utils/handler";
import { ok } from "@/utils/response";
import { createListeningLogUsecase } from "@/usecases/listening-log-usecase";

const usecase = createListeningLogUsecase();

export const handler = withHandler({
  userId: true,
  handler: async ({ userId }) => ok(await usecase.list(userId)),
});
