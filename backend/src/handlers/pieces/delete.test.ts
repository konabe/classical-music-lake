import type { APIGatewayProxyEvent } from "aws-lambda";

import { PieceId } from "@/domain/value-objects/ids";
import { handler } from "@/handlers/pieces/delete";
import {
  makeAdminEvent,
  makeAuthEvent,
  makeEvent as makeBaseEvent,
  mockCallback,
  mockContext,
  TEST_USER_ID,
} from "@/test/fixtures";
import { mockPieceRepo } from "@/repositories/__mocks__/piece-repository";
import { mockListeningLogRepo } from "@/repositories/__mocks__/listening-log-repository";

vi.mock("@/repositories/piece-repository");
vi.mock("@/repositories/listening-log-repository");

type AuthMode = "admin" | "non-admin" | "none";

function makeEvent(id: string | null, auth: AuthMode = "admin"): APIGatewayProxyEvent {
  const overrides: Partial<APIGatewayProxyEvent> = {
    httpMethod: "DELETE",
    path: `/pieces/${id ?? ""}`,
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

const workItem = {
  kind: "work" as const,
  id: "test-id-123",
  title: "交響曲第9番",
  composerId: "00000000-0000-4000-8000-000000000001",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

const movementItem = {
  kind: "movement" as const,
  id: "mov-1",
  parentId: "test-id-123",
  index: 0,
  title: "第1楽章",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("DELETE /pieces/{id} (delete)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPieceRepo.findChildren.mockResolvedValue([]);
    mockListeningLogRepo.existsByPieceIds.mockResolvedValue(false);
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent(null), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("Work を指定すると removeWorkCascade で cascade 削除し 204 を返す", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(workItem);
    mockPieceRepo.removeWorkCascade.mockResolvedValueOnce(undefined);
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(204);
    expect(result?.body).toBe("");
    expect(mockPieceRepo.removeWorkCascade).toHaveBeenCalledWith(PieceId.from("test-id-123"));
    expect(mockPieceRepo.removeMovement).not.toHaveBeenCalled();
  });

  it("Movement を指定すると removeMovement で単独削除し 204 を返す", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(movementItem);
    mockPieceRepo.removeMovement.mockResolvedValueOnce(undefined);
    const result = await handler(makeEvent("mov-1"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(204);
    expect(mockPieceRepo.removeMovement).toHaveBeenCalledWith(PieceId.from("mov-1"));
    expect(mockPieceRepo.removeWorkCascade).not.toHaveBeenCalled();
  });

  it("存在しない id は冪等に 204 を返し、削除呼び出しは行わない", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(makeEvent("not-found"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(204);
    expect(mockPieceRepo.removeWorkCascade).not.toHaveBeenCalled();
    expect(mockPieceRepo.removeMovement).not.toHaveBeenCalled();
  });

  it("ListeningLog から参照されている Work は 409 を返し、削除しない", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(workItem);
    mockListeningLogRepo.existsByPieceIds.mockResolvedValueOnce(true);
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(409);
    expect(JSON.parse(result?.body ?? "{}").message).toBe(
      "Cannot delete piece referenced by existing listening logs",
    );
    expect(mockPieceRepo.removeWorkCascade).not.toHaveBeenCalled();
  });

  it("Work 配下の Movement が ListeningLog から参照されている場合も 409 を返す", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(workItem);
    mockPieceRepo.findChildren.mockResolvedValueOnce([movementItem]);
    mockListeningLogRepo.existsByPieceIds.mockResolvedValueOnce(true);
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(409);
  });

  it("ListeningLog から参照されている Movement は 409 を返す", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(movementItem);
    mockListeningLogRepo.existsByPieceIds.mockResolvedValueOnce(true);
    const result = await handler(makeEvent("mov-1"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(409);
    expect(mockPieceRepo.removeMovement).not.toHaveBeenCalled();
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(workItem);
    mockPieceRepo.removeWorkCascade.mockRejectedValueOnce(new Error("DynamoDB error"));
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
      expect(JSON.parse(result?.body ?? "{}").message).toBe("Admin privilege required");
      expect(mockPieceRepo.findById).not.toHaveBeenCalled();
      expect(mockPieceRepo.removeWorkCascade).not.toHaveBeenCalled();
      expect(mockPieceRepo.removeMovement).not.toHaveBeenCalled();
    });

    it("認証クレームがない場合は 403 を返し、削除しない", async () => {
      const result = await handler(makeEvent("test-id-123", "none"), mockContext, mockCallback);
      expect(result?.statusCode).toBe(403);
      expect(mockPieceRepo.findById).not.toHaveBeenCalled();
      expect(mockPieceRepo.removeWorkCascade).not.toHaveBeenCalled();
      expect(mockPieceRepo.removeMovement).not.toHaveBeenCalled();
    });
  });
});
