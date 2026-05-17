import type { APIGatewayProxyEvent } from "aws-lambda";

import { ComposerId } from "@/domain/value-objects/ids";
import { handler } from "@/handlers/composers/delete";
import {
  makeAdminEvent,
  makeAuthEvent,
  makeEvent as makeBaseEvent,
  mockCallback,
  mockContext,
  TEST_USER_ID,
} from "@/test/fixtures";

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

type AuthMode = "admin" | "non-admin" | "none";

function makeEvent(id: string | null, auth: AuthMode = "admin"): APIGatewayProxyEvent {
  const overrides: Partial<APIGatewayProxyEvent> = {
    httpMethod: "DELETE",
    path: `/composers/${id ?? ""}`,
    pathParameters: id === null ? null : { id },
  };
  if (auth === "admin") {
    return makeAdminEvent(TEST_USER_ID, overrides);
  }
  if (auth === "non-admin") {
    return makeAuthEvent(TEST_USER_ID, overrides);
  }
  return makeBaseEvent(overrides);
}

describe("DELETE /composers/{id} (delete)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent(null), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("正常に削除して 204 を返す", async () => {
    mockRepo.remove.mockResolvedValueOnce();
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(204);
    expect(result?.body).toBe("");
  });

  it("正しい id で Repository.remove を呼び出す", async () => {
    mockRepo.remove.mockResolvedValueOnce();
    await handler(makeEvent("test-id-123"), mockContext, mockCallback);

    expect(mockRepo.remove).toHaveBeenCalledWith(ComposerId.from("test-id-123"));
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.remove.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });

  describe("認可", () => {
    it("admin グループに属さないユーザーは 403 を返し、削除しない", async () => {
      const result = await handler(
        makeEvent("test-id-123", "non-admin"),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(403);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });

    it("認証クレームがない場合は 403 を返し、削除しない", async () => {
      const result = await handler(makeEvent("test-id-123", "none"), mockContext, mockCallback);
      expect(result?.statusCode).toBe(403);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });
  });
});
