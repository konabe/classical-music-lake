// 楽曲カテゴリ（shared/constants.ts から re-export）
import type { PieceGenre, PieceEra, PieceFormation, PieceRegion } from "../../../shared/constants";
export {
  PIECE_GENRES,
  PIECE_ERAS,
  PIECE_FORMATIONS,
  PIECE_REGIONS,
  PIECES_PAGE_SIZE_MIN,
  PIECES_PAGE_SIZE_MAX,
  PIECES_PAGE_SIZE_DEFAULT,
  PIECES_ALL_MAX_TOTAL,
  PIECES_ALL_MAX_EMPTY_PAGES,
  COMPOSERS_PAGE_SIZE_MIN,
  COMPOSERS_PAGE_SIZE_MAX,
  COMPOSERS_PAGE_SIZE_DEFAULT,
} from "../../../shared/constants";
export type { PieceGenre, PieceEra, PieceFormation, PieceRegion } from "../../../shared/constants";
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
  rating: Rating; // 評価 1〜5
  isFavorite: boolean; // お気に入りフラグ
  memo?: string; // 感想・メモ
  createdAt: string;
  updatedAt: string;
}

export type CreateListeningLogInput = Omit<ListeningLog, "id" | "createdAt" | "updatedAt">;
export type UpdateListeningLogInput = Partial<Omit<ListeningLog, "id" | "createdAt" | "updatedAt">>;

// 楽曲マスタ
export interface Piece {
  id: string;
  title: string;
  composerId: string; // 作曲家マスタ（Composer）の id 参照
  videoUrl?: string;
  genre?: PieceGenre;
  era?: PieceEra;
  formation?: PieceFormation;
  region?: PieceRegion;
  createdAt: string;
  updatedAt: string;
}

export type CreatePieceInput = Omit<Piece, "id" | "createdAt" | "updatedAt">;
export type UpdatePieceInput = Partial<CreatePieceInput>;

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
  createdAt: string;
  updatedAt: string;
}

export type CreateComposerInput = Omit<Composer, "id" | "createdAt" | "updatedAt">;
export type UpdateComposerInput = Partial<CreateComposerInput>;
