import { randomUUID } from "node:crypto";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Piece の `composer: string` を `composerId: string`（Composer マスタ参照）に置き換える一発移行スクリプト。
 *
 * 既存のレイヤードアーキテクチャ（handlers / usecases / repositories / domain）とは独立しており、
 * 一時的な移行コードが本体の依存関係を汚さないように `backend/src/migrations/` 配下に閉じ込めている。
 * デプロイ先の CDK スタックも `MigrationsStack` として本番スタックから分離する。
 *
 * 動作:
 * - べき等: 既に `composerId` を持つ Piece は skip する
 * - 名寄せ: `Composer.name` の前後空白 trim での完全一致で解決、見つからなければ新規作成
 * - Composer の二重作成防止: 同一 batch 内で新規作成した Composer も Map に追加
 * - `dryRun: true` のとき DB 書き込みを行わずログ出力のみ
 */

type Composer = {
  id: string;
  name: string;
  era?: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
};

type LegacyPiece = {
  id: string;
  title: string;
  composer?: string;
  composerId?: string;
  videoUrl?: string;
  genre?: string;
  era?: string;
  formation?: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
};

type MigratedPiece = Omit<LegacyPiece, "composer"> & { composerId: string };

export type MigrateEvent = {
  dryRun?: boolean;
};

export type MigrateSummary = {
  total: number;
  migrated: number;
  skippedAlreadyMigrated: number;
  skippedNoComposer: number;
  createdComposers: number;
  dryRun: boolean;
};

export type MigrationDeps = {
  scanAllPieces: () => Promise<LegacyPiece[]>;
  scanAllComposers: () => Promise<Composer[]>;
  savePiece: (piece: MigratedPiece) => Promise<void>;
  saveComposer: (composer: Composer) => Promise<void>;
};

export async function runMigration(
  deps: MigrationDeps,
  event: MigrateEvent = {},
): Promise<MigrateSummary> {
  const dryRun = event.dryRun === true;
  const [pieces, composers] = await Promise.all([deps.scanAllPieces(), deps.scanAllComposers()]);

  const composerByName = new Map<string, Composer>();
  for (const c of composers) {
    composerByName.set(c.name.trim(), c);
  }

  const summary: MigrateSummary = {
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
      composer = { id: randomUUID(), name: composerName, createdAt: now, updatedAt: now };
      if (!dryRun) {
        await deps.saveComposer(composer);
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

    const migrated: MigratedPiece = {
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
      await deps.savePiece(migrated);
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

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Required environment variable is missing: ${name}`);
  }
  return value;
}

function makeDefaultDeps(): MigrationDeps {
  const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? "ap-northeast-1" });
  const dynamo = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });
  const piecesTable = requireEnv("DYNAMO_TABLE_PIECES");
  const composersTable = requireEnv("DYNAMO_TABLE_COMPOSERS");

  const scanAll = async <T>(tableName: string): Promise<T[]> => {
    const items: T[] = [];
    let cursor: Record<string, unknown> | undefined;
    do {
      const result = await dynamo.send(
        new ScanCommand({ TableName: tableName, ExclusiveStartKey: cursor }),
      );
      items.push(...((result.Items ?? []) as T[]));
      cursor = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (cursor !== undefined);
    return items;
  };

  return {
    scanAllPieces: () => scanAll<LegacyPiece>(piecesTable),
    scanAllComposers: () => scanAll<Composer>(composersTable),
    savePiece: async (piece) => {
      await dynamo.send(new PutCommand({ TableName: piecesTable, Item: piece }));
    },
    saveComposer: async (composer) => {
      await dynamo.send(new PutCommand({ TableName: composersTable, Item: composer }));
    },
  };
}

export const handler = async (event: MigrateEvent = {}): Promise<MigrateSummary> => {
  return runMigration(makeDefaultDeps(), event);
};
