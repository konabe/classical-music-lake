import { z } from "zod";
import {
  MOVEMENT_INDEX_MAX,
  MOVEMENT_INDEX_MIN,
  MOVEMENTS_PER_WORK_MAX,
  PIECE_ERAS,
  PIECE_FORMATIONS,
  PIECE_GENRES,
  PIECE_REGIONS,
  PIECES_PAGE_SIZE_DEFAULT,
  PIECES_PAGE_SIZE_MAX,
  PIECES_PAGE_SIZE_MIN,
  COMPOSERS_PAGE_SIZE_DEFAULT,
  COMPOSERS_PAGE_SIZE_MAX,
  COMPOSERS_PAGE_SIZE_MIN,
} from "../types/index.js";

const ratingSchema = z
  .number({ error: () => "rating must be between 1 and 5" })
  .int({ message: "rating must be between 1 and 5" })
  .min(1, { message: "rating must be between 1 and 5" })
  .max(5, { message: "rating must be between 1 and 5" });

export const createListeningLogSchema = z.object({
  listenedAt: z.iso.datetime({ offset: false }),
  composer: z
    .string()
    .trim()
    .min(1, "composer must be a non-empty string")
    .max(100, "composer must be 100 characters or less"),
  piece: z
    .string()
    .trim()
    .min(1, "piece must be a non-empty string")
    .max(200, "piece must be 200 characters or less"),
  rating: ratingSchema,
  isFavorite: z.boolean(),
  memo: z.string().trim().max(1000, "memo must be 1000 characters or less").optional(),
});

export const updateListeningLogSchema = createListeningLogSchema.partial();

const pieceGenreSchema = z.enum(PIECE_GENRES);

const pieceEraSchema = z.enum(PIECE_ERAS);

const pieceFormationSchema = z.enum(PIECE_FORMATIONS);

const pieceRegionSchema = z.enum(PIECE_REGIONS);

const PIECE_VIDEO_URLS_MAX = 10;

const videoUrlsSchema = z
  .array(z.url("videoUrls must contain valid URLs"))
  .max(PIECE_VIDEO_URLS_MAX, `videoUrls must contain at most ${PIECE_VIDEO_URLS_MAX} URLs`);

// Work（親楽曲）の作成スキーマ。Movement 専用の `parentId` / `index` は `.strict()` により拒否される。
export const createWorkSchema = z
  .object({
    kind: z.literal("work"),
    title: z
      .string({ error: () => "title is required" })
      .trim()
      .min(1, "title is required")
      .max(200, "title must be 200 characters or less"),
    composerId: z.uuid("composerId must be a valid UUID"),
    videoUrls: videoUrlsSchema.optional(),
    genre: pieceGenreSchema.optional(),
    era: pieceEraSchema.optional(),
    formation: pieceFormationSchema.optional(),
    region: pieceRegionSchema.optional(),
  })
  .strict();

// Movement（楽章）の作成スキーマ。Work 専用の composerId / categories は `.strict()` により拒否される。
export const createMovementSchema = z
  .object({
    kind: z.literal("movement"),
    parentId: z.uuid("parentId must be a valid UUID"),
    index: z
      .number({ error: () => "index must be an integer" })
      .int({ message: "index must be an integer" })
      .min(MOVEMENT_INDEX_MIN, {
        message: `index must be between ${MOVEMENT_INDEX_MIN} and ${MOVEMENT_INDEX_MAX}`,
      })
      .max(MOVEMENT_INDEX_MAX, {
        message: `index must be between ${MOVEMENT_INDEX_MIN} and ${MOVEMENT_INDEX_MAX}`,
      }),
    title: z
      .string({ error: () => "title is required" })
      .trim()
      .min(1, "title is required")
      .max(200, "title must be 200 characters or less"),
    videoUrls: videoUrlsSchema.optional(),
  })
  .strict();

/**
 * 楽曲マスタ作成スキーマ（判別共用体）。リクエストには `kind` を必ず含める。
 */
export const createPieceSchema = z.discriminatedUnion("kind", [
  createWorkSchema,
  createMovementSchema,
]);

// Update 用は `.partial()` で全フィールド任意化したうえで `kind` のみ literal で必須に戻す（PartialBy しない）。
export const updateWorkSchema = z.object({
  kind: z.literal("work"),
  title: z
    .string()
    .trim()
    .min(1, "title must be a non-empty string")
    .max(200, "title must be 200 characters or less")
    .optional(),
  composerId: z.uuid("composerId must be a valid UUID").optional(),
  videoUrls: videoUrlsSchema.optional(),
  genre: z.union([pieceGenreSchema, z.literal("")]).optional(),
  era: z.union([pieceEraSchema, z.literal("")]).optional(),
  formation: z.union([pieceFormationSchema, z.literal("")]).optional(),
  region: z.union([pieceRegionSchema, z.literal("")]).optional(),
});

export const updateMovementSchema = z.object({
  kind: z.literal("movement"),
  parentId: z.uuid("parentId must be a valid UUID").optional(),
  index: z
    .number({ error: () => "index must be an integer" })
    .int({ message: "index must be an integer" })
    .min(MOVEMENT_INDEX_MIN, {
      message: `index must be between ${MOVEMENT_INDEX_MIN} and ${MOVEMENT_INDEX_MAX}`,
    })
    .max(MOVEMENT_INDEX_MAX, {
      message: `index must be between ${MOVEMENT_INDEX_MIN} and ${MOVEMENT_INDEX_MAX}`,
    })
    .optional(),
  title: z
    .string()
    .trim()
    .min(1, "title must be a non-empty string")
    .max(200, "title must be 200 characters or less")
    .optional(),
  videoUrls: videoUrlsSchema.optional(),
});

export const updatePieceSchema = z.discriminatedUnion("kind", [
  updateWorkSchema,
  updateMovementSchema,
]);

/**
 * Work 配下の Movement 集合を一括置換するための入力スキーマ（PR3 で実エンドポイントを追加する用途）。
 * - `kind` は不要。常に movement 集合として扱う。
 * - 1 Work あたりの最大件数は {@link MOVEMENTS_PER_WORK_MAX}。
 */
export const replaceMovementsSchema = z.object({
  movements: z
    .array(
      z.object({
        index: z
          .number()
          .int({ message: "index must be an integer" })
          .min(MOVEMENT_INDEX_MIN, {
            message: `index must be between ${MOVEMENT_INDEX_MIN} and ${MOVEMENT_INDEX_MAX}`,
          })
          .max(MOVEMENT_INDEX_MAX, {
            message: `index must be between ${MOVEMENT_INDEX_MIN} and ${MOVEMENT_INDEX_MAX}`,
          }),
        title: z
          .string()
          .trim()
          .min(1, "title must be a non-empty string")
          .max(200, "title must be 200 characters or less"),
        videoUrls: videoUrlsSchema.optional(),
      }),
    )
    .max(
      MOVEMENTS_PER_WORK_MAX,
      `movements must contain at most ${MOVEMENTS_PER_WORK_MAX} entries`,
    ),
});

const emailSchema = z.email("email must be a valid email address").trim();

const passwordSchema = z
  .string({ error: () => "password is required" })
  .min(8, "password must be at least 8 characters long")
  .regex(/[A-Z]/, "password must contain at least one uppercase letter")
  .regex(/[a-z]/, "password must contain at least one lowercase letter")
  .regex(/\d/, "password must contain at least one digit");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  // ログイン時はパスワードの複雑さを検証しない。
  // 複雑さポリシー（文字種・長さ）を適用すると、ポリシー変更前に登録したユーザーが
  // ログインできなくなる後方互換性の問題が生じるため。実際の認証は Cognito が行う。
  password: z.string({ error: () => "password is required" }).min(1, "password is required"),
});

export const verifyEmailSchema = z.object({
  email: emailSchema,
  code: z
    .string({ error: () => "code is required" })
    .trim()
    .min(1, "code is required"),
});

export const resendVerificationCodeSchema = z.object({
  email: emailSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ error: () => "refreshToken is required" })
    .min(1, "refreshToken is required"),
});

export const createConcertLogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "title must be a non-empty string")
    .max(200, "title must be 200 characters or less"),
  concertDate: z.iso.datetime({ offset: false }),
  venue: z
    .string()
    .trim()
    .min(1, "venue must be a non-empty string")
    .max(200, "venue must be 200 characters or less"),
  conductor: z.string().trim().max(100, "conductor must be 100 characters or less").optional(),
  orchestra: z.string().trim().max(100, "orchestra must be 100 characters or less").optional(),
  soloist: z.string().trim().max(100, "soloist must be 100 characters or less").optional(),
  pieceIds: z.array(z.uuid("pieceId must be a valid UUID")).optional(),
});

export const updateConcertLogSchema = createConcertLogSchema.partial();

const COMPOSER_YEAR_MIN = -3000;
const COMPOSER_YEAR_MAX = 9999;

const birthYearSchema = z
  .number({ error: () => "birthYear must be an integer" })
  .int({ message: "birthYear must be an integer" })
  .min(COMPOSER_YEAR_MIN, {
    message: `birthYear must be between ${COMPOSER_YEAR_MIN} and ${COMPOSER_YEAR_MAX}`,
  })
  .max(COMPOSER_YEAR_MAX, {
    message: `birthYear must be between ${COMPOSER_YEAR_MIN} and ${COMPOSER_YEAR_MAX}`,
  });

const deathYearSchema = z
  .number({ error: () => "deathYear must be an integer" })
  .int({ message: "deathYear must be an integer" })
  .min(COMPOSER_YEAR_MIN, {
    message: `deathYear must be between ${COMPOSER_YEAR_MIN} and ${COMPOSER_YEAR_MAX}`,
  })
  .max(COMPOSER_YEAR_MAX, {
    message: `deathYear must be between ${COMPOSER_YEAR_MIN} and ${COMPOSER_YEAR_MAX}`,
  });

export const createComposerSchema = z.object({
  name: z
    .string({ error: () => "name is required" })
    .trim()
    .min(1, "name is required")
    .max(100, "name must be 100 characters or less"),
  era: pieceEraSchema.optional(),
  region: pieceRegionSchema.optional(),
  imageUrl: z.url("imageUrl must be a valid URL").optional(),
  birthYear: birthYearSchema.optional(),
  deathYear: deathYearSchema.optional(),
});

export const updateComposerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name must be a non-empty string")
    .max(100, "name must be 100 characters or less")
    .optional(),
  era: z.union([pieceEraSchema, z.literal("")]).optional(),
  region: z.union([pieceRegionSchema, z.literal("")]).optional(),
  imageUrl: z.union([z.url("imageUrl must be a valid URL"), z.literal("")]).optional(),
  // null を送るとフィールドが削除される（`buildUpdateProps` がクリア指示として扱う）
  birthYear: birthYearSchema.nullable().optional(),
  deathYear: deathYearSchema.nullable().optional(),
});

/**
 * GET /composers のクエリパラメータを検証するスキーマ。
 * - `limit`: 省略時は {@link COMPOSERS_PAGE_SIZE_DEFAULT}。範囲は {@link COMPOSERS_PAGE_SIZE_MIN} 〜 {@link COMPOSERS_PAGE_SIZE_MAX}。
 * - `cursor`: 省略可。指定時は base64url 形式の文字列。
 */
export const listComposersQuerySchema = z.object({
  limit: z.coerce
    .number({ error: () => "limit must be a number" })
    .int({ message: "limit must be an integer" })
    .min(COMPOSERS_PAGE_SIZE_MIN, {
      message: `limit must be at least ${COMPOSERS_PAGE_SIZE_MIN}`,
    })
    .max(COMPOSERS_PAGE_SIZE_MAX, {
      message: `limit must be at most ${COMPOSERS_PAGE_SIZE_MAX}`,
    })
    .default(COMPOSERS_PAGE_SIZE_DEFAULT),
  cursor: z.base64url({ message: "cursor must be a base64url string" }).min(1).optional(),
});

/**
 * GET /pieces のクエリパラメータを検証するスキーマ。
 * - `limit`: 省略時は {@link PIECES_PAGE_SIZE_DEFAULT}。範囲は {@link PIECES_PAGE_SIZE_MIN} 〜 {@link PIECES_PAGE_SIZE_MAX}。
 *   API Gateway からは文字列で到達するが、`z.coerce.number()` で数値に変換する。
 * - `cursor`: 省略可。指定時は base64url 形式の文字列。実体のスキーマ不正は `decodeCursor` 側で検出する。
 */
export const listPiecesQuerySchema = z.object({
  limit: z.coerce
    .number({ error: () => "limit must be a number" })
    .int({ message: "limit must be an integer" })
    .min(PIECES_PAGE_SIZE_MIN, {
      message: `limit must be at least ${PIECES_PAGE_SIZE_MIN}`,
    })
    .max(PIECES_PAGE_SIZE_MAX, {
      message: `limit must be at most ${PIECES_PAGE_SIZE_MAX}`,
    })
    .default(PIECES_PAGE_SIZE_DEFAULT),
  cursor: z.base64url({ message: "cursor must be a base64url string" }).min(1).optional(),
});
