import { handler } from "@/handlers/pieces/children";
import { makeEvent, mockCallback, mockContext } from "@/test/fixtures";
import { mockPieceRepo } from "@/repositories/__mocks__/piece-repository";

vi.mock("@/repositories/piece-repository");

const makeChildrenEvent = (id?: string) =>
  makeEvent({
    httpMethod: "GET",
    path: `/pieces/${id ?? ""}/children`,
    pathParameters: id === undefined ? null : { id },
  });

describe("GET /pieces/{id}/children (children)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(makeChildrenEvent(), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("子 Movement の配列を 200 で返す", async () => {
    const movements = [
      {
        kind: "movement" as const,
        id: "mov-1",
        parentId: "abc-123",
        index: 0,
        title: "第1楽章",
        createdAt: "2024-01-15T21:00:00.000Z",
        updatedAt: "2024-01-15T21:00:00.000Z",
      },
      {
        kind: "movement" as const,
        id: "mov-2",
        parentId: "abc-123",
        index: 1,
        title: "第2楽章",
        createdAt: "2024-01-15T21:00:00.000Z",
        updatedAt: "2024-01-15T21:00:00.000Z",
      },
    ];
    mockPieceRepo.findChildren.mockResolvedValueOnce(movements);

    const result = await handler(makeChildrenEvent("abc-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "[]");
    expect(body).toHaveLength(2);
    expect(body[0].kind).toBe("movement");
    expect(body[0].id).toBe("mov-1");
    expect(body[0].index).toBe(0);
  });

  it("該当する子 Movement が無ければ空配列を返す", async () => {
    mockPieceRepo.findChildren.mockResolvedValueOnce([]);

    const result = await handler(makeChildrenEvent("abc-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body ?? "[]")).toEqual([]);
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockPieceRepo.findChildren.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeChildrenEvent("abc-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
