import { handler } from "@/handlers/listening-logs/create";
import {
  describeInvalidBodyCases,
  makeAuthEvent,
  makeComposer,
  makeEvent,
  makePiece,
  mockCallback,
  mockContext,
  TEST_PIECE_ID,
  TEST_USER_ID,
} from "@/test/fixtures";
import { mockComposerRepo } from "@/repositories/__mocks__/composer-repository";
import { mockListeningLogRepo } from "@/repositories/__mocks__/listening-log-repository";
import { mockPieceRepo } from "@/repositories/__mocks__/piece-repository";

vi.mock("@/repositories/composer-repository");
vi.mock("@/repositories/listening-log-repository");
vi.mock("@/repositories/piece-repository");

const validInput = {
  listenedAt: "2024-01-15T20:00:00.000Z",
  pieceId: TEST_PIECE_ID,
  rating: 5,
  isFavorite: true,
  memo: "素晴らしい演奏",
};

describe("POST /listening-logs (create)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPieceRepo.findById.mockResolvedValue(makePiece());
    mockComposerRepo.findById.mockResolvedValue(makeComposer());
  });

  describeInvalidBodyCases(handler, "/listening-logs");

  it.each([0, 6, -1, 1.5, "5", null])(
    "rating が不正な値（%s）の場合は 400 を返す",
    async (invalidRating) => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, rating: invalidRating }),
          httpMethod: "POST",
          path: "/listening-logs",
        }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("rating must be between 1 and 5");
    },
  );

  it("pieceId が未指定の場合は 400 を返す", async () => {
    const { pieceId: _pieceId, ...withoutPieceId } = validInput;
    const result = await handler(
      makeEvent({
        body: JSON.stringify(withoutPieceId),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
  });

  it("pieceId が UUID 形式でない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, pieceId: "not-a-uuid" }),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("pieceId must be a valid UUID");
  });

  it("memo が 1000 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, memo: "あ".repeat(1001) }),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("memo must be 1000 characters or less");
  });

  it("正常に作成して 201 を返す（派生値 pieceTitle / composerName を含む）", async () => {
    mockListeningLogRepo.save.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(201);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBeDefined();
    expect(body.pieceId).toBe(TEST_PIECE_ID);
    expect(body.pieceTitle).toBe("交響曲第5番 ハ短調 Op.67");
    expect(body.composerName).toBe("ベートーヴェン");
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
  });

  it("作成アイテムに UUID が付与される", async () => {
    mockListeningLogRepo.save.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("createdAt と updatedAt が同じ値で設定される", async () => {
    mockListeningLogRepo.save.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.createdAt).toBe(body.updatedAt);
  });

  it("永続化レコードに userId / pieceId が保存される（派生値 pieceTitle 等は保存しない）", async () => {
    mockListeningLogRepo.save.mockResolvedValueOnce(undefined);
    await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback,
    );

    const savedItem = mockListeningLogRepo.save.mock.calls[0][0];
    expect(savedItem.userId).toBe(TEST_USER_ID);
    expect(savedItem.pieceId).toBe(TEST_PIECE_ID);
    expect(savedItem.pieceTitle).toBeUndefined();
    expect(savedItem.composerName).toBeUndefined();
  });

  it("レスポンスボディに userId が含まれる", async () => {
    mockListeningLogRepo.save.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.userId).toBe(TEST_USER_ID);
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockListeningLogRepo.save.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(500);
  });
});
