import { PieceId } from "@/domain/value-objects/ids";
import type { Piece, PieceMovement, PieceWork } from "@/types";
import { DynamoDBPieceRepository } from "@/repositories/piece-repository";

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

vi.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: vi.fn(),
  ConditionalCheckFailedException: class ConditionalCheckFailedException extends Error {
    constructor(message?: string) {
      super(message);
      this.name = "ConditionalCheckFailedException";
    }
  },
}));

vi.mock("@aws-sdk/lib-dynamodb", async () => {
  const actual =
    await vi.importActual<typeof import("@aws-sdk/lib-dynamodb")>("@aws-sdk/lib-dynamodb");
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: vi.fn().mockReturnValue({ send: mockSend }),
    },
  };
});

const normalizeLegacyVideoUrl = DynamoDBPieceRepository.normalizeLegacyVideoUrl;

const basePiece: Piece = {
  kind: "work",
  id: "piece-1",
  title: "交響曲第9番",
  composerId: "00000000-0000-4000-8000-000000000001",
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

describe("normalizeLegacyVideoUrl", () => {
  it("undefined はそのまま undefined を返す", () => {
    expect(normalizeLegacyVideoUrl(undefined)).toBeUndefined();
  });

  it("videoUrl も videoUrls もない Piece はそのまま返す", () => {
    const result = normalizeLegacyVideoUrl(basePiece);
    expect(result).toEqual(basePiece);
  });

  it("videoUrls だけを持つ Piece はそのまま返す", () => {
    const piece: Piece = { ...basePiece, videoUrls: ["https://www.youtube.com/watch?v=abc"] };
    const result = normalizeLegacyVideoUrl(piece);
    expect(result).toEqual(piece);
  });

  it("レガシー videoUrl のみを持つ Piece は videoUrls 配列に変換される", () => {
    const legacy = { ...basePiece, videoUrl: "https://www.youtube.com/watch?v=abc" } as Piece;
    const result = normalizeLegacyVideoUrl(legacy);
    expect(result?.videoUrls).toEqual(["https://www.youtube.com/watch?v=abc"]);
    expect((result as Piece & { videoUrl?: string }).videoUrl).toBeUndefined();
  });

  it("空文字の videoUrl は無視される（videoUrls には含めない）", () => {
    const legacy = { ...basePiece, videoUrl: "" } as Piece;
    const result = normalizeLegacyVideoUrl(legacy);
    expect(result?.videoUrls).toBeUndefined();
    expect((result as Piece & { videoUrl?: string }).videoUrl).toBeUndefined();
  });

  it("videoUrls がすでに存在する場合はレガシー videoUrl を捨て、新フィールドを優先する", () => {
    const data = {
      ...basePiece,
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
    expect(DynamoDBPieceRepository.normalizeLegacyKind(undefined)).toBeUndefined();
  });

  it("kind を持たない既存レコードは kind: 'work' を補完する", () => {
    const legacy = {
      id: "piece-1",
      title: "交響曲第9番",
      composerId: "00000000-0000-4000-8000-000000000001",
      createdAt: "2024-01-15T20:00:00.000Z",
      updatedAt: "2024-01-15T20:00:00.000Z",
    } as unknown as Piece;
    const result = DynamoDBPieceRepository.normalizeLegacyKind(legacy);
    expect(result?.kind).toBe("work");
  });

  it("kind: 'work' を持つレコードはそのまま返す", () => {
    const result = DynamoDBPieceRepository.normalizeLegacyKind(basePiece);
    expect(result).toEqual(basePiece);
  });

  it("kind: 'movement' を持つレコードはそのまま返す", () => {
    const movement: PieceMovement = {
      kind: "movement",
      id: "movement-1",
      parentId: "piece-1",
      index: 0,
      title: "第1楽章",
      createdAt: "2024-01-15T20:00:00.000Z",
      updatedAt: "2024-01-15T20:00:00.000Z",
    };
    const result = DynamoDBPieceRepository.normalizeLegacyKind(movement);
    expect(result).toEqual(movement);
  });
});

const PARENT_ID = "00000000-0000-4000-8000-00000000aaaa";
const CHILD_1_ID = "00000000-0000-4000-8000-00000000bbb1";
const CHILD_2_ID = "00000000-0000-4000-8000-00000000bbb2";

const makeMovement = (id: string, index: number, parentId = PARENT_ID): PieceMovement => ({
  kind: "movement",
  id,
  parentId,
  index,
  title: `第${index + 1}楽章`,
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
});

describe("findChildren", () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it("parentId-index-index GSI を Query して Movement を index 昇順で返す", async () => {
    const child1 = makeMovement(CHILD_1_ID, 0);
    const child2 = makeMovement(CHILD_2_ID, 1);
    mockSend.mockResolvedValueOnce({ Items: [child1, child2], LastEvaluatedKey: undefined });

    const repo = new DynamoDBPieceRepository();
    const result = await repo.findChildren(PieceId.from(PARENT_ID));

    expect(result).toEqual([child1, child2]);
    expect(mockSend).toHaveBeenCalledTimes(1);
    const queryArg = mockSend.mock.calls[0]?.[0];
    expect(queryArg?.input?.IndexName).toBe("parentId-index-index");
    expect(queryArg?.input?.KeyConditionExpression).toBe("parentId = :parentId");
    expect(queryArg?.input?.ExpressionAttributeValues?.[":parentId"]).toBe(PARENT_ID);
  });

  it("LastEvaluatedKey が返ったら次ページも取得する", async () => {
    const child1 = makeMovement(CHILD_1_ID, 0);
    const child2 = makeMovement(CHILD_2_ID, 1);
    const cursor = { id: child1.id, parentId: PARENT_ID, index: 0 };
    mockSend
      .mockResolvedValueOnce({ Items: [child1], LastEvaluatedKey: cursor })
      .mockResolvedValueOnce({ Items: [child2], LastEvaluatedKey: undefined });

    const repo = new DynamoDBPieceRepository();
    const result = await repo.findChildren(PieceId.from(PARENT_ID));

    expect(result).toEqual([child1, child2]);
    expect(mockSend).toHaveBeenCalledTimes(2);
    const secondQuery = mockSend.mock.calls[1]?.[0];
    expect(secondQuery?.input?.ExclusiveStartKey).toEqual(cursor);
  });

  it("Work レコードが紛れ込んだ場合は除外する", async () => {
    const child = makeMovement(CHILD_1_ID, 0);
    const intruderWork: PieceWork = { ...basePiece, id: "intruder" } as PieceWork;
    mockSend.mockResolvedValueOnce({
      Items: [child, intruderWork],
      LastEvaluatedKey: undefined,
    });

    const repo = new DynamoDBPieceRepository();
    const result = await repo.findChildren(PieceId.from(PARENT_ID));

    expect(result).toEqual([child]);
  });

  it("該当 Movement が無い場合は空配列を返す", async () => {
    mockSend.mockResolvedValueOnce({ Items: [], LastEvaluatedKey: undefined });

    const repo = new DynamoDBPieceRepository();
    const result = await repo.findChildren(PieceId.from(PARENT_ID));

    expect(result).toEqual([]);
  });
});

describe("removeWorkCascade", () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it("子 Movement が無い場合は単純な DeleteCommand を発行する", async () => {
    mockSend.mockResolvedValueOnce({ Items: [], LastEvaluatedKey: undefined });
    mockSend.mockResolvedValueOnce({});

    const repo = new DynamoDBPieceRepository();
    await repo.removeWorkCascade(PieceId.from(PARENT_ID));

    expect(mockSend).toHaveBeenCalledTimes(2);
    const deleteArg = mockSend.mock.calls[1]?.[0];
    expect(deleteArg?.input?.Key).toEqual({ id: PARENT_ID });
    expect(deleteArg?.input?.TableName).toBeDefined();
  });

  it("子 Movement がある場合は TransactWriteItems で Work と Movement を一括削除する", async () => {
    const child1 = makeMovement(CHILD_1_ID, 0);
    const child2 = makeMovement(CHILD_2_ID, 1);
    mockSend.mockResolvedValueOnce({ Items: [child1, child2], LastEvaluatedKey: undefined });
    mockSend.mockResolvedValueOnce({});

    const repo = new DynamoDBPieceRepository();
    await repo.removeWorkCascade(PieceId.from(PARENT_ID));

    expect(mockSend).toHaveBeenCalledTimes(2);
    const txArg = mockSend.mock.calls[1]?.[0];
    const transactItems = txArg?.input?.TransactItems;
    expect(transactItems).toHaveLength(3);
    expect(transactItems?.[0]?.Delete?.Key).toEqual({ id: PARENT_ID });
    expect(transactItems?.[1]?.Delete?.Key).toEqual({ id: CHILD_1_ID });
    expect(transactItems?.[2]?.Delete?.Key).toEqual({ id: CHILD_2_ID });
  });
});

describe("replaceMovements", () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it("既存子の Delete + 新規 Put を 1 つの TransactWriteItems で実行する", async () => {
    const existing = makeMovement(CHILD_1_ID, 0);
    const next1 = makeMovement(CHILD_2_ID, 0);
    const next2 = makeMovement("00000000-0000-4000-8000-00000000bbb3", 1);
    mockSend.mockResolvedValueOnce({ Items: [existing], LastEvaluatedKey: undefined });
    mockSend.mockResolvedValueOnce({});

    const repo = new DynamoDBPieceRepository();
    await repo.replaceMovements(PieceId.from(PARENT_ID), [next1, next2]);

    expect(mockSend).toHaveBeenCalledTimes(2);
    const txArg = mockSend.mock.calls[1]?.[0];
    const transactItems = txArg?.input?.TransactItems;
    expect(transactItems).toHaveLength(3);
    expect(transactItems?.[0]?.Delete?.Key).toEqual({ id: CHILD_1_ID });
    expect(transactItems?.[1]?.Put?.Item).toEqual(next1);
    expect(transactItems?.[2]?.Put?.Item).toEqual(next2);
  });

  it("既存子も新規 Movement も 0 件の場合は何もしない（送信 0 回）", async () => {
    mockSend.mockResolvedValueOnce({ Items: [], LastEvaluatedKey: undefined });

    const repo = new DynamoDBPieceRepository();
    await repo.replaceMovements(PieceId.from(PARENT_ID), []);

    // findChildren のクエリだけ。TransactWrite は呼ばれない。
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("parentId が一致しない Movement が混ざっている場合は例外を投げる", async () => {
    const wrongParent = makeMovement(CHILD_1_ID, 0, "00000000-0000-4000-8000-00000000ffff");

    const repo = new DynamoDBPieceRepository();
    await expect(repo.replaceMovements(PieceId.from(PARENT_ID), [wrongParent])).rejects.toThrow(
      /All movements must belong to the specified workId/,
    );
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("workOptimisticLock を渡すと Work の楽観的ロック付き Put をトランザクションの先頭に含める", async () => {
    const next = makeMovement(CHILD_1_ID, 0);
    const work: PieceWork = { ...basePiece, id: PARENT_ID } as PieceWork;
    mockSend.mockResolvedValueOnce({ Items: [], LastEvaluatedKey: undefined });
    mockSend.mockResolvedValueOnce({});

    const repo = new DynamoDBPieceRepository();
    await repo.replaceMovements(PieceId.from(PARENT_ID), [next], {
      work,
      prevUpdatedAt: "2024-01-15T20:00:00.000Z",
    });

    const txArg = mockSend.mock.calls[1]?.[0];
    const transactItems = txArg?.input?.TransactItems;
    expect(transactItems).toHaveLength(2);
    expect(transactItems?.[0]?.Put?.Item).toEqual(work);
    expect(transactItems?.[0]?.Put?.ConditionExpression).toBe("updatedAt = :prevUpdatedAt");
    expect(transactItems?.[0]?.Put?.ExpressionAttributeValues?.[":prevUpdatedAt"]).toBe(
      "2024-01-15T20:00:00.000Z",
    );
    expect(transactItems?.[1]?.Put?.Item).toEqual(next);
  });
});
