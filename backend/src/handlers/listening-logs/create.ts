import { withHandler } from "@/utils/handler";
import { createListeningLogSchema } from "@/utils/schemas";
import { created } from "@/utils/response";
import { createListeningLogUsecase } from "@/usecases/listening-log-usecase";
import type { Rating } from "@/types";

const usecase = createListeningLogUsecase();

export const handler = withHandler({
  schema: createListeningLogSchema,
  userId: true,
  handler: async ({ body, userId }) => {
    const log = await usecase.create({
      ...body,
      rating: body.rating as Rating,
      userId: userId.value,
    });
    return created(log);
  },
});
