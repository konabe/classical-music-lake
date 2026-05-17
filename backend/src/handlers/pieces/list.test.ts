import { handler } from "@/handlers/pieces/list";
import { makeEvent, makePiece, mockContext, mockCallback } from "@/test/fixtures";
import { encodeCursor } from "@/utils/cursor";
import { PIECES_PAGE_SIZE_DEFAULT, PIECES_PAGE_SIZE_MAX } from "@/types";
import type { Paginated, Piece } from "@/types";

const mockRepo = vi.hoisted(() => ({
  saveWork: vi.fn(),
  saveWorkWithOptimisticLock: vi.fn(),
  removeWorkCascade: vi.fn(),
  findRootById: vi.fn(),
  findRootPage: vi.fn(),
  findById: vi.fn(),
  saveMovement: vi.fn(),
  saveMovementWithOptimisticLock: vi.fn(),
  removeMovement: vi.fn(),
  replaceMovements: vi.fn(),
}));

vi.mock("../../repositories/piece-repository", () => ({
  DynamoDBPieceRepository: vi.fn().mockImplementation(function () {
    return mockRepo;
  }),
}));

const parseBody = (result: { body?: string } | null | undefined): Paginated<Piece> =>
  JSON.parse(result?.body ?? '{"items":[],"nextCursor":null}') as Paginated<Piece>;

describe("GET /pieces (list)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("正常系", () => {
    it("空の場合は items=[], nextCursor=null を返す", async () => {
      mockRepo.findRootPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });

      const result = await handler(makeEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(200);
      const body = parseBody(result);
      expect(body.items).toEqual([]);
      expect(body.nextCursor).toBeNull();
    });

    it("Repository から取得したアイテムを items に入れて返す", async () => {
      const pieces = [makePiece("1", "交響曲第9番"), makePiece("2", "アイーダ")];
      mockRepo.findRootPage.mockResolvedValueOnce({ items: pieces, lastEvaluatedKey: undefined });

      const result = await handler(makeEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(200);
      const body = parseBody(result);
      expect(body.items).toEqual(pieces);
      expect(body.nextCursor).toBeNull();
    });

    it("limit 未指定の場合は既定値で findRootPage を呼ぶ", async () => {
      mockRepo.findRootPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });

      await handler(makeEvent(), mockContext, mockCallback);

      expect(mockRepo.findRootPage).toHaveBeenCalledWith({
        limit: PIECES_PAGE_SIZE_DEFAULT,
        exclusiveStartKey: undefined,
      });
    });

    it("limit クエリを指定すると数値変換して findRootPage に渡す", async () => {
      mockRepo.findRootPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });

      await handler(
        makeEvent({ queryStringParameters: { limit: "20" } }),
        mockContext,
        mockCallback,
      );

      expect(mockRepo.findRootPage).toHaveBeenCalledWith({
        limit: 20,
        exclusiveStartKey: undefined,
      });
    });

    it("cursor クエリを指定するとデコードして exclusiveStartKey として findRootPage に渡す", async () => {
      mockRepo.findRootPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });
      const cursor = encodeCursor({ id: "piece-prev" });

      await handler(makeEvent({ queryStringParameters: { cursor } }), mockContext, mockCallback);

      expect(mockRepo.findRootPage).toHaveBeenCalledWith({
        limit: PIECES_PAGE_SIZE_DEFAULT,
        exclusiveStartKey: { id: "piece-prev" },
      });
    });

    it("LastEvaluatedKey がある場合はエンコードして nextCursor に入れて返す", async () => {
      mockRepo.findRootPage.mockResolvedValueOnce({
        items: [makePiece("1", "a")],
        lastEvaluatedKey: { id: "piece-1" },
      });

      const result = await handler(makeEvent(), mockContext, mockCallback);
      const body = parseBody(result);

      expect(body.nextCursor).not.toBeNull();
      expect(typeof body.nextCursor).toBe("string");
    });

    it("LastEvaluatedKey なしの場合は nextCursor が null", async () => {
      mockRepo.findRootPage.mockResolvedValueOnce({
        items: [makePiece("1", "a")],
        lastEvaluatedKey: undefined,
      });

      const result = await handler(makeEvent(), mockContext, mockCallback);
      const body = parseBody(result);

      expect(body.nextCursor).toBeNull();
    });

    it("LastEvaluatedKey があるが Items が空でも nextCursor を返す", async () => {
      mockRepo.findRootPage.mockResolvedValueOnce({
        items: [],
        lastEvaluatedKey: { id: "piece-x" },
      });

      const result = await handler(makeEvent(), mockContext, mockCallback);
      const body = parseBody(result);

      expect(body.items).toEqual([]);
      expect(body.nextCursor).not.toBeNull();
    });

    it("ラウンドトリップ: 前ページの nextCursor を次リクエストの cursor として利用できる", async () => {
      mockRepo.findRootPage.mockResolvedValueOnce({
        items: [makePiece("1", "a")],
        lastEvaluatedKey: { id: "piece-1" },
      });

      const firstResult = await handler(makeEvent(), mockContext, mockCallback);
      const { nextCursor } = parseBody(firstResult);
      expect(nextCursor).not.toBeNull();

      mockRepo.findRootPage.mockResolvedValueOnce({ items: [], lastEvaluatedKey: undefined });

      await handler(
        makeEvent({ queryStringParameters: { cursor: nextCursor ?? "" } }),
        mockContext,
        mockCallback,
      );

      expect(mockRepo.findRootPage).toHaveBeenLastCalledWith({
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
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("limit が 上限超過の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({ queryStringParameters: { limit: String(PIECES_PAGE_SIZE_MAX + 1) } }),
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

    it("cursor が base64url として正しいが JSON デコード不能な場合は 400 を返す", async () => {
      const cursor = Buffer.from("not a json", "utf8").toString("base64url");
      const result = await handler(
        makeEvent({ queryStringParameters: { cursor } }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("cursor のバージョンが未知の場合は 400 を返す", async () => {
      const cursor = Buffer.from(JSON.stringify({ v: 999, k: { id: "1" } }), "utf8").toString(
        "base64url",
      );
      const result = await handler(
        makeEvent({ queryStringParameters: { cursor } }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("Repository エラー時に 500 を返す", async () => {
      mockRepo.findRootPage.mockRejectedValueOnce(new Error("DynamoDB error"));
      const result = await handler(makeEvent(), mockContext, mockCallback);
      expect(result?.statusCode).toBe(500);
    });
  });
});
