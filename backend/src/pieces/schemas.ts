import { z } from "zod";

const nonEmptyString = (requiredMsg: string, invalidMsg?: string) =>
  z.any().superRefine((val, ctx) => {
    if (typeof val !== "string" || val.length === 0) {
      ctx.addIssue({ code: "custom", message: invalidMsg ?? requiredMsg });
      return z.NEVER;
    }
  }) as z.ZodType<string>;

export const createPieceSchema = z.object({
  title: nonEmptyString("title is required"),
  composer: nonEmptyString("composer is required"),
});

export const updatePieceSchema = z.object({
  title: nonEmptyString("title must be a non-empty string").optional(),
  composer: nonEmptyString("composer must be a non-empty string").optional(),
});
