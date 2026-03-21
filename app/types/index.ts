/**
 * フロントエンド共通型定義
 *
 * ## 管理方針
 * - このファイルはフロントエンド（Nuxt）専用の型定義を管理する
 * - backend/src/types/index.ts と共有すべき型（ListeningLog, Piece, Rating など）は
 *   両ファイルで重複定義する（パッケージを分離しているため）
 * - 共有型を変更する場合は、必ず backend/src/types/index.ts も同時に更新すること
 * - バックエンド固有のロジック（isValidRating 等のバリデーション関数）はバックエンド側にのみ存在する
 *
 * ## 変更時のチェックリスト
 * - [ ] 共有型を変更した場合、backend/src/types/index.ts にも同じ変更を加えたか
 * - [ ] フロントエンド固有の型のみを追加・変更した場合、バックエンド側への影響はないか確認したか
 */

// 評価値（1〜5 の整数）
// ※ backend/src/types/index.ts と同期を保つこと
export type Rating = 1 | 2 | 3 | 4 | 5;

// APIエラーレスポンスのボディ型
// ※ backend/src/types/index.ts と同期を保つこと
export type ApiErrorResponse = {
  message: string;
};

// 鑑賞ログ（曲・演奏家の記録）
// ※ backend/src/types/index.ts と同期を保つこと
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
// ※ backend/src/types/index.ts と同期を保つこと
export interface Piece {
  id: string;
  title: string;
  composer: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePieceInput = Omit<Piece, "id" | "createdAt" | "updatedAt">;
export type UpdatePieceInput = Partial<CreatePieceInput>;
