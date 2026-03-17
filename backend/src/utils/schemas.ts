import { z } from "zod";

const ratingSchema = z
  .number({ error: () => "rating must be between 1 and 5" })
  .int({ message: "rating must be between 1 and 5" })
  .min(1, { message: "rating must be between 1 and 5" })
  .max(5, { message: "rating must be between 1 and 5" });

export const createListeningLogSchema = z.object({
  listenedAt: z.iso.datetime({ offset: false }),
  composer: z.string().min(1),
  piece: z.string().min(1),
  rating: ratingSchema,
  isFavorite: z.boolean(),
  memo: z.string().optional(),
});

export const updateListeningLogSchema = createListeningLogSchema.partial();

export const createPieceSchema = z.object({
  title: z.string({ error: () => "title is required" }).min(1, "title is required"),
  composer: z.string({ error: () => "composer is required" }).min(1, "composer is required"),
});

export const updatePieceSchema = z.object({
  title: z.string().min(1, "title must be a non-empty string").optional(),
  composer: z.string().min(1, "composer must be a non-empty string").optional(),
});
