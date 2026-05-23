import type { Piece, PieceWork } from "@/types";

import { handler } from "@/handlers/pieces/get";
import { makeGetEvent, mockCallback, mockContext } from "@/test/fixtures";
import { mockPieceRepo } from "@/repositories/__mocks__/piece-repository";

vi.mock("@/repositories/piece-repository");

const makeEvent = (id?: string) => makeGetEvent("pieces", id);

const testPiece: PieceWork = {
  kind: "work",
  id: "abc-123",
  title: "交響曲第9番",
  composerId: "00000000-0000-4000-8000-000000000001",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("GET /pieces/{id} (get)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent(), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(makeEvent("not-found-id"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(404);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Piece not found");
  });

  it("正常に取得して 200 を返す", async () => {
    mockPieceRepo.findById.mockResolvedValueOnce(testPiece);
    const result = await handler(makeEvent("abc-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.kind).toBe("work");
    expect(body.id).toBe("abc-123");
    expect(body.title).toBe("交響曲第9番");
    expect((body as PieceWork).composerId).toBe("00000000-0000-4000-8000-000000000001");
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockPieceRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("abc-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });

  it("Movement も id で取得できる（kind を問わず単一ノード）", async () => {
    const movement = {
      kind: "movement" as const,
      id: "mov-1",
      parentId: "abc-123",
      index: 0,
      title: "第1楽章",
      createdAt: "2024-01-15T21:00:00.000Z",
      updatedAt: "2024-01-15T21:00:00.000Z",
    };
    mockPieceRepo.findById.mockResolvedValueOnce(movement);
    const result = await handler(makeEvent("mov-1"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.kind).toBe("movement");
    expect(body.id).toBe("mov-1");
  });
});
