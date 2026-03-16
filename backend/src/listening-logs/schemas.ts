import { z } from "zod";

const RATING_MSG = "rating must be between 1 and 5";

const ratingSchema = z.any().superRefine((val, ctx) => {
  if (typeof val !== "number" || !Number.isInteger(val) || val < 1 || val > 5) {
    ctx.addIssue({ code: "custom", message: RATING_MSG });
    return z.NEVER;
  }
}) as z.ZodType<1 | 2 | 3 | 4 | 5>;

export const createListeningLogSchema = z.object({
  listenedAt: z.string(),
  composer: z.string(),
  piece: z.string(),
  rating: ratingSchema,
  isFavorite: z.boolean(),
  memo: z.string().optional(),
});

export const updateListeningLogSchema = z.object({
  listenedAt: z.string().optional(),
  composer: z.string().optional(),
  piece: z.string().optional(),
  rating: ratingSchema.optional(),
  isFavorite: z.boolean().optional(),
  memo: z.string().optional(),
});
