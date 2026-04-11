import { randomUUID } from "node:crypto";

import type { CreatePieceInput, Piece, UpdatePieceInput } from "../types";

const CLEARABLE_FIELDS = ["videoUrl", "genre", "era", "formation", "region"] as const;

export const buildPiece = (input: CreatePieceInput): Piece => {
  const now = new Date().toISOString();
  return {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
};

export const mergePieceUpdate = (current: Piece, input: UpdatePieceInput): Piece => {
  const merged: Piece = {
    ...current,
    ...input,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
  // クリア可能なフィールドの値が空文字列の場合、キーごと削除する（フロントから空文字を送信してフィールドをクリアする仕様）
  const cleared = Object.fromEntries(
    Object.entries(merged).filter(
      ([key, value]) => !(CLEARABLE_FIELDS as readonly string[]).includes(key) || value !== ""
    )
  ) as Piece;
  return cleared;
};

export const sortPiecesByTitleJa = (pieces: Piece[]): Piece[] =>
  [...pieces].sort((a, b) => a.title.localeCompare(b.title, "ja"));
