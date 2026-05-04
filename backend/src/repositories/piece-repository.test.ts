import { describe, it, expect, vi, beforeEach } from "vitest";

import { DynamoDBPieceRepository } from "./piece-repository";
import { PieceId } from "../domain/value-objects/ids";
import type { Piece, PieceMovement, PieceWork } from "../types";

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

vi.mock("@aws-sdk/client-dynamodb", () => ({
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  DynamoDBClient: class DynamoDBClient {},
  ConditionalCheckFailedException: class ConditionalCheckFailedException extends Error {
    constructor(message?: string) {
      super(message);
      this.name = "ConditionalCheckFailedException";
    }
  },
}));

vi.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: { from: vi.fn().mockReturnValue({ send: mockSend }) },
  GetCommand: class GetCommand {
    constructor(public input: unknown) {}
  },
  PutCommand: class PutCommand {
    constructor(public input: unknown) {}
  },
  DeleteCommand: class DeleteCommand {
    constructor(public input: unknown) {}
  },
  QueryCommand: class QueryCommand {
    constructor(public input: unknown) {}
  },
  ScanCommand: class ScanCommand {
    constructor(public input: unknown) {}
  },
  TransactWriteCommand: class TransactWriteCommand {
    constructor(public input: unknown) {}
  },
}));

const normalizeLegacyVideoUrl = DynamoDBPieceRepository.normalizeLegacyVideoUrl;
const normalizeLegacyKind = DynamoDBPieceRepository.normalizeLegacyKind;

const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";
const WORK_ID = "00000000-0000-4000-8000-0000000000aa";

const baseWork: PieceWork = {
  kind: "work",
  id: "piece-1",
  title: "交響曲第9番",
  composerId: COMPOSER_ID,
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

const movement = (id: string, index: number, parentId: string = WORK_ID): PieceMovement => ({
  kind: "movement",
  id,
  parentId,
  index,
  title: `第${index + 1}楽章`,
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("normalizeLegacyVideoUrl", () => {
  it("undefined はそのまま undefined を返す", () => {
    expect(normalizeLegacyVideoUrl(undefined)).toBeUndefined();
  });

  it("videoUrl も videoUrls もない Piece はそのまま返す", () => {
    expect(normalizeLegacyVideoUrl(baseWork)).toEqual(baseWork);
  });

  it("videoUrls だけを持つ Piece はそのまま返す", () => {
    const piece: Piece = { ...baseWork, videoUrls: ["https://www.youtube.com/watch?v=abc"] };
    expect(normalizeLegacyVideoUrl(piece)).toEqual(piece);
  });

  it("レガシー videoUrl のみを持つ Piece は videoUrls 配列に変換される", () => {
    const legacy = { ...baseWork, videoUrl: "https://www.youtube.com/watch?v=abc" } as Piece;
    const result = normalizeLegacyVideoUrl(legacy);
    expect(result?.videoUrls).toEqual(["https://www.youtube.com/watch?v=abc"]);
    expect((result as Piece & { videoUrl?: string }).videoUrl).toBeUndefined();
  });

  it("空文字の videoUrl は無視される（videoUrls には含めない）", () => {
    const legacy = { ...baseWork, videoUrl: "" } as Piece;
    const result = normalizeLegacyVideoUrl(legacy);
    expect(result?.videoUrls).toBeUndefined();
    expect((result as Piece & { videoUrl?: string }).videoUrl).toBeUndefined();
  });

  it("videoUrls がすでに存在する場合はレガシー videoUrl を捨て、新フィールドを優先する", () => {
    const data = {
      ...baseWork,
      videoUrl: "https://legacy.example/video",
      videoUrls: ["https://new.example/video"],
    } as Piece;
    const result = normalizeLegacyVideoUrl(data);
    expect(result?.videoUrls).toEqual(["https://new.example/video"]);
    expect((result as Piece & { videoUrl?: string }).videoUrl).toBeUndefined();
  });
});

describe("normalizeLegacyKind", () => {
  it("undefined はそのまま undefined を返す", () => {
    expect(normalizeLegacyKind(undefined)).toBeUndefined();
  });

  it("kind を持つレコードはそのまま返す", () => {
    expect(normalizeLegacyKind(baseWork)).toEqual(baseWork);
  });

  it("kind 欠落のレコードは kind=work を補完する", () => {
    const { kind: _kind, ...withoutKind } = baseWork;
    void _kind;
    const result = normalizeLegacyKind(withoutKind as Piece);
    expect(result?.kind).toBe("work");
  });

  it("kind=movement のレコードは Movement のまま返す", () => {
    const m = movement("m-1", 0);
    expect(normalizeLegacyKind(m)).toEqual(m);
  });
});

describe("DynamoDBPieceRepository.findRootById", () => {
  it("kind=work のレコードを返す", async () => {
    mockSend.mockResolvedValueOnce({ Item: baseWork });
    const repo = new DynamoDBPieceRepository();
    const result = await repo.findRootById(PieceId.from(baseWork.id));
    expect(result).toEqual(baseWork);
  });

  it("kind 欠落のレコードも Work として返す（透過正規化）", async () => {
    const { kind: _kind, ...legacyWork } = baseWork;
    void _kind;
    mockSend.mockResolvedValueOnce({ Item: legacyWork });
    const repo = new DynamoDBPieceRepository();
    const result = await repo.findRootById(PieceId.from(baseWork.id));
    expect(result?.kind).toBe("work");
    expect(result?.id).toBe(baseWork.id);
  });

  it("kind=movement のレコードは undefined を返す（Work 限定列挙）", async () => {
    mockSend.mockResolvedValueOnce({ Item: movement("m-1", 0) });
    const repo = new DynamoDBPieceRepository();
    const result = await repo.findRootById(PieceId.from("m-1"));
    expect(result).toBeUndefined();
  });

  it("parentId を持つレコード（誤って kind=work で書かれた壊れたデータ）は除外する", async () => {
    const broken = { ...baseWork, parentId: WORK_ID } as PieceWork & { parentId: string };
    mockSend.mockResolvedValueOnce({ Item: broken });
    const repo = new DynamoDBPieceRepository();
    const result = await repo.findRootById(PieceId.from(baseWork.id));
    expect(result).toBeUndefined();
  });
});

describe("DynamoDBPieceRepository.findRootPage", () => {
  it("Movement を除外して Work のみ返す", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [baseWork, movement("m-1", 0), { ...baseWork, id: "piece-2" }],
      LastEvaluatedKey: undefined,
    });
    const repo = new DynamoDBPieceRepository();
    const result = await repo.findRootPage({ limit: 10 });
    expect(result.items).toHaveLength(2);
    expect(result.items.every((p) => p.kind === "work")).toBe(true);
  });

  it("kind 欠落のレコードも Work として含む", async () => {
    const { kind: _kind, ...legacyWork } = baseWork;
    void _kind;
    mockSend.mockResolvedValueOnce({
      Items: [legacyWork, movement("m-1", 0)],
      LastEvaluatedKey: undefined,
    });
    const repo = new DynamoDBPieceRepository();
    const result = await repo.findRootPage({ limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].kind).toBe("work");
  });

  it("lastEvaluatedKey を伝搬する", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [baseWork],
      LastEvaluatedKey: { id: "piece-1" },
    });
    const repo = new DynamoDBPieceRepository();
    const result = await repo.findRootPage({ limit: 10 });
    expect(result.lastEvaluatedKey).toEqual({ id: "piece-1" });
  });
});

describe("DynamoDBPieceRepository.findChildren", () => {
  it("parentId-index-index GSI を Query して Movement を返す", async () => {
    const movements = [movement("m-1", 0), movement("m-2", 1)];
    mockSend.mockResolvedValueOnce({ Items: movements, LastEvaluatedKey: undefined });
    const repo = new DynamoDBPieceRepository();
    const result = await repo.findChildren(PieceId.from(WORK_ID));

    expect(result).toEqual(movements);
    const calledWith = mockSend.mock.calls[0][0] as { input: Record<string, unknown> };
    expect(calledWith.input).toMatchObject({
      IndexName: "parentId-index-index",
      KeyConditionExpression: "parentId = :parentId",
      ExpressionAttributeValues: { ":parentId": WORK_ID },
    });
    expect(calledWith.input.Limit).toBeUndefined();
  });

  it("ページがある場合はすべて回収する", async () => {
    mockSend
      .mockResolvedValueOnce({ Items: [movement("m-1", 0)], LastEvaluatedKey: { id: "m-1" } })
      .mockResolvedValueOnce({ Items: [movement("m-2", 1)], LastEvaluatedKey: undefined });
    const repo = new DynamoDBPieceRepository();
    const result = await repo.findChildren(PieceId.from(WORK_ID));
    expect(result).toHaveLength(2);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("Movement 以外（誤データ）は除外する", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [movement("m-1", 0), { ...baseWork, parentId: WORK_ID }],
      LastEvaluatedKey: undefined,
    });
    const repo = new DynamoDBPieceRepository();
    const result = await repo.findChildren(PieceId.from(WORK_ID));
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("movement");
  });
});

describe("DynamoDBPieceRepository.removeWorkCascade", () => {
  it("子 Movement が無ければ Work のみ単発 Delete する", async () => {
    // findChildren の Query 呼び出し
    mockSend.mockResolvedValueOnce({ Items: [], LastEvaluatedKey: undefined });
    // 単発 Delete 呼び出し
    mockSend.mockResolvedValueOnce({});
    const repo = new DynamoDBPieceRepository();
    await repo.removeWorkCascade(PieceId.from(WORK_ID));

    expect(mockSend).toHaveBeenCalledTimes(2);
    const deleteCall = mockSend.mock.calls[1][0] as { input: Record<string, unknown> };
    expect(deleteCall.input).toEqual({
      TableName: expect.any(String),
      Key: { id: WORK_ID },
    });
  });

  it("子 Movement があれば TransactWriteItems で Work + Movement を一括 Delete する", async () => {
    const movements = [movement("m-1", 0), movement("m-2", 1)];
    mockSend.mockResolvedValueOnce({ Items: movements, LastEvaluatedKey: undefined });
    mockSend.mockResolvedValueOnce({});
    const repo = new DynamoDBPieceRepository();
    await repo.removeWorkCascade(PieceId.from(WORK_ID));

    expect(mockSend).toHaveBeenCalledTimes(2);
    const transact = mockSend.mock.calls[1][0] as { input: { TransactItems: unknown[] } };
    expect(transact.input.TransactItems).toHaveLength(3);
    expect(transact.input.TransactItems[0]).toMatchObject({
      Delete: { Key: { id: WORK_ID } },
    });
    expect(transact.input.TransactItems[1]).toMatchObject({ Delete: { Key: { id: "m-1" } } });
    expect(transact.input.TransactItems[2]).toMatchObject({ Delete: { Key: { id: "m-2" } } });
  });
});

describe("DynamoDBPieceRepository.replaceMovements", () => {
  it("既存子の Delete + 新規子の Put を 1 つの TransactWriteItems で実行する", async () => {
    const existing = [movement("m-old", 0)];
    const newMovements = [movement("m-new-1", 0), movement("m-new-2", 1)];
    mockSend.mockResolvedValueOnce({ Items: existing, LastEvaluatedKey: undefined });
    mockSend.mockResolvedValueOnce({});
    const repo = new DynamoDBPieceRepository();
    await repo.replaceMovements(PieceId.from(WORK_ID), newMovements);

    expect(mockSend).toHaveBeenCalledTimes(2);
    const transact = mockSend.mock.calls[1][0] as {
      input: { TransactItems: Array<{ Delete?: unknown; Put?: unknown }> };
    };
    const deletes = transact.input.TransactItems.filter((t) => "Delete" in t);
    const puts = transact.input.TransactItems.filter((t) => "Put" in t);
    expect(deletes).toHaveLength(1);
    expect(puts).toHaveLength(2);
  });

  it("既存子も新規子も無ければ何もしない（DynamoDB 呼び出しは Query のみ）", async () => {
    mockSend.mockResolvedValueOnce({ Items: [], LastEvaluatedKey: undefined });
    const repo = new DynamoDBPieceRepository();
    await repo.replaceMovements(PieceId.from(WORK_ID), []);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("新規子だけのとき（既存無し）も Put のみで Transact 実行する", async () => {
    mockSend.mockResolvedValueOnce({ Items: [], LastEvaluatedKey: undefined });
    mockSend.mockResolvedValueOnce({});
    const repo = new DynamoDBPieceRepository();
    await repo.replaceMovements(PieceId.from(WORK_ID), [movement("m-new", 0)]);

    expect(mockSend).toHaveBeenCalledTimes(2);
    const transact = mockSend.mock.calls[1][0] as {
      input: { TransactItems: Array<{ Delete?: unknown; Put?: unknown }> };
    };
    expect(transact.input.TransactItems).toHaveLength(1);
    expect(transact.input.TransactItems[0]).toHaveProperty("Put");
  });
});
