import { beforeEach, describe, expect, it, vi } from "vitest";

import { runMigration } from "./index";

type Composer = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type LegacyPiece = {
  id: string;
  title: string;
  composer?: string;
  composerId?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
};

const makeLegacyPiece = (
  id: string,
  composer: string | undefined,
  overrides: Partial<LegacyPiece> = {}
): LegacyPiece => ({
  id,
  title: `曲 ${id}`,
  composer,
  createdAt: "2024-06-01T09:00:00.000Z",
  updatedAt: "2024-06-01T09:00:00.000Z",
  ...overrides,
});

const makeComposer = (id: string, name: string): Composer => ({
  id,
  name,
  createdAt: "2024-06-01T09:00:00.000Z",
  updatedAt: "2024-06-01T09:00:00.000Z",
});

describe("runMigration", () => {
  const savePiece = vi.fn();
  const saveComposer = vi.fn();

  const runWithFixtures = (
    pieces: LegacyPiece[],
    composers: Composer[],
    options: { dryRun?: boolean } = {}
  ) =>
    runMigration(
      {
        scanAllPieces: async () => pieces,
        scanAllComposers: async () => composers,
        savePiece,
        saveComposer,
      },
      options
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("全 Piece が新規の場合、全て migrate される", async () => {
    const pieces = [makeLegacyPiece("p1", "ベートーヴェン"), makeLegacyPiece("p2", "モーツァルト")];
    const summary = await runWithFixtures(pieces, []);

    expect(summary.total).toBe(2);
    expect(summary.migrated).toBe(2);
    expect(summary.createdComposers).toBe(2);
    expect(summary.skippedAlreadyMigrated).toBe(0);
    expect(saveComposer).toHaveBeenCalledTimes(2);
    expect(savePiece).toHaveBeenCalledTimes(2);
  });

  it("既に composerId を持つ Piece は skip する（べき等性）", async () => {
    const pieces = [
      { ...makeLegacyPiece("p1", undefined), composerId: "existing-id" },
      makeLegacyPiece("p2", "モーツァルト"),
    ];
    const summary = await runWithFixtures(pieces, []);

    expect(summary.migrated).toBe(1);
    expect(summary.skippedAlreadyMigrated).toBe(1);
    expect(savePiece).toHaveBeenCalledTimes(1);
  });

  it("同じ composer 名の Piece が複数あっても Composer は 1 件だけ作られる", async () => {
    const pieces = [
      makeLegacyPiece("p1", "ベートーヴェン"),
      makeLegacyPiece("p2", "ベートーヴェン"),
      makeLegacyPiece("p3", "ベートーヴェン"),
    ];
    const summary = await runWithFixtures(pieces, []);

    expect(summary.migrated).toBe(3);
    expect(summary.createdComposers).toBe(1);
    expect(saveComposer).toHaveBeenCalledTimes(1);
    expect(savePiece).toHaveBeenCalledTimes(3);
    const savedPieces = savePiece.mock.calls.map((call) => call[0] as { composerId: string });
    expect(savedPieces[0].composerId).toBe(savedPieces[1].composerId);
    expect(savedPieces[1].composerId).toBe(savedPieces[2].composerId);
  });

  it("composer 文字列が空/undefined の Piece は skip する", async () => {
    const pieces = [
      makeLegacyPiece("p1", ""),
      makeLegacyPiece("p2", undefined),
      makeLegacyPiece("p3", "   "),
    ];
    const summary = await runWithFixtures(pieces, []);

    expect(summary.skippedNoComposer).toBe(3);
    expect(summary.migrated).toBe(0);
    expect(savePiece).not.toHaveBeenCalled();
    expect(saveComposer).not.toHaveBeenCalled();
  });

  it("Composer マスタに既存名があれば新規作成しない", async () => {
    const existing = makeComposer("existing-composer-id", "ベートーヴェン");
    const pieces = [makeLegacyPiece("p1", "ベートーヴェン")];
    const summary = await runWithFixtures(pieces, [existing]);

    expect(summary.createdComposers).toBe(0);
    expect(summary.migrated).toBe(1);
    expect(saveComposer).not.toHaveBeenCalled();
    const savedPiece = savePiece.mock.calls[0][0] as { composerId: string };
    expect(savedPiece.composerId).toBe("existing-composer-id");
  });

  it("composer 名の前後空白は trim して名寄せする", async () => {
    const existing = makeComposer("existing-id", "モーツァルト");
    const pieces = [makeLegacyPiece("p1", "  モーツァルト  ")];
    const summary = await runWithFixtures(pieces, [existing]);

    expect(summary.createdComposers).toBe(0);
    expect(summary.migrated).toBe(1);
    const savedPiece = savePiece.mock.calls[0][0] as { composerId: string };
    expect(savedPiece.composerId).toBe("existing-id");
  });

  it("dryRun=true のとき write 系は呼ばれない", async () => {
    const pieces = [makeLegacyPiece("p1", "ベートーヴェン")];
    const summary = await runWithFixtures(pieces, [], { dryRun: true });

    expect(summary.dryRun).toBe(true);
    expect(summary.migrated).toBe(1);
    expect(summary.createdComposers).toBe(1);
    expect(savePiece).not.toHaveBeenCalled();
    expect(saveComposer).not.toHaveBeenCalled();
  });

  it("migrate 後の Piece には composer フィールドが残らない", async () => {
    const pieces = [makeLegacyPiece("p1", "ベートーヴェン", { videoUrl: "https://y.tube/v" })];
    await runWithFixtures(pieces, []);

    const savedPiece = savePiece.mock.calls[0][0] as {
      composer?: string;
      composerId?: string;
      videoUrl?: string;
    };
    expect(savedPiece.composer).toBeUndefined();
    expect(savedPiece.composerId).toBeDefined();
    expect(savedPiece.videoUrl).toBe("https://y.tube/v");
  });
});
