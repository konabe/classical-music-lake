import { beforeEach, describe, expect, it, vi } from "vitest";

import { MigrateComposerUsecase, type LegacyPiece } from "./migrate-composer-usecase";
import type { Composer, Piece } from "../types";

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

describe("MigrateComposerUsecase", () => {
  const pieceRepo = {
    save: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findPage: vi.fn(),
    saveWithOptimisticLock: vi.fn(),
    remove: vi.fn(),
  };
  const composerRepo = {
    save: vi.fn(),
    findById: vi.fn(),
    findPage: vi.fn(),
    saveWithOptimisticLock: vi.fn(),
    remove: vi.fn(),
  };

  const mockComposers = (items: Composer[]) => {
    composerRepo.findPage.mockResolvedValue({ items, lastEvaluatedKey: undefined });
  };
  const mockPieces = (items: LegacyPiece[]) => {
    pieceRepo.findAll.mockResolvedValue(items);
  };

  const runWithFixtures = async (
    pieces: LegacyPiece[],
    composers: Composer[],
    options: { dryRun?: boolean } = {}
  ) => {
    mockPieces(pieces);
    mockComposers(composers);
    const usecase = new MigrateComposerUsecase(pieceRepo, composerRepo);
    return usecase.run(options);
  };

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
    expect(composerRepo.save).toHaveBeenCalledTimes(2);
    expect(pieceRepo.save).toHaveBeenCalledTimes(2);
  });

  it("既に composerId を持つ Piece は skip する（べき等性）", async () => {
    const pieces = [
      { ...makeLegacyPiece("p1", undefined), composerId: "existing-id" },
      makeLegacyPiece("p2", "モーツァルト"),
    ];
    const summary = await runWithFixtures(pieces, []);

    expect(summary.migrated).toBe(1);
    expect(summary.skippedAlreadyMigrated).toBe(1);
    expect(pieceRepo.save).toHaveBeenCalledTimes(1);
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
    expect(composerRepo.save).toHaveBeenCalledTimes(1);
    expect(pieceRepo.save).toHaveBeenCalledTimes(3);
    const savedPieces = pieceRepo.save.mock.calls.map((call) => call[0] as Piece);
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
    expect(pieceRepo.save).not.toHaveBeenCalled();
    expect(composerRepo.save).not.toHaveBeenCalled();
  });

  it("Composer マスタに既存名があれば新規作成しない", async () => {
    const existing = makeComposer("existing-composer-id", "ベートーヴェン");
    const pieces = [makeLegacyPiece("p1", "ベートーヴェン")];
    const summary = await runWithFixtures(pieces, [existing]);

    expect(summary.createdComposers).toBe(0);
    expect(summary.migrated).toBe(1);
    expect(composerRepo.save).not.toHaveBeenCalled();
    const savedPiece = pieceRepo.save.mock.calls[0][0] as Piece;
    expect(savedPiece.composerId).toBe("existing-composer-id");
  });

  it("composer 名の前後空白は trim して名寄せする", async () => {
    const existing = makeComposer("existing-id", "モーツァルト");
    const pieces = [makeLegacyPiece("p1", "  モーツァルト  ")];
    const summary = await runWithFixtures(pieces, [existing]);

    expect(summary.createdComposers).toBe(0);
    expect(summary.migrated).toBe(1);
    const savedPiece = pieceRepo.save.mock.calls[0][0] as Piece;
    expect(savedPiece.composerId).toBe("existing-id");
  });

  it("dryRun=true のとき write 系は呼ばれない", async () => {
    const pieces = [makeLegacyPiece("p1", "ベートーヴェン")];
    const summary = await runWithFixtures(pieces, [], { dryRun: true });

    expect(summary.dryRun).toBe(true);
    expect(summary.migrated).toBe(1);
    expect(summary.createdComposers).toBe(1);
    expect(pieceRepo.save).not.toHaveBeenCalled();
    expect(composerRepo.save).not.toHaveBeenCalled();
  });

  it("migrate 後の Piece には composer フィールドが残らない", async () => {
    const pieces = [makeLegacyPiece("p1", "ベートーヴェン", { videoUrl: "https://y.tube/v" })];
    await runWithFixtures(pieces, []);

    const savedPiece = pieceRepo.save.mock.calls[0][0] as Piece & { composer?: string };
    expect(savedPiece.composer).toBeUndefined();
    expect(savedPiece.composerId).toBeDefined();
    expect(savedPiece.videoUrl).toBe("https://y.tube/v");
  });
});
