import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { Piece } from "../../types";

import { handler } from "./list";
import * as pieceRepository from "../../repositories/piece-repository";
import { makePiece } from "../../test/fixtures";

vi.mock("../../repositories/piece-repository", () => ({
  findAll: vi.fn(),
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };
const mockEvent = {} as APIGatewayProxyEvent;

describe("GET /pieces (list)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空リストの場合は 200 で空配列を返す", async () => {
    vi.mocked(pieceRepository.findAll).mockResolvedValueOnce([]);
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body ?? "[]")).toEqual([]);
  });

  it("title の昇順（ja ロケール）でソートして返す", async () => {
    const pieces = [
      makePiece("1", "交響曲第9番"),
      makePiece("2", "アイネ・クライネ・ナハトムジーク"),
      makePiece("3", "春の祭典"),
    ];
    vi.mocked(pieceRepository.findAll).mockResolvedValueOnce(pieces);

    const result = await handler(mockEvent, mockContext, mockCallback);
    const body: Piece[] = JSON.parse(result?.body ?? "[]");

    expect(body).toHaveLength(3);
    const sorted = [...pieces].sort((a, b) => a.title.localeCompare(b.title, "ja"));
    expect(body.map((p) => p.id)).toEqual(sorted.map((p) => p.id));
  });

  it("Repository から取得した全件を返す", async () => {
    const pieces = [
      makePiece("1", "交響曲第9番"),
      makePiece("2", "アイネ・クライネ・ナハトムジーク"),
    ];
    vi.mocked(pieceRepository.findAll).mockResolvedValueOnce(pieces);

    const result = await handler(mockEvent, mockContext, mockCallback);
    const body: Piece[] = JSON.parse(result?.body ?? "[]");

    expect(pieceRepository.findAll).toHaveBeenCalledTimes(1);
    expect(body).toHaveLength(2);
  });

  it("Repository エラー時に 500 を返す", async () => {
    vi.mocked(pieceRepository.findAll).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
