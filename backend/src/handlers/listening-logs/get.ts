import { withHandler } from "@/utils/handler";
import { ok } from "@/utils/response";
import { createListeningLogUsecase, ListeningLogId } from "@/usecases/listening-log-usecase";

const usecase = createListeningLogUsecase();

export const handler = withHandler({
  idFrom: ListeningLogId.from,
  userId: true,
  handler: async ({ id, userId }) => ok(await usecase.get(id, userId)),
});
