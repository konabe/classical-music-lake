/**
 * バックエンド共通型定義
 *
 * ## 管理方針
 * - このファイルはバックエンド（Lambda）専用の型定義を管理する
 * - フロント・バックエンド共通の定数・型は shared/ に定義し、このファイルから re-export する
 * - app/types/index.ts と共有すべき型（ListeningLog, Piece, Rating など）は
 *   両ファイルで重複定義する（パッケージを分離しているため）
 * - 共有型を変更する場合は、必ず app/types/index.ts も同時に更新すること
 * - isValidRating などのバックエンド固有のバリデーション関数はこのファイルにのみ存在する
 *   （フロントエンド側には不要なため移植しない）
 *
 * ## 変更時のチェックリスト
 * - [ ] 共有定数・型を変更した場合、shared/ のファイルを編集したか
 * - [ ] 共有型を変更した場合、app/types/index.ts にも同じ変更を加えたか
 * - [ ] バックエンド固有の型・関数のみを追加・変更した場合、フロントエンド側への影響はないか確認したか
 */

// 評価値（1〜5 の整数）
// ※ app/types/index.ts と同期を保つこと
// 楽曲カテゴリ（shared/constants.ts から re-export）
import {
  PIECE_GENRES,
  PIECE_ERAS,
  PIECE_FORMATIONS,
  PIECE_REGIONS,
  type PieceGenre,
  type PieceEra,
  type PieceFormation,
  type PieceRegion,
} from "../../../shared/constants";

export type Rating = 1 | 2 | 3 | 4 | 5;

// バックエンド固有: Rating のバリデーション関数（フロントエンド側には存在しない）
export function isValidRating(value: unknown): value is Rating {
  return typeof value === "number" && [1, 2, 3, 4, 5].includes(value);
}

// APIエラーレスポンスのボディ型
// ※ app/types/index.ts と同期を保つこと
export type ApiErrorResponse = {
  message: string;
};

// Cognito SDK のエラー型（auth/ 内で共通利用）
export interface CognitoError extends Error {
  name: string;
}

// 鑑賞ログ（曲・演奏家の記録）
// ※ app/types/index.ts と同期を保つこと
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
export { PIECE_GENRES, PIECE_ERAS, PIECE_FORMATIONS, PIECE_REGIONS };
export type { PieceGenre, PieceEra, PieceFormation, PieceRegion };

// 楽曲マスタ
// ※ app/types/index.ts と同期を保つこと
export interface Piece {
  id: string;
  title: string;
  composer: string;
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
