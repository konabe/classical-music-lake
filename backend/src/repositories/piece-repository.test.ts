import { describe, it, expect } from "vitest";

import { DynamoDBPieceRepository } from "./piece-repository";
import type { Piece } from "../types";

const normalizeLegacyVideoUrl = DynamoDBPieceRepository.normalizeLegacyVideoUrl;

const basePiece: Piece = {
  kind: "work",
  id: "piece-1",
  title: "交響曲第9番",
  composerId: "00000000-0000-4000-8000-000000000001",
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

describe("normalizeLegacyVideoUrl", () => {
  it("undefined はそのまま undefined を返す", () => {
    expect(normalizeLegacyVideoUrl(undefined)).toBeUndefined();
  });

  it("videoUrl も videoUrls もない Piece はそのまま返す", () => {
    const result = normalizeLegacyVideoUrl(basePiece);
    expect(result).toEqual(basePiece);
  });

  it("videoUrls だけを持つ Piece はそのまま返す", () => {
    const piece: Piece = { ...basePiece, videoUrls: ["https://www.youtube.com/watch?v=abc"] };
    const result = normalizeLegacyVideoUrl(piece);
    expect(result).toEqual(piece);
  });

  it("レガシー videoUrl のみを持つ Piece は videoUrls 配列に変換される", () => {
    const legacy = { ...basePiece, videoUrl: "https://www.youtube.com/watch?v=abc" } as Piece;
    const result = normalizeLegacyVideoUrl(legacy);
    expect(result?.videoUrls).toEqual(["https://www.youtube.com/watch?v=abc"]);
    expect((result as Piece & { videoUrl?: string }).videoUrl).toBeUndefined();
  });

  it("空文字の videoUrl は無視される（videoUrls には含めない）", () => {
    const legacy = { ...basePiece, videoUrl: "" } as Piece;
    const result = normalizeLegacyVideoUrl(legacy);
    expect(result?.videoUrls).toBeUndefined();
    expect((result as Piece & { videoUrl?: string }).videoUrl).toBeUndefined();
  });

  it("videoUrls がすでに存在する場合はレガシー videoUrl を捨て、新フィールドを優先する", () => {
    const data = {
      ...basePiece,
      videoUrl: "https://legacy.example/video",
      videoUrls: ["https://new.example/video"],
    } as Piece;
    const result = normalizeLegacyVideoUrl(data);
    expect(result?.videoUrls).toEqual(["https://new.example/video"]);
    expect((result as Piece & { videoUrl?: string }).videoUrl).toBeUndefined();
  });
});
