import { withHandler } from "../../utils/handler";
import { noContent } from "../../utils/response";
import { createListeningLogUsecase, ListeningLogId } from "../../usecases/listening-log-usecase";

const usecase = createListeningLogUsecase();

export const handler = withHandler({
  idFrom: ListeningLogId.from,
  userId: true,
  handler: async ({ id, userId }) => {
    await usecase.delete(id, userId);
    return noContent();
  },
});
