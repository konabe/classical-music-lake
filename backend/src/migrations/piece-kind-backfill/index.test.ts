import { runMigration } from "@/migrations/piece-kind-backfill/index";

type PieceRecord = {
  id: string;
  kind?: string;
  title?: string;
  composerId?: string;
  parentId?: string;
  index?: number;
  createdAt: string;
  updatedAt: string;
};

const makePiece = (id: string, overrides: Partial<PieceRecord> = {}): PieceRecord => ({
  id,
  title: `曲 ${id}`,
  composerId: "composer-1",
  createdAt: "2024-06-01T09:00:00.000Z",
  updatedAt: "2024-06-01T09:00:00.000Z",
  ...overrides,
});

describe("runMigration (piece-kind-backfill)", () => {
  const savePiece = vi.fn();

  const runWithFixtures = (pieces: PieceRecord[], options: { dryRun?: boolean } = {}) =>
    runMigration(
      {
        scanAllPieces: async () => pieces,
        savePiece,
      },
      options,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("kind が未設定の Piece は kind=work が付与される", async () => {
    const pieces = [makePiece("p1"), makePiece("p2")];
    const summary = await runWithFixtures(pieces);

    expect(summary.total).toBe(2);
    expect(summary.backfilled).toBe(2);
    expect(summary.skippedAlreadyKind).toBe(0);
    expect(savePiece).toHaveBeenCalledTimes(2);
    const saved = savePiece.mock.calls.map((call) => call[0] as PieceRecord);
    expect(saved[0].kind).toBe("work");
    expect(saved[1].kind).toBe("work");
  });

  it("既に kind=work を持つ Piece は skip する（べき等性）", async () => {
    const pieces = [makePiece("p1", { kind: "work" }), makePiece("p2")];
    const summary = await runWithFixtures(pieces);

    expect(summary.backfilled).toBe(1);
    expect(summary.skippedAlreadyKind).toBe(1);
    expect(savePiece).toHaveBeenCalledTimes(1);
    const saved = savePiece.mock.calls[0][0] as PieceRecord;
    expect(saved.id).toBe("p2");
  });

  it("既に kind=movement を持つ Piece も skip する（べき等性）", async () => {
    const pieces = [
      makePiece("m1", { kind: "movement", parentId: "p1", index: 0 }),
      makePiece("p1", { kind: "work" }),
      makePiece("p2"),
    ];
    const summary = await runWithFixtures(pieces);

    expect(summary.total).toBe(3);
    expect(summary.backfilled).toBe(1);
    expect(summary.skippedAlreadyKind).toBe(2);
    expect(savePiece).toHaveBeenCalledTimes(1);
    const saved = savePiece.mock.calls[0][0] as PieceRecord;
    expect(saved.id).toBe("p2");
    expect(saved.kind).toBe("work");
  });

  it("dryRun=true のとき write 系は呼ばれない", async () => {
    const pieces = [makePiece("p1"), makePiece("p2")];
    const summary = await runWithFixtures(pieces, { dryRun: true });

    expect(summary.dryRun).toBe(true);
    expect(summary.backfilled).toBe(2);
    expect(savePiece).not.toHaveBeenCalled();
  });

  it("既存フィールド（id / createdAt / updatedAt / 他属性）は変更しない", async () => {
    const pieces = [
      makePiece("p1", {
        composerId: "composer-x",
        createdAt: "2024-01-02T03:04:05.000Z",
        updatedAt: "2024-01-02T03:04:05.000Z",
      }),
    ];
    await runWithFixtures(pieces);

    const saved = savePiece.mock.calls[0][0] as PieceRecord;
    expect(saved.id).toBe("p1");
    expect(saved.composerId).toBe("composer-x");
    expect(saved.createdAt).toBe("2024-01-02T03:04:05.000Z");
    expect(saved.updatedAt).toBe("2024-01-02T03:04:05.000Z");
    expect(saved.kind).toBe("work");
  });

  it("空のテーブルでもエラーにならず total=0 を返す", async () => {
    const summary = await runWithFixtures([]);

    expect(summary.total).toBe(0);
    expect(summary.backfilled).toBe(0);
    expect(summary.skippedAlreadyKind).toBe(0);
    expect(savePiece).not.toHaveBeenCalled();
  });
});
