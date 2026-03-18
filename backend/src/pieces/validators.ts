import createError from "http-errors";
import { createPieceSchema } from "../utils/schemas";

export function validatePieceTitle(title: unknown): void {
  const result = createPieceSchema.shape.title.safeParse(title);
  if (!result.success) {
    throw new createError.BadRequest(result.error.issues[0]?.message ?? "title is invalid");
  }
}

export function validatePieceComposer(composer: unknown): void {
  const result = createPieceSchema.shape.composer.safeParse(composer);
  if (!result.success) {
    throw new createError.BadRequest(result.error.issues[0]?.message ?? "composer is invalid");
  }
}
