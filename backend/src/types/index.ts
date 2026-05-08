// 楽曲カテゴリ（shared/constants.ts から re-export）
import type { PieceGenre, PieceEra, PieceFormation, PieceRegion } from "../../../shared/constants";
export {
  PIECE_GENRES,
  PIECE_ERAS,
  PIECE_FORMATIONS,
  PIECE_REGIONS,
  PIECE_KINDS,
  MOVEMENTS_PER_WORK_MAX,
  MOVEMENT_INDEX_MIN,
  MOVEMENT_INDEX_MAX,
  PIECES_PAGE_SIZE_MIN,
  PIECES_PAGE_SIZE_MAX,
  PIECES_PAGE_SIZE_DEFAULT,
  PIECES_ALL_MAX_TOTAL,
  PIECES_ALL_MAX_EMPTY_PAGES,
  COMPOSERS_PAGE_SIZE_MIN,
  COMPOSERS_PAGE_SIZE_MAX,
  COMPOSERS_PAGE_SIZE_DEFAULT,
} from "../../../shared/constants";
export type {
  PieceGenre,
  PieceEra,
  PieceFormation,
  PieceRegion,
  PieceKind,
} from "../../../shared/constants";
export type { Paginated } from "../../../shared/constants";

export type Rating = 1 | 2 | 3 | 4 | 5;

// バックエンド固有: Rating のバリデーション関数（フロントエンド側には存在しない）
export function isValidRating(value: unknown): value is Rating {
  return typeof value === "number" && [1, 2, 3, 4, 5].includes(value);
}

// APIエラーレスポンスのボディ型
export type ApiErrorResponse = {
  message: string;
};

// Cognito SDK のエラー型（auth/ 内で共通利用）
export interface CognitoError extends Error {
  name: string;
}

// 鑑賞ログ（曲・演奏家の記録）
export interface ListeningLog {
  id: string;
  userId: string | null; // Cognito sub（未帰属データは null）
  listenedAt: string; // ISO 8601 日時
  composer: string; // 作曲家
  piece: string; // 曲名
  pieceId?: string; // 楽曲マスタ（Piece）の id 参照（任意。未指定時は曲名+作曲家名でフォールバック解決）
  rating: Rating; // 評価 1〜5
  isFavorite: boolean; // お気に入りフラグ
  memo?: string; // 感想・メモ
  createdAt: string;
  updatedAt: string;
}

export type CreateListeningLogInput = Omit<ListeningLog, "id" | "createdAt" | "updatedAt">;
// `pieceId` は更新時に空文字 `""` を送ると当該フィールドが削除される（`buildUpdateProps` の挙動）。
export type UpdateListeningLogInput = Partial<Omit<ListeningLog, "id" | "createdAt" | "updatedAt">>;

// 楽曲マスタ（コンポジット）
//
// 楽曲は `kind` で判別される共用体:
// - `PieceWork`: 親楽曲。composerId・カテゴリを持ち、Movement の親になりうる。
// - `PieceMovement`: 楽章。`parentId` で Work を参照し、`index` で演奏順を表す。
//
// DB スキーマは PR1 時点では既存の Piece テーブル 1 つを共用する（kind / parentId / index を追加属性として保持）。
export interface PieceWork {
  kind: "work";
  id: string;
  title: string;
  composerId: string; // 作曲家マスタ（Composer）の id 参照
  videoUrls?: string[]; // 動画 URL の配列（演奏比較用に複数登録可）
  genre?: PieceGenre;
  era?: PieceEra;
  formation?: PieceFormation;
  region?: PieceRegion;
  createdAt: string;
  updatedAt: string;
}

export interface PieceMovement {
  kind: "movement";
  id: string;
  parentId: string; // 親 PieceWork の id
  index: number; // 演奏順 (0 始まり、MOVEMENT_INDEX_MAX 以下)
  title: string;
  videoUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

export type Piece = PieceWork | PieceMovement;

// `kind` を明示的に必須とする判別共用体（`PartialBy` で kind を任意化しない）
export type CreateWorkInput = Omit<PieceWork, "id" | "createdAt" | "updatedAt">;
export type CreateMovementInput = Omit<PieceMovement, "id" | "createdAt" | "updatedAt">;
export type CreatePieceInput = CreateWorkInput | CreateMovementInput;

export type UpdateWorkInput = { kind: "work" } & Partial<Omit<CreateWorkInput, "kind">>;
export type UpdateMovementInput = { kind: "movement" } & Partial<Omit<CreateMovementInput, "kind">>;
export type UpdatePieceInput = UpdateWorkInput | UpdateMovementInput;

// コンサート記録
export interface ConcertLog {
  id: string;
  userId: string; // Cognito sub（認証必須のため null なし）
  title: string; // コンサート名
  concertDate: string; // ISO 8601 日時
  venue: string; // 会場名
  conductor?: string; // 指揮者名
  orchestra?: string; // オーケストラ・アンサンブル名
  soloist?: string; // ソリスト名
  pieceIds?: string[]; // プログラム（楽曲マスタ ID の配列、演奏順）
  createdAt: string;
  updatedAt: string;
}

export type CreateConcertLogInput = Omit<ConcertLog, "id" | "userId" | "createdAt" | "updatedAt">;
export type UpdateConcertLogInput = Partial<CreateConcertLogInput>;

// 作曲家マスタ
export interface Composer {
  id: string;
  name: string; // 作曲家名（例: ベートーヴェン）
  era?: PieceEra; // 時代（楽曲マスタと共通の定数を流用）
  region?: PieceRegion; // 地域（楽曲マスタと共通の定数を流用）
  imageUrl?: string; // 肖像画像の URL（Wikimedia Commons 等のパブリックドメイン画像を想定）
  birthYear?: number; // 生年（西暦の整数。BC は負数）
  deathYear?: number; // 没年（任意。存命の場合は未指定）
  createdAt: string;
  updatedAt: string;
}

export type CreateComposerInput = Omit<Composer, "id" | "createdAt" | "updatedAt">;
// `birthYear` / `deathYear` は更新時に `null` を送ると当該フィールドが削除される（buildUpdateProps の挙動）。
export type UpdateComposerInput = Partial<Omit<CreateComposerInput, "birthYear" | "deathYear">> & {
  birthYear?: number | null;
  deathYear?: number | null;
};
