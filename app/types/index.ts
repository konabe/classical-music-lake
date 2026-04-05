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
} from "../../shared/constants";

export type Rating = 1 | 2 | 3 | 4 | 5;

// APIエラーレスポンスのボディ型
export type ApiErrorResponse = {
  message: string;
};

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
export { PIECE_GENRES, PIECE_ERAS, PIECE_FORMATIONS, PIECE_REGIONS };
export type { PieceGenre, PieceEra, PieceFormation, PieceRegion };

// 楽曲マスタ
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

// コンサート記録
export interface ConcertLog {
  id: string;
  userId: string; // Cognito sub（認証必須のため null なし）
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
