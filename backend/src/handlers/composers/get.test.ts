import type { Composer } from "@/types";

import { handler } from "@/handlers/composers/get";
import { makeGetEvent, mockCallback, mockContext } from "@/test/fixtures";

import { mockComposerRepo as mockRepo } from "@/repositories/__mocks__/composer-repository";

vi.mock("@/repositories/composer-repository");

const makeEvent = (id?: string) => makeGetEvent("composers", id);

const testComposer: Composer = {
  id: "abc-123",
  name: "ベートーヴェン",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("GET /composers/{id} (get)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent(), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(makeEvent("not-found-id"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(404);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Composer not found");
  });

  it("正常に取得して 200 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(testComposer);
    const result = await handler(makeEvent("abc-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}") as Composer;
    expect(body.id).toBe("abc-123");
    expect(body.name).toBe("ベートーヴェン");
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("abc-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
