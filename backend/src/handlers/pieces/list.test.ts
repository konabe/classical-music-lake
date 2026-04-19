import { describe, it, expect, vi, beforeEach } from "vitest";

import { handler } from "./list";
import { makeEvent, makePiece, mockContext, mockCallback } from "../../test/fixtures";
import { encodeCursor } from "../../utils/cursor";
import { PIECES_PAGE_SIZE_DEFAULT, PIECES_PAGE_SIZE_MAX } from "../../types";
import type { Paginated, Piece } from "../../types";

const mockRepo = vi.hoisted(() => {
  return {
    save: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findPage: vi.fn(),
    saveWithOptimisticLock: vi.fn(),
    remove: vi.fn(),
  };
});

vi.mock("../../repositories/piece-repository", () => {
  return {
    DynamoDBPieceRepository: vi.fn().mockImplementation(function () {
      return mockRepo;
    }),
  };
});

const parseBody = (result: { body?: string } | null | undefined): Paginated<Piece> => {
  return JSON.parse(result?.body ?? '{"items":[],"nextCursor":null}') as Paginated<Piece>;
};

describe("GET /pieces (list)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("正常系", () => {
    it("空の場合は items=[], nextCursor=null を返す", async () => {
      mockRepo.findPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });

      const result = await handler(makeEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(200);
      const body = parseBody(result);
      expect(body.items).toEqual([]);
      expect(body.nextCursor).toBeNull();
    });

    it("Repository から取得したアイテムを items に入れて返す", async () => {
      const pieces = [makePiece("1", "交響曲第9番"), makePiece("2", "アイーダ")];
      mockRepo.findPage.mockResolvedValueOnce({ items: pieces, lastEvaluatedKey: undefined });

      const result = await handler(makeEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(200);
      const body = parseBody(result);
      expect(body.items).toEqual(pieces);
      expect(body.nextCursor).toBeNull();
    });

    it("limit 未指定の場合は既定値で findPage を呼ぶ", async () => {
      mockRepo.findPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });

      await handler(makeEvent(), mockContext, mockCallback);

      expect(mockRepo.findPage).toHaveBeenCalledWith({
        limit: PIECES_PAGE_SIZE_DEFAULT,
        exclusiveStartKey: undefined,
      });
    });

    it("limit クエリを指定すると数値変換して findPage に渡す", async () => {
      mockRepo.findPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });

      await handler(
        makeEvent({ queryStringParameters: { limit: "20" } }),
        mockContext,
        mockCallback
      );

      expect(mockRepo.findPage).toHaveBeenCalledWith({
        limit: 20,
        exclusiveStartKey: undefined,
      });
    });

    it("cursor クエリを指定するとデコードして exclusiveStartKey として findPage に渡す", async () => {
      mockRepo.findPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });
      const cursor = encodeCursor({ id: "piece-prev" });

      await handler(makeEvent({ queryStringParameters: { cursor } }), mockContext, mockCallback);

      expect(mockRepo.findPage).toHaveBeenCalledWith({
        limit: PIECES_PAGE_SIZE_DEFAULT,
        exclusiveStartKey: { id: "piece-prev" },
      });
    });

    it("LastEvaluatedKey がある場合はエンコードして nextCursor に入れて返す", async () => {
      mockRepo.findPage.mockResolvedValueOnce({
        items: [makePiece("1", "a")],
        lastEvaluatedKey: { id: "piece-1" },
      });

      const result = await handler(makeEvent(), mockContext, mockCallback);
      const body = parseBody(result);

      expect(body.nextCursor).not.toBeNull();
      expect(typeof body.nextCursor).toBe("string");
    });

    it("LastEvaluatedKey なしの場合は nextCursor が null", async () => {
      mockRepo.findPage.mockResolvedValueOnce({
        items: [makePiece("1", "a")],
        lastEvaluatedKey: undefined,
      });

      const result = await handler(makeEvent(), mockContext, mockCallback);
      const body = parseBody(result);

      expect(body.nextCursor).toBeNull();
    });

    it("LastEvaluatedKey があるが Items が空でも nextCursor を返す", async () => {
      mockRepo.findPage.mockResolvedValueOnce({
        items: [],
        lastEvaluatedKey: { id: "piece-x" },
      });

      const result = await handler(makeEvent(), mockContext, mockCallback);
      const body = parseBody(result);

      expect(body.items).toEqual([]);
      expect(body.nextCursor).not.toBeNull();
    });

    it("ラウンドトリップ: 前ページの nextCursor を次リクエストの cursor として利用できる", async () => {
      mockRepo.findPage.mockResolvedValueOnce({
        items: [makePiece("1", "a")],
        lastEvaluatedKey: { id: "piece-1" },
      });

      const firstResult = await handler(makeEvent(), mockContext, mockCallback);
      const { nextCursor } = parseBody(firstResult);
      expect(nextCursor).not.toBeNull();

      mockRepo.findPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });

      await handler(
        makeEvent({ queryStringParameters: { cursor: nextCursor ?? "" } }),
        mockContext,
        mockCallback
      );

      expect(mockRepo.findPage).toHaveBeenLastCalledWith({
        limit: PIECES_PAGE_SIZE_DEFAULT,
        exclusiveStartKey: { id: "piece-1" },
      });
    });
  });

  describe("異常系", () => {
    it("limit が 0 の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({ queryStringParameters: { limit: "0" } }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("limit が 上限超過の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({ queryStringParameters: { limit: String(PIECES_PAGE_SIZE_MAX + 1) } }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("limit が数値でない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({ queryStringParameters: { limit: "abc" } }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("cursor が不正な base64url 文字の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({ queryStringParameters: { cursor: "!!!invalid!!!" } }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("cursor が base64url として正しいが JSON デコード不能な場合は 400 を返す", async () => {
      const cursor = Buffer.from("not a json", "utf8").toString("base64url");
      const result = await handler(
        makeEvent({ queryStringParameters: { cursor } }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("cursor のバージョンが未知の場合は 400 を返す", async () => {
      const cursor = Buffer.from(JSON.stringify({ v: 999, k: { id: "1" } }), "utf8").toString(
        "base64url"
      );
      const result = await handler(
        makeEvent({ queryStringParameters: { cursor } }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("Repository エラー時に 500 を返す", async () => {
      mockRepo.findPage.mockRejectedValueOnce(new Error("DynamoDB error"));
      const result = await handler(makeEvent(), mockContext, mockCallback);
      expect(result?.statusCode).toBe(500);
    });
  });
});
