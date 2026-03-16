// 評価値（1〜5 の整数）
// フロントエンドの types/index.ts と同期を保つこと
export type Rating = 1 | 2 | 3 | 4 | 5;

// APIエラーレスポンスのボディ型
// フロントエンドの types/index.ts と同期を保つこと
export type ApiErrorResponse = {
  message: string;
};

// 鑑賞ログ（曲・演奏家の記録）
// フロントエンドの types/index.ts と同期を保つこと
export interface ListeningLog {
  id: string;
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
// フロントエンドの types/index.ts と同期を保つこと
export interface Piece {
  id: string;
  title: string;
  composer: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePieceInput = Omit<Piece, "id" | "createdAt" | "updatedAt">;
export type UpdatePieceInput = Partial<CreatePieceInput>;
