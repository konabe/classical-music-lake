import { z } from "zod";

const RATING_MSG = "rating must be between 1 and 5";

const ratingSchema = z.any().superRefine((val, ctx) => {
  if (typeof val !== "number" || !Number.isInteger(val) || val < 1 || val > 5) {
    ctx.addIssue({ code: "custom", message: RATING_MSG });
    return z.NEVER;
  }
}) as z.ZodType<1 | 2 | 3 | 4 | 5>;

const listenedAtSchema = z.iso.datetime({
  error: "listenedAt must be a valid ISO 8601 datetime",
});

const nonEmptyString = (requiredMsg: string) =>
  z.any().superRefine((val, ctx) => {
    if (typeof val !== "string" || val.length === 0) {
      ctx.addIssue({ code: "custom", message: requiredMsg });
      return z.NEVER;
    }
  }) as z.ZodType<string>;

export const createListeningLogSchema = z.object({
  listenedAt: listenedAtSchema,
  composer: nonEmptyString("composer is required"),
  piece: nonEmptyString("piece is required"),
  rating: ratingSchema,
  isFavorite: z.boolean(),
  memo: z.string().optional(),
});

export const updateListeningLogSchema = z.object({
  listenedAt: listenedAtSchema.optional(),
  composer: nonEmptyString("composer is required").optional(),
  piece: nonEmptyString("piece is required").optional(),
  rating: ratingSchema.optional(),
  isFavorite: z.boolean().optional(),
  memo: z.string().optional(),
});
