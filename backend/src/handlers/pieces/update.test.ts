import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import createError from "http-errors";
import type { Piece } from "../../types";

import { handler } from "./update";
import { TEST_USER_ID } from "../../test/fixtures";

const mockRepo = vi.hoisted(() => ({
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  saveWithOptimisticLock: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("../../repositories/piece-repository", () => ({
  DynamoDBPieceRepository: vi.fn().mockImplementation(function () {
    return mockRepo;
  }),
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

type AuthMode = "admin" | "non-admin" | "none";

function makeEvent(
  id?: string,
  body?: string | null,
  auth: AuthMode = "admin"
): APIGatewayProxyEvent {
  let requestContext: APIGatewayProxyEvent["requestContext"];
  if (auth === "none") {
    requestContext = {} as APIGatewayProxyEvent["requestContext"];
  } else {
    const claims: Record<string, unknown> = { sub: TEST_USER_ID };
    if (auth === "admin") {
      claims["cognito:groups"] = ["admin"];
    }
    requestContext = {
      authorizer: { claims },
    } as unknown as APIGatewayProxyEvent["requestContext"];
  }
  return {
    body: body === undefined ? null : body,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "PUT",
    isBase64Encoded: false,
    path: `/pieces/${id ?? ""}`,
    pathParameters: id === undefined ? null : { id },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext,
    resource: "",
  };
}

const existingPiece: Piece = {
  id: "abc-123",
  title: "交響曲第9番",
  composer: "ベートーヴェン",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

const existingPieceWithVideoUrl: Piece = {
  ...existingPiece,
  videoUrl: "https://www.youtube.com/watch?v=abc123",
};

describe("PUT /pieces/{id} (update)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent(undefined, JSON.stringify({ title: "新タイトル" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  describe("リクエストボディ異常系", () => {
    it.each<[string | null, number, string]>([
      [null, 400, "Request body is required"],
      ["null", 400, "Request body is required"],
      ["[]", 400, "Request body must be a JSON object"],
      ["invalid json", 422, "Invalid or malformed JSON was provided"],
    ])("body=%j のとき %i を返す", async (body, statusCode, message) => {
      const result = await handler(makeEvent("abc-123", body), mockContext, mockCallback);
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });

  it.each(["", "   ", "\t", "\n"])(
    "title が空または空白のみ（%j）の場合は 400 を返す",
    async (invalidTitle) => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ title: invalidTitle })),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("title must be a non-empty string");
    }
  );

  it("title が 200 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "あ".repeat(201) })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("title must be 200 characters or less");
  });

  it.each(["", "   ", "\t", "\n"])(
    "composer が空または空白のみ（%j）の場合は 400 を返す",
    async (invalidComposer) => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ composer: invalidComposer })),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("composer must be a non-empty string");
    }
  );

  it("composer が 100 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ composer: "あ".repeat(101) })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe(
      "composer must be 100 characters or less"
    );
  });

  it("title を含まない更新は title のバリデーションをスキップする", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ composer: "モーツァルト" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeEvent("not-found-id", JSON.stringify({ title: "新タイトル" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(404);
  });

  it("正常更新して 200 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "交響曲第5番", composer: "ベートーヴェン" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.id).toBe("abc-123");
    expect(body.title).toBe("交響曲第5番");
    expect(body.composer).toBe("ベートーヴェン");
  });

  it("updatedAt が更新されること", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const before = new Date(existingPiece.updatedAt).getTime();
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "交響曲第5番" })),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(new Date(body.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("createdAt は上書きされない", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "交響曲第5番" })),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.createdAt).toBe(existingPiece.createdAt);
  });

  it("id は上書きされない", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "交響曲第5番" })),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.id).toBe("abc-123");
  });

  it("楽観的ロック競合時に 409 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWithOptimisticLock.mockRejectedValueOnce(
      new createError.Conflict("Piece was updated by another request")
    );

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "交響曲第5番" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(409);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Piece was updated by another request");
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "交響曲第5番" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(500);
  });

  it("videoUrl を追加して更新できる", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ videoUrl: "https://www.youtube.com/watch?v=xyz" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.videoUrl).toBe("https://www.youtube.com/watch?v=xyz");
  });

  it("videoUrl を空文字で送信すると削除される", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPieceWithVideoUrl);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ videoUrl: "" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.videoUrl).toBeUndefined();
  });

  describe("カテゴリフィールド", () => {
    it("カテゴリを追加して更新できる", async () => {
      mockRepo.findById.mockResolvedValueOnce(existingPiece);
      mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

      const result = await handler(
        makeEvent(
          "abc-123",
          JSON.stringify({
            genre: "交響曲",
            era: "古典派",
            formation: "管弦楽",
            region: "ドイツ・オーストリア",
          })
        ),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}") as Piece;
      expect(body.genre).toBe("交響曲");
      expect(body.era).toBe("古典派");
      expect(body.formation).toBe("管弦楽");
      expect(body.region).toBe("ドイツ・オーストリア");
    });

    it("カテゴリを変更して更新できる", async () => {
      const existingWithCategory: Piece = {
        ...existingPiece,
        genre: "交響曲",
        era: "古典派",
      };
      mockRepo.findById.mockResolvedValueOnce(existingWithCategory);
      mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ genre: "協奏曲", era: "ロマン派" })),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}") as Piece;
      expect(body.genre).toBe("協奏曲");
      expect(body.era).toBe("ロマン派");
    });

    it("カテゴリを空文字で送信すると削除される", async () => {
      const existingWithCategory: Piece = {
        ...existingPiece,
        genre: "交響曲",
        era: "古典派",
        formation: "管弦楽",
        region: "ドイツ・オーストリア",
      };
      mockRepo.findById.mockResolvedValueOnce(existingWithCategory);
      mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ genre: "", era: "", formation: "", region: "" })),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}") as Piece;
      expect(body.genre).toBeUndefined();
      expect(body.era).toBeUndefined();
      expect(body.formation).toBeUndefined();
      expect(body.region).toBeUndefined();
    });

    it("一部のカテゴリのみ更新できる", async () => {
      mockRepo.findById.mockResolvedValueOnce(existingPiece);
      mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ genre: "室内楽" })),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}") as Piece;
      expect(body.genre).toBe("室内楽");
      expect(body.era).toBeUndefined();
    });

    it("genre に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ genre: "不正な値" })),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("era に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ era: "不正な値" })),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("formation に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ formation: "不正な値" })),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("region に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ region: "不正な値" })),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });
  });

  it("videoUrl が不正な URL の場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ videoUrl: "not-a-url" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("videoUrl must be a valid URL");
  });

  describe("認可", () => {
    it("admin グループに属さないユーザーは 403 を返し、データを更新しない", async () => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ title: "新タイトル" }), "non-admin"),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(403);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("Admin privilege required");
      expect(mockRepo.findById).not.toHaveBeenCalled();
      expect(mockRepo.saveWithOptimisticLock).not.toHaveBeenCalled();
    });

    it("認証クレームがない場合は 403 を返し、データを更新しない", async () => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ title: "新タイトル" }), "none"),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(403);
      expect(mockRepo.findById).not.toHaveBeenCalled();
      expect(mockRepo.saveWithOptimisticLock).not.toHaveBeenCalled();
    });
  });
});
