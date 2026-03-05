import type { ListeningLog, CreateListeningLogInput } from "../../types";

/** ベートーヴェン - 交響曲第9番（お気に入り、評価5） */
export const beethovenSymphony9: ListeningLog = {
  id: "fixture-001",
  listenedAt: "2024-01-15T20:00:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番「合唱」",
  performer: "ベルリン・フィルハーモニー管弦楽団",
  conductor: "カラヤン",
  rating: 5,
  isFavorite: true,
  memo: "圧倒的な第4楽章",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

/** モーツァルト - レクイエム（評価4） */
export const mozartRequiem: ListeningLog = {
  id: "fixture-002",
  listenedAt: "2024-01-10T15:00:00.000Z",
  composer: "モーツァルト",
  piece: "レクイエム",
  performer: "ウィーン・フィルハーモニー管弦楽団",
  conductor: "アーノンクール",
  rating: 4,
  isFavorite: false,
  memo: "荘厳な雰囲気",
  createdAt: "2024-01-10T16:00:00.000Z",
  updatedAt: "2024-01-10T16:00:00.000Z",
};

/** バッハ - ゴルトベルク変奏曲（指揮者なし、お気に入り、評価5） */
export const bachGoldberg: ListeningLog = {
  id: "fixture-003",
  listenedAt: "2024-01-05T18:00:00.000Z",
  composer: "バッハ",
  piece: "ゴルトベルク変奏曲",
  performer: "グレン・グールド",
  rating: 5,
  isFavorite: true,
  createdAt: "2024-01-05T19:00:00.000Z",
  updatedAt: "2024-01-05T19:00:00.000Z",
};

/** ショパン - ピアノ協奏曲第1番（評価4） */
export const chopinConcerto1: ListeningLog = {
  id: "fixture-004",
  listenedAt: "2024-01-08T20:00:00.000Z",
  composer: "ショパン",
  piece: "ピアノ協奏曲第1番",
  performer: "マルタ・アルゲリッチ",
  conductor: "デュトワ",
  rating: 4,
  isFavorite: false,
  createdAt: "2024-01-08T21:00:00.000Z",
  updatedAt: "2024-01-08T21:00:00.000Z",
};

/** ブラームス - 交響曲第4番（評価3） */
export const brahmsSymphony4: ListeningLog = {
  id: "fixture-005",
  listenedAt: "2024-01-03T21:00:00.000Z",
  composer: "ブラームス",
  piece: "交響曲第4番",
  performer: "ウィーン・フィルハーモニー管弦楽団",
  conductor: "バーンスタイン",
  rating: 3,
  isFavorite: false,
  createdAt: "2024-01-03T22:00:00.000Z",
  updatedAt: "2024-01-03T22:00:00.000Z",
};

/** 新規作成入力サンプル */
export const createBeethovenInput: CreateListeningLogInput = {
  listenedAt: "2024-02-01T19:00:00.000Z",
  composer: "ベートーヴェン",
  piece: "ピアノソナタ第14番「月光」",
  performer: "アルフレッド・ブレンデル",
  rating: 5,
  isFavorite: true,
  memo: "幻想的な第1楽章",
};

/** 全フィクスチャ（listenedAt 降順） */
export const allFixtures: ListeningLog[] = [
  beethovenSymphony9,
  mozartRequiem,
  chopinConcerto1,
  bachGoldberg,
  brahmsSymphony4,
];
