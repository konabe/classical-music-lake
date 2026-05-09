import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Piece の `kind` フィールドが未設定のレコードに `kind = "work"` を埋める一発移行スクリプト。
 *
 * Composite モデル（PR1）導入前に作成されたレコードは `kind` を持たない。
 * `DynamoDBPieceRepository` は読み込み時に `kind: "work"` を補完して動作するが、
 * 永続化されたデータ自体を正規化することで透過的な互換ロジックを将来削除可能にする。
 *
 * 既存のレイヤードアーキテクチャ（handlers / usecases / repositories / domain）とは独立しており、
 * 一時的な移行コードが本体の依存関係を汚さないように `backend/src/migrations/` 配下に閉じ込めている。
 *
 * 動作:
 * - べき等: 既に `kind` を持つ Piece は skip する（`kind === "work" | "movement"`）
 * - `kind` 未設定の Piece に `kind = "work"` を付与して PutItem
 * - `id` / `createdAt` / `updatedAt` を含む既存フィールドは触らない（updatedAt も更新しない）
 * - `dryRun: true` のとき DB 書き込みを行わずログ出力のみ
 */

type PieceRecord = {
  id: string;
  kind?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
};

export type MigrateEvent = {
  dryRun?: boolean;
};

export type MigrateSummary = {
  total: number;
  backfilled: number;
  skippedAlreadyKind: number;
  dryRun: boolean;
};

export type MigrationDeps = {
  scanAllPieces: () => Promise<PieceRecord[]>;
  savePiece: (piece: PieceRecord) => Promise<void>;
};

export async function runMigration(
  deps: MigrationDeps,
  event: MigrateEvent = {},
): Promise<MigrateSummary> {
  const dryRun = event.dryRun === true;
  const pieces = await deps.scanAllPieces();

  const summary: MigrateSummary = {
    total: pieces.length,
    backfilled: 0,
    skippedAlreadyKind: 0,
    dryRun,
  };

  for (const piece of pieces) {
    if (piece.kind === "work" || piece.kind === "movement") {
      summary.skippedAlreadyKind += 1;
      console.log({ pieceId: piece.id, action: "skipped-already-kind", kind: piece.kind });
      continue;
    }

    const backfilled: PieceRecord = { ...piece, kind: "work" };
    if (!dryRun) {
      await deps.savePiece(backfilled);
    }
    summary.backfilled += 1;
    console.log({
      pieceId: piece.id,
      action: dryRun ? "would-backfill-kind" : "backfilled-kind",
      kind: "work",
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

  const scanAll = async (): Promise<PieceRecord[]> => {
    const items: PieceRecord[] = [];
    let cursor: Record<string, unknown> | undefined;
    do {
      const result = await dynamo.send(
        new ScanCommand({ TableName: piecesTable, ExclusiveStartKey: cursor }),
      );
      items.push(...((result.Items ?? []) as PieceRecord[]));
      cursor = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (cursor !== undefined);
    return items;
  };

  return {
    scanAllPieces: scanAll,
    savePiece: async (piece) => {
      await dynamo.send(new PutCommand({ TableName: piecesTable, Item: piece }));
    },
  };
}

export const handler = async (event: MigrateEvent = {}): Promise<MigrateSummary> => {
  return runMigration(makeDefaultDeps(), event);
};
