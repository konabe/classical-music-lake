import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ListeningLog } from "../../types";

import { UserId } from "../../domain/value-objects/ids";
import { handler } from "./list";
import {
  makeAuthEvent,
  makeComposer,
  makeLogRecord,
  makePiece,
  TEST_PIECE_ID,
} from "../../test/fixtures";

const mocks = vi.hoisted(() => ({
  listeningLogRepo: {
    save: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    existsByPieceIds: vi.fn(),
    saveWithOptimisticLock: vi.fn(),
    remove: vi.fn(),
  },
  pieceRepo: {
    findRootById: vi.fn(),
    findRootPage: vi.fn(),
    saveWork: vi.fn(),
    saveWorkWithOptimisticLock: vi.fn(),
    removeWorkCascade: vi.fn(),
    findById: vi.fn(),
    findByIds: vi.fn().mockResolvedValue([]),
    findChildren: vi.fn(),
    saveMovement: vi.fn(),
    saveMovementWithOptimisticLock: vi.fn(),
    removeMovement: vi.fn(),
    replaceMovements: vi.fn(),
  },
  composerRepo: {
    findById: vi.fn(),
    findByIds: vi.fn().mockResolvedValue([]),
    findPage: vi.fn(),
    save: vi.fn(),
    saveWithOptimisticLock: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("../../repositories/listening-log-repository", () => ({
  DynamoDBListeningLogRepository: vi.fn().mockImplementation(function () {
    return mocks.listeningLogRepo;
  }),
}));
vi.mock("../../repositories/piece-repository", () => ({
  DynamoDBPieceRepository: vi.fn().mockImplementation(function () {
    return mocks.pieceRepo;
  }),
}));
vi.mock("../../repositories/composer-repository", () => ({
  DynamoDBComposerRepository: vi.fn().mockImplementation(function () {
    return mocks.composerRepo;
  }),
}));

const mockContext = {} as Parameters<typeof handler>[1];
const mockCallback = { signal: new AbortController().signal };

const TEST_USER_ID = "cognito-sub-user-123";
const mockEvent = makeAuthEvent(TEST_USER_ID);

describe("GET /listening-logs (list)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pieceRepo.findById.mockResolvedValue(makePiece());
    mocks.pieceRepo.findByIds.mockResolvedValue([makePiece()]);
    mocks.pieceRepo.findRootById.mockResolvedValue(makePiece());
    mocks.composerRepo.findById.mockResolvedValue(makeComposer());
    mocks.composerRepo.findByIds.mockResolvedValue([makeComposer()]);
  });

  it("空リストの場合は 200 で空配列を返す", async () => {
    mocks.listeningLogRepo.findByUserId.mockResolvedValueOnce([]);
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
    mocks.listeningLogRepo.findByUserId.mockResolvedValueOnce(records);

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
    mocks.listeningLogRepo.findByUserId.mockResolvedValueOnce(records);

    await handler(mockEvent, mockContext, mockCallback);

    expect(mocks.listeningLogRepo.findByUserId).toHaveBeenCalledWith(UserId.from(TEST_USER_ID));
  });

  it("Repository エラー時に 500 を返す", async () => {
    mocks.listeningLogRepo.findByUserId.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
