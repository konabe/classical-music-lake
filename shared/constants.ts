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

/**
 * 楽曲マスタ（コンポジット）の種別。
 * - "work": 親楽曲（Work）。composerId・カテゴリを持つ独立した楽曲レコード。
 * - "movement": 楽章（Movement）。Work 配下の子要素で `parentId`・`index` を持つ。
 */
export const PIECE_KINDS = ["work", "movement"] as const;
export type PieceKind = (typeof PIECE_KINDS)[number];

/**
 * 1 つの Work に紐付けられる Movement の最大数。
 * UI / バリデーションの双方で参照する。
 */
export const MOVEMENTS_PER_WORK_MAX = 64;

/**
 * Movement の `index` 値（演奏順）の許容範囲。0 始まり。
 */
export const MOVEMENT_INDEX_MIN = 0;
export const MOVEMENT_INDEX_MAX = 999;

// ページネーション設定（楽曲マスタ一覧）
export const PIECES_PAGE_SIZE_MIN = 1;
export const PIECES_PAGE_SIZE_MAX = 100;
export const PIECES_PAGE_SIZE_DEFAULT = 50;

// usePiecesAll（全件集約ヘルパー）のハードガード
export const PIECES_ALL_MAX_TOTAL = 5000;
export const PIECES_ALL_MAX_EMPTY_PAGES = 3;

// ページネーション設定（作曲家マスタ一覧）
// MAX=1000 は `useComposersAll` が 1 回の Scan で全件取りに行く前提で余裕を持たせた値。
// DynamoDB Scan の 1MB/回 ハード上限（Composer ~200B/件 で約 5000 件）の内側に収まる。
export const COMPOSERS_PAGE_SIZE_MIN = 1;
export const COMPOSERS_PAGE_SIZE_MAX = 1000;
export const COMPOSERS_PAGE_SIZE_DEFAULT = 50;

// カーソル型ページング結果
export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}
