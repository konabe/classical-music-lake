import type { ListeningLog } from "@/types";

import { UserId } from "@/domain/value-objects/ids";
import { handler } from "@/handlers/listening-logs/list";
import {
  makeAuthEvent,
  makeComposer,
  makeLogRecord,
  makePiece,
  TEST_PIECE_ID,
} from "@/test/fixtures";
import { mockComposerRepo } from "@/repositories/__mocks__/composer-repository";
import { mockListeningLogRepo } from "@/repositories/__mocks__/listening-log-repository";
import { mockPieceRepo } from "@/repositories/__mocks__/piece-repository";

vi.mock("@/repositories/composer-repository");
vi.mock("@/repositories/listening-log-repository");
vi.mock("@/repositories/piece-repository");

const mockContext = {} as Parameters<typeof handler>[1];
const mockCallback = { signal: new AbortController().signal };

const TEST_USER_ID = "cognito-sub-user-123";
const mockEvent = makeAuthEvent(TEST_USER_ID);

describe("GET /listening-logs (list)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPieceRepo.findById.mockResolvedValue(makePiece());
    mockPieceRepo.findByIds.mockResolvedValue([makePiece()]);
    mockPieceRepo.findRootById.mockResolvedValue(makePiece());
    mockComposerRepo.findById.mockResolvedValue(makeComposer());
    mockComposerRepo.findByIds.mockResolvedValue([makeComposer()]);
  });

  it("空リストの場合は 200 で空配列を返す", async () => {
    mockListeningLogRepo.findByUserId.mockResolvedValueOnce([]);
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body ?? "[]")).toEqual([]);
  });

  it("listenedAt の降順でソートして派生値を含む DTO を返す", async () => {
    const records = [
      makeLogRecord("1", "2024-01-10T00:00:00.000Z"),
      makeLogRecord("2", "2024-01-15T00:00:00.000Z"),
      makeLogRecord("3", "2024-01-05T00:00:00.000Z"),
    ];
    mockListeningLogRepo.findByUserId.mockResolvedValueOnce(records);

    const result = await handler(mockEvent, mockContext, mockCallback);
    const body: ListeningLog[] = JSON.parse(result?.body ?? "[]");

    expect(body[0].id).toBe("2");
    expect(body[1].id).toBe("1");
    expect(body[2].id).toBe("3");
    expect(body[0].pieceId).toBe(TEST_PIECE_ID);
    expect(body[0].pieceTitle).toBe("交響曲第5番 ハ短調 Op.67");
    expect(body[0].composerName).toBe("ベートーヴェン");
  });

  it("userId でフィルタリングして自分のログのみ返す", async () => {
    const records = [makeLogRecord("1", "2024-01-10T00:00:00.000Z", TEST_USER_ID)];
    mockListeningLogRepo.findByUserId.mockResolvedValueOnce(records);

    await handler(mockEvent, mockContext, mockCallback);

    expect(mockListeningLogRepo.findByUserId).toHaveBeenCalledWith(UserId.from(TEST_USER_ID));
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockListeningLogRepo.findByUserId.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
