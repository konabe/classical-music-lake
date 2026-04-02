/**
 * フロントエンド・バックエンド共通の定数定義
 *
 * カテゴリの値を定数配列として一箇所で管理し、型を導出する。
 * 各パッケージの types/index.ts から re-export して使用すること。
 */

export const PIECE_GENRES = [
  "交響曲",
  "協奏曲",
  "室内楽",
  "独奏曲",
  "歌曲",
  "オペラ",
  "宗教音楽",
  "その他",
] as const;
export type PieceGenre = (typeof PIECE_GENRES)[number];

export const PIECE_ERAS = ["バロック", "古典派", "ロマン派", "近現代", "その他"] as const;
export type PieceEra = (typeof PIECE_ERAS)[number];

export const PIECE_FORMATIONS = ["ピアノ独奏", "弦楽四重奏", "管弦楽", "声楽", "その他"] as const;
export type PieceFormation = (typeof PIECE_FORMATIONS)[number];

export const PIECE_REGIONS = [
  "ドイツ・オーストリア",
  "フランス",
  "ロシア",
  "イタリア",
  "その他",
] as const;
export type PieceRegion = (typeof PIECE_REGIONS)[number];
