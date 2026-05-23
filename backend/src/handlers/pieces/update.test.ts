import createError from "http-errors";
import type { Piece, PieceWork } from "@/types";

import { handler } from "@/handlers/pieces/update";
import {
  describeAdminForbiddenCases,
  describeInvalidBodyCases,
  makeAdminPutEvent,
  mockCallback,
  mockContext,
  TEST_COMPOSER_ID,
  type WriteAuthMode,
} from "@/test/fixtures";
import { mockPieceRepo } from "@/repositories/__mocks__/piece-repository";

vi.mock("@/repositories/piece-repository");

const makeEvent = (id?: string, body?: string | null, auth: WriteAuthMode = "admin") =>
  makeAdminPutEvent("pieces", id, body, auth);

const existingPiece: PieceWork = {
  kind: "work",
  id: "abc-123",
  title: "交響曲第9番",
  composerId: TEST_COMPOSER_ID,
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

const OTHER_COMPOSER_ID = "00000000-0000-4000-8000-000000000002";

const existingPieceWithVideoUrls: PieceWork = {
  ...existingPiece,
  videoUrls: ["https://www.youtube.com/watch?v=abc123"],
};

const work = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({ kind: "work", ...overrides });

describe("PUT /pieces/{id} (update)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent(undefined, work({ title: "新タイトル" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  describeInvalidBodyCases(handler, "/pieces/abc-123", (body) => makeEvent("abc-123", body));

  it.each(["", "   ", "\t", "\n"])(
    "title が空または空白のみ（%j）の場合は 400 を返す",
    async (invalidTitle) => {
      const result = await handler(
        makeEvent("abc-123", work({ title: invalidTitle })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("title must be a non-empty string");
    },
  );

  it("title が 200 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", work({ title: "あ".repeat(201) })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("title must be 200 characters or less");
  });

  it.each(["", "not-a-uuid", "   "])(
    "composerId が UUID 形式でない（%j）場合は 400 を返す",
    async (invalidComposerId) => {
      const result = await handler(
        makeEvent("abc-123", work({ composerId: invalidComposerId })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("composerId must be a valid UUID");
    },
  );

  it("title を含まない更新は title のバリデーションをスキップする", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(existingPiece);
    mockPieceRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", work({ composerId: OTHER_COMPOSER_ID })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeEvent("not-found-id", work({ title: "新タイトル" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("正常更新して 200 を返す", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(existingPiece);
    mockPieceRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", work({ title: "交響曲第5番", composerId: OTHER_COMPOSER_ID })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.kind).toBe("work");
    expect(body.id).toBe("abc-123");
    expect(body.title).toBe("交響曲第5番");
    expect((body as PieceWork).composerId).toBe(OTHER_COMPOSER_ID);
  });

  it("updatedAt が更新されること", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(existingPiece);
    mockPieceRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const before = new Date(existingPiece.updatedAt).getTime();
    const result = await handler(
      makeEvent("abc-123", work({ title: "交響曲第5番" })),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(new Date(body.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("createdAt は上書きされない", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(existingPiece);
    mockPieceRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", work({ title: "交響曲第5番" })),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.createdAt).toBe(existingPiece.createdAt);
  });

  it("id は上書きされない", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(existingPiece);
    mockPieceRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", work({ title: "交響曲第5番" })),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.id).toBe("abc-123");
  });

  it("楽観的ロック競合時に 409 を返す", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(existingPiece);
    mockPieceRepo.saveWorkWithOptimisticLock.mockRejectedValueOnce(
      new createError.Conflict("Piece was updated by another request"),
    );

    const result = await handler(
      makeEvent("abc-123", work({ title: "交響曲第5番" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(409);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Piece was updated by another request");
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockPieceRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeEvent("abc-123", work({ title: "交響曲第5番" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(500);
  });

  it("videoUrls を追加して更新できる", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(existingPiece);
    mockPieceRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const urls = ["https://www.youtube.com/watch?v=xyz", "https://www.youtube.com/watch?v=qrs"];
    const result = await handler(
      makeEvent("abc-123", work({ videoUrls: urls })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.videoUrls).toEqual(urls);
  });

  it("videoUrls を空配列で送信すると削除される", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(existingPieceWithVideoUrls);
    mockPieceRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", work({ videoUrls: [] })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.videoUrls).toBeUndefined();
  });

  describe("カテゴリフィールド", () => {
    it("カテゴリを追加して更新できる", async () => {
      mockPieceRepo.findById.mockResolvedValueOnce(existingPiece);
      mockPieceRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

      const result = await handler(
        makeEvent(
          "abc-123",
          work({
            genre: "交響曲",
            era: "古典派",
            formation: "管弦楽",
            region: "ドイツ・オーストリア",
          }),
        ),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}") as PieceWork;
      expect(body.genre).toBe("交響曲");
      expect(body.era).toBe("古典派");
      expect(body.formation).toBe("管弦楽");
      expect(body.region).toBe("ドイツ・オーストリア");
    });

    it("カテゴリを変更して更新できる", async () => {
      const existingWithCategory: PieceWork = {
        ...existingPiece,
        genre: "交響曲",
        era: "古典派",
      };
      mockPieceRepo.findById.mockResolvedValueOnce(existingWithCategory);
      mockPieceRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

      const result = await handler(
        makeEvent("abc-123", work({ genre: "協奏曲", era: "ロマン派" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}") as PieceWork;
      expect(body.genre).toBe("協奏曲");
      expect(body.era).toBe("ロマン派");
    });

    it("カテゴリを空文字で送信すると削除される", async () => {
      const existingWithCategory: PieceWork = {
        ...existingPiece,
        genre: "交響曲",
        era: "古典派",
        formation: "管弦楽",
        region: "ドイツ・オーストリア",
      };
      mockPieceRepo.findById.mockResolvedValueOnce(existingWithCategory);
      mockPieceRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

      const result = await handler(
        makeEvent("abc-123", work({ genre: "", era: "", formation: "", region: "" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}") as PieceWork;
      expect(body.genre).toBeUndefined();
      expect(body.era).toBeUndefined();
      expect(body.formation).toBeUndefined();
      expect(body.region).toBeUndefined();
    });

    it("一部のカテゴリのみ更新できる", async () => {
      mockPieceRepo.findById.mockResolvedValueOnce(existingPiece);
      mockPieceRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

      const result = await handler(
        makeEvent("abc-123", work({ genre: "室内楽" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}") as PieceWork;
      expect(body.genre).toBe("室内楽");
      expect(body.era).toBeUndefined();
    });

    it("genre に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent("abc-123", work({ genre: "不正な値" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("era に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent("abc-123", work({ era: "不正な値" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("formation に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent("abc-123", work({ formation: "不正な値" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("region に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent("abc-123", work({ region: "不正な値" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });
  });

  it("videoUrls の要素に不正な URL が含まれる場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", work({ videoUrls: ["not-a-url"] })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("videoUrls must contain valid URLs");
  });

  describeAdminForbiddenCases(
    (auth) =>
      handler(makeEvent("abc-123", work({ title: "新タイトル" }), auth), mockContext, mockCallback),
    [mockPieceRepo.findById, mockPieceRepo.saveWorkWithOptimisticLock],
  );
});
