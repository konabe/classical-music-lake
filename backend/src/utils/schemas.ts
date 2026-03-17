import { z } from "zod";

const ratingSchema = z.unknown().superRefine((val, ctx) => {
  if (typeof val !== "number" || !Number.isInteger(val) || val < 1 || val > 5) {
    ctx.addIssue({ code: "custom", message: "rating must be between 1 and 5" });
  }
});

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

export const createPieceSchema = z.object({
  title: z.string({ error: () => "title is required" }).min(1, "title is required"),
  composer: z.string({ error: () => "composer is required" }).min(1, "composer is required"),
});

export const updatePieceSchema = z.object({
  title: z.string().min(1, "title must be a non-empty string").optional(),
  composer: z.string().min(1, "composer must be a non-empty string").optional(),
});
