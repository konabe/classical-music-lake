import { z } from "zod";

const ratingSchema = z
  .number({ error: () => "rating must be between 1 and 5" })
  .int({ message: "rating must be between 1 and 5" })
  .min(1, { message: "rating must be between 1 and 5" })
  .max(5, { message: "rating must be between 1 and 5" });

export const createListeningLogSchema = z.object({
  listenedAt: z.iso.datetime({ offset: false }),
  composer: z
    .string()
    .trim()
    .min(1, "composer must be a non-empty string")
    .max(100, "composer must be 100 characters or less"),
  piece: z
    .string()
    .trim()
    .min(1, "piece must be a non-empty string")
    .max(200, "piece must be 200 characters or less"),
  rating: ratingSchema,
  isFavorite: z.boolean(),
  memo: z.string().trim().max(1000, "memo must be 1000 characters or less").optional(),
});

export const updateListeningLogSchema = createListeningLogSchema.partial();

export const createPieceSchema = z.object({
  title: z
    .string({ error: () => "title is required" })
    .trim()
    .min(1, "title is required")
    .max(200, "title must be 200 characters or less"),
  composer: z
    .string({ error: () => "composer is required" })
    .trim()
    .min(1, "composer is required")
    .max(100, "composer must be 100 characters or less"),
});

export const updatePieceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "title must be a non-empty string")
    .max(200, "title must be 200 characters or less")
    .optional(),
  composer: z
    .string()
    .trim()
    .min(1, "composer must be a non-empty string")
    .max(100, "composer must be 100 characters or less")
    .optional(),
});

const emailSchema = z
  .string({ error: () => "email is required" })
  .trim()
  .email("email must be a valid email address");

const passwordSchema = z
  .string({ error: () => "password is required" })
  .min(8, "password must be at least 8 characters long")
  .regex(/[A-Z]/, "password must contain at least one uppercase letter")
  .regex(/[a-z]/, "password must contain at least one lowercase letter")
  .regex(/\d/, "password must contain at least one digit");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
