import { withHandler } from "@/utils/handler";
import { createConcertLogSchema } from "@/utils/schemas";
import { created } from "@/utils/response";
import { createConcertLogUsecase } from "@/usecases/concert-log-usecase";

const usecase = createConcertLogUsecase();

export const handler = withHandler({
  schema: createConcertLogSchema,
  userId: true,
  handler: async ({ body, userId }) => {
    const log = await usecase.create(body, userId);
    return created(log);
  },
});
