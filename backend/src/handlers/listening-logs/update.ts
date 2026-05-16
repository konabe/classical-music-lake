import { withHandler } from "@/utils/handler";
import { updateListeningLogSchema } from "@/utils/schemas";
import { ok } from "@/utils/response";
import { createListeningLogUsecase, ListeningLogId } from "@/usecases/listening-log-usecase";
import type { UpdateListeningLogInput } from "@/types";

const usecase = createListeningLogUsecase();

export const handler = withHandler({
  idFrom: ListeningLogId.from,
  schema: updateListeningLogSchema,
  userId: true,
  handler: async ({ id, body, userId }) => {
    const updated = await usecase.update(id, body as UpdateListeningLogInput, userId);
    return ok(updated);
  },
});
