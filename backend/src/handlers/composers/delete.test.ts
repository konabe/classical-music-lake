import { ComposerId } from "@/domain/value-objects/ids";
import { handler } from "@/handlers/composers/delete";
import {
  describeAdminForbiddenCases,
  makeAdminDeleteEvent,
  mockCallback,
  mockContext,
  type WriteAuthMode,
} from "@/test/fixtures";

import { mockComposerRepo as mockRepo } from "@/repositories/__mocks__/composer-repository";

vi.mock("@/repositories/composer-repository");

const makeEvent = (id: string | null, auth: WriteAuthMode = "admin") =>
  makeAdminDeleteEvent("composers", id, auth);

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
    mockRepo.remove.mockResolvedValueOnce(undefined);
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(204);
    expect(result?.body).toBe("");
  });

  it("正しい id で Repository.remove を呼び出す", async () => {
    mockRepo.remove.mockResolvedValueOnce(undefined);
    await handler(makeEvent("test-id-123"), mockContext, mockCallback);

    expect(mockRepo.remove).toHaveBeenCalledWith(ComposerId.from("test-id-123"));
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.remove.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });

  describeAdminForbiddenCases(
    (auth) => handler(makeEvent("test-id-123", auth), mockContext, mockCallback),
    [mockRepo.remove],
  );
});
