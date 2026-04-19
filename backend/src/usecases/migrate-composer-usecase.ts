import { randomUUID } from "node:crypto";

import type { ComposerRepository } from "../domain/composer";
import type { PieceRepository } from "../domain/piece";
import { DynamoDBComposerRepository } from "../repositories/composer-repository";
import { DynamoDBPieceRepository } from "../repositories/piece-repository";
import type { Composer, Piece } from "../types";

/**
 * 旧スキーマ（`composer: string` を持つ）で保存されている Piece を表す。
 * 移行処理の内部でだけ使う型であり、DB から読み出した生データの想定。
 */
export type LegacyPiece = Omit<Piece, "composerId"> & {
  composer?: string;
  composerId?: string;
};

export type MigrateComposerSummary = {
  total: number;
  migrated: number;
  skippedAlreadyMigrated: number;
  skippedNoComposer: number;
  createdComposers: number;
  dryRun: boolean;
};

/**
 * Piece の composer 文字列から Composer マスタへの移行を行う usecase。
 *
 * - べき等: 既に `composerId` を持つ Piece は skip する
 * - 名寄せ: `Composer.name` との完全一致（前後空白 trim）で解決し、見つからなければ新規作成する
 * - Composer の二重作成防止: 同一 batch 内で新規作成した Composer も Map に追加する
 * - dryRun: true のとき DB への書き込みを行わず、ログ出力のみ行う
 */
export class MigrateComposerUsecase {
  constructor(
    private readonly pieceRepo: PieceRepository,
    private readonly composerRepo: ComposerRepository
  ) {}

  async run(options: { dryRun?: boolean } = {}): Promise<MigrateComposerSummary> {
    const dryRun = options.dryRun === true;
    const [pieces, composers] = await Promise.all([this.listAllPieces(), this.listAllComposers()]);

    const composerByName = new Map<string, Composer>();
    for (const c of composers) {
      composerByName.set(c.name.trim(), c);
    }

    const summary: MigrateComposerSummary = {
      total: pieces.length,
      migrated: 0,
      skippedAlreadyMigrated: 0,
      skippedNoComposer: 0,
      createdComposers: 0,
      dryRun,
    };

    for (const legacy of pieces) {
      if (legacy.composerId !== undefined && legacy.composerId.length > 0) {
        summary.skippedAlreadyMigrated += 1;
        console.log({ pieceId: legacy.id, action: "skipped-already-migrated" });
        continue;
      }
      const composerName = legacy.composer?.trim();
      if (composerName === undefined || composerName.length === 0) {
        summary.skippedNoComposer += 1;
        console.warn({ pieceId: legacy.id, action: "skipped-no-composer" });
        continue;
      }

      let composer = composerByName.get(composerName);
      if (composer === undefined) {
        const now = new Date().toISOString();
        composer = {
          id: randomUUID(),
          name: composerName,
          createdAt: now,
          updatedAt: now,
        };
        if (!dryRun) {
          await this.composerRepo.save(composer);
        }
        composerByName.set(composerName, composer);
        summary.createdComposers += 1;
        console.log({
          pieceId: legacy.id,
          action: dryRun ? "would-create-composer" : "created-composer",
          composerName,
          composerId: composer.id,
        });
      }

      const migrated: Piece = {
        id: legacy.id,
        title: legacy.title,
        composerId: composer.id,
        videoUrl: legacy.videoUrl,
        genre: legacy.genre,
        era: legacy.era,
        formation: legacy.formation,
        region: legacy.region,
        createdAt: legacy.createdAt,
        updatedAt: new Date().toISOString(),
      };
      if (!dryRun) {
        await this.pieceRepo.save(migrated);
      }
      summary.migrated += 1;
      console.log({
        pieceId: legacy.id,
        action: dryRun ? "would-migrate" : "migrated",
        composerId: composer.id,
      });
    }

    console.log({ action: "migration-complete", ...summary });
    return summary;
  }

  private async listAllPieces(): Promise<LegacyPiece[]> {
    // NOSONAR: typescript:S1874 — 移行用途で全件スキャンが必要なため deprecated API を意図的に使用
    const all = await this.pieceRepo.findAll();
    return all as unknown as LegacyPiece[];
  }

  private async listAllComposers(): Promise<Composer[]> {
    const items: Composer[] = [];
    let cursor: Record<string, unknown> | undefined;
    do {
      const page = await this.composerRepo.findPage({ limit: 100, exclusiveStartKey: cursor });
      items.push(...page.items);
      cursor = page.lastEvaluatedKey;
    } while (cursor !== undefined);
    return items;
  }
}

export const createMigrateComposerUsecase = () =>
  new MigrateComposerUsecase(new DynamoDBPieceRepository(), new DynamoDBComposerRepository());
