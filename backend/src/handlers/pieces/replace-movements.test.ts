import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent } from "aws-lambda";
import createError from "http-errors";

import { handler } from "./replace-movements";
import {
  makeAdminEvent,
  makeAuthEvent,
  makeEvent as makeBaseEvent,
  mockCallback,
  mockContext,
  TEST_COMPOSER_ID,
  TEST_USER_ID,
} from "../../test/fixtures";

const mockRepo = vi.hoisted(() => ({
  saveWork: vi.fn(),
  saveWorkWithOptimisticLock: vi.fn(),
  removeWorkCascade: vi.fn(),
  findRootById: vi.fn(),
  findRootPage: vi.fn(),
  findById: vi.fn(),
  findByIds: vi.fn().mockResolvedValue([]),
  findChildren: vi.fn(),
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

const TEST_WORK_ID = "00000000-0000-4000-8000-00000000aaaa";

const existingWork = {
  kind: "work" as const,
  id: TEST_WORK_ID,
  title: "交響曲第9番",
  composerId: TEST_COMPOSER_ID,
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

type AuthMode = "admin" | "non-admin" | "none";

function makeEvent(
  workId?: string,
  body?: string | null,
  auth: AuthMode = "admin",
): APIGatewayProxyEvent {
  const overrides: Partial<APIGatewayProxyEvent> = {
    body: body === undefined ? null : body,
    httpMethod: "PUT",
    path: `/pieces/${workId ?? ""}/movements`,
    pathParameters: workId === undefined ? null : { id: workId },
  };
  if (auth === "admin") {
    return makeAdminEvent(TEST_USER_ID, overrides);
  }
  if (auth === "non-admin") {
    return makeAuthEvent(TEST_USER_ID, overrides);
  }
  return makeBaseEvent(overrides);
}

describe("PUT /pieces/{workId}/movements (replace-movements)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("workId がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent(undefined, JSON.stringify({ movements: [] })),
      mockContext,
      mockCallback,
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
      const result = await handler(makeEvent(TEST_WORK_ID, body), mockContext, mockCallback);
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });

  it("movements に index 重複があると 400 を返す", async () => {
    const result = await handler(
      makeEvent(
        TEST_WORK_ID,
        JSON.stringify({
          movements: [
            { index: 0, title: "第1楽章" },
            { index: 0, title: "第2楽章（同じ index）" },
          ],
        }),
      ),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe(
      "movements must not contain duplicate index values",
    );
    expect(mockRepo.replaceMovements).not.toHaveBeenCalled();
  });

  it("movements に title が空の項目があると 400 を返す", async () => {
    const result = await handler(
      makeEvent(
        TEST_WORK_ID,
        JSON.stringify({
          movements: [{ index: 0, title: "" }],
        }),
      ),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
  });

  it("movements の件数が MOVEMENTS_PER_WORK_MAX を超えると 400 を返す", async () => {
    const movements = Array.from({ length: 50 }, (_, i) => ({ index: i, title: `${i}` }));
    const result = await handler(
      makeEvent(TEST_WORK_ID, JSON.stringify({ movements })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
  });

  it("Work が存在しない場合は 404 を返す", async () => {
    mockRepo.findRootById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeEvent(TEST_WORK_ID, JSON.stringify({ movements: [{ index: 0, title: "第1楽章" }] })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("正常に置換して 200 と movements 配列を返す", async () => {
    mockRepo.findRootById.mockResolvedValueOnce(existingWork);
    mockRepo.findChildren.mockResolvedValueOnce([]);
    mockRepo.replaceMovements.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent(
        TEST_WORK_ID,
        JSON.stringify({
          movements: [
            { index: 0, title: "第1楽章" },
            { index: 1, title: "第2楽章" },
          ],
        }),
      ),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.movements).toHaveLength(2);
    expect(body.movements[0].kind).toBe("movement");
    expect(body.movements[0].parentId).toBe(TEST_WORK_ID);
    expect(body.movements[0].title).toBe("第1楽章");
    expect(body.movements[0].id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("空配列を渡すと既存 Movement が全削除される（レスポンスは空配列）", async () => {
    const existingMovement = {
      kind: "movement" as const,
      id: "mov-1",
      parentId: TEST_WORK_ID,
      index: 0,
      title: "旧第1楽章",
      createdAt: "2024-01-15T20:00:00.000Z",
      updatedAt: "2024-01-15T20:00:00.000Z",
    };
    mockRepo.findRootById.mockResolvedValueOnce(existingWork);
    mockRepo.findChildren.mockResolvedValueOnce([existingMovement]);
    mockRepo.replaceMovements.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent(TEST_WORK_ID, JSON.stringify({ movements: [] })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body ?? "{}")).toEqual({ movements: [] });
  });

  it("楽観的ロック競合時に 409 を返す", async () => {
    mockRepo.findRootById.mockResolvedValueOnce(existingWork);
    mockRepo.findChildren.mockResolvedValueOnce([]);
    mockRepo.replaceMovements.mockRejectedValueOnce(
      new createError.Conflict("Piece was updated by another request"),
    );

    const result = await handler(
      makeEvent(TEST_WORK_ID, JSON.stringify({ movements: [{ index: 0, title: "第1楽章" }] })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(409);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Piece was updated by another request");
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.findRootById.mockResolvedValueOnce(existingWork);
    mockRepo.findChildren.mockResolvedValueOnce([]);
    mockRepo.replaceMovements.mockRejectedValueOnce(new Error("DynamoDB error"));

    const result = await handler(
      makeEvent(TEST_WORK_ID, JSON.stringify({ movements: [{ index: 0, title: "第1楽章" }] })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(500);
  });

  describe("認可", () => {
    it("admin グループに属さないユーザーは 403 を返す", async () => {
      const result = await handler(
        makeEvent(
          TEST_WORK_ID,
          JSON.stringify({ movements: [{ index: 0, title: "第1楽章" }] }),
          "non-admin",
        ),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(403);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("Admin privilege required");
      expect(mockRepo.findRootById).not.toHaveBeenCalled();
      expect(mockRepo.replaceMovements).not.toHaveBeenCalled();
    });

    it("認証クレームがない場合は 403 を返す", async () => {
      const result = await handler(
        makeEvent(
          TEST_WORK_ID,
          JSON.stringify({ movements: [{ index: 0, title: "第1楽章" }] }),
          "none",
        ),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(403);
      expect(mockRepo.replaceMovements).not.toHaveBeenCalled();
    });
  });
});
