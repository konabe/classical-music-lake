import { describe, it, expect, vi, beforeEach } from "vitest";

import { handler } from "./list";
import { makeEvent, makeComposer, mockContext, mockCallback } from "../../test/fixtures";
import { encodeCursor } from "../../utils/cursor";
import { COMPOSERS_PAGE_SIZE_DEFAULT, COMPOSERS_PAGE_SIZE_MAX } from "../../types";
import type { Composer, Paginated } from "../../types";

const mockRepo = vi.hoisted(() => ({
  save: vi.fn(),
  findById: vi.fn(),
  findPage: vi.fn(),
  saveWithOptimisticLock: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("../../repositories/composer-repository", () => ({
  DynamoDBComposerRepository: vi.fn().mockImplementation(function () {
    return mockRepo;
  }),
}));

const parseBody = (result: { body?: string } | null | undefined): Paginated<Composer> =>
  JSON.parse(result?.body ?? '{"items":[],"nextCursor":null}') as Paginated<Composer>;

describe("GET /composers (list)", () => {
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
      const composers = [makeComposer("1", "ベートーヴェン"), makeComposer("2", "モーツァルト")];
      mockRepo.findPage.mockResolvedValueOnce({ items: composers, lastEvaluatedKey: undefined });

      const result = await handler(makeEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(200);
      const body = parseBody(result);
      expect(body.items).toEqual(composers);
      expect(body.nextCursor).toBeNull();
    });

    it("limit 未指定の場合は既定値で findPage を呼ぶ", async () => {
      mockRepo.findPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });

      await handler(makeEvent(), mockContext, mockCallback);

      expect(mockRepo.findPage).toHaveBeenCalledWith({
        limit: COMPOSERS_PAGE_SIZE_DEFAULT,
        exclusiveStartKey: undefined,
      });
    });

    it("limit クエリを指定すると数値変換して findPage に渡す", async () => {
      mockRepo.findPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });

      await handler(
        makeEvent({ queryStringParameters: { limit: "20" } }),
        mockContext,
        mockCallback,
      );

      expect(mockRepo.findPage).toHaveBeenCalledWith({
        limit: 20,
        exclusiveStartKey: undefined,
      });
    });

    it("cursor クエリを指定するとデコードして exclusiveStartKey として findPage に渡す", async () => {
      mockRepo.findPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });
      const cursor = encodeCursor({ id: "composer-prev" });

      await handler(makeEvent({ queryStringParameters: { cursor } }), mockContext, mockCallback);

      expect(mockRepo.findPage).toHaveBeenCalledWith({
        limit: COMPOSERS_PAGE_SIZE_DEFAULT,
        exclusiveStartKey: { id: "composer-prev" },
      });
    });

    it("LastEvaluatedKey がある場合はエンコードして nextCursor に入れて返す", async () => {
      mockRepo.findPage.mockResolvedValueOnce({
        items: [makeComposer("1", "a")],
        lastEvaluatedKey: { id: "composer-1" },
      });

      const result = await handler(makeEvent(), mockContext, mockCallback);
      const body = parseBody(result);

      expect(body.nextCursor).not.toBeNull();
      expect(typeof body.nextCursor).toBe("string");
    });
  });

  describe("異常系", () => {
    it("limit が 0 の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({ queryStringParameters: { limit: "0" } }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("limit が 上限超過の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({ queryStringParameters: { limit: String(COMPOSERS_PAGE_SIZE_MAX + 1) } }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("limit が数値でない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({ queryStringParameters: { limit: "abc" } }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("cursor が不正な base64url 文字の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({ queryStringParameters: { cursor: "!!!invalid!!!" } }),
        mockContext,
        mockCallback,
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
