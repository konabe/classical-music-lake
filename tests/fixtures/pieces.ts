import type { Piece } from "../../app/types";

/** ベートーヴェン - 交響曲第5番「運命」 */
export const beethovenSymphony5: Piece = {
  id: "piece-001",
  title: "交響曲第5番「運命」",
  composer: "ベートーヴェン",
  genre: "交響曲",
  era: "古典派",
  formation: "管弦楽",
  region: "ドイツ・オーストリア",
  createdAt: "2024-01-10T10:00:00.000Z",
  updatedAt: "2024-01-10T10:00:00.000Z",
};

/** モーツァルト - ピアノ協奏曲第20番 */
export const mozartConcerto20: Piece = {
  id: "piece-002",
  title: "ピアノ協奏曲第20番",
  composer: "モーツァルト",
  genre: "協奏曲",
  era: "古典派",
  formation: "管弦楽",
  region: "ドイツ・オーストリア",
  createdAt: "2024-01-08T12:00:00.000Z",
  updatedAt: "2024-01-08T12:00:00.000Z",
};

/** ショパン - バラード第1番（動画URLあり） */
export const chopinBallade1: Piece = {
  id: "piece-003",
  title: "バラード第1番",
  composer: "ショパン",
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  genre: "独奏曲",
  era: "ロマン派",
  formation: "ピアノ独奏",
  region: "フランス",
  createdAt: "2024-01-05T14:00:00.000Z",
  updatedAt: "2024-01-05T14:00:00.000Z",
};

/** ドビュッシー - 月の光（カテゴリ未設定） */
export const debussyClairDeLune: Piece = {
  id: "piece-004",
  title: "月の光",
  composer: "ドビュッシー",
  createdAt: "2024-01-03T09:00:00.000Z",
  updatedAt: "2024-01-03T09:00:00.000Z",
};

/** 全フィクスチャ */
export const allPieceFixtures: Piece[] = [
  beethovenSymphony5,
  mozartConcerto20,
  chopinBallade1,
  debussyClairDeLune,
];
