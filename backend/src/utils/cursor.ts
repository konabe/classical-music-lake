/**
 * カーソル型ページングで使用する不透明カーソルのエンコード / デコード。
 *
 * DynamoDB の `LastEvaluatedKey`（次ページを取得するための不透明キー）を
 * クライアントに渡せる base64url 文字列に変換する。
 *
 * フォーマット: `base64url(JSON.stringify({ v: 1, k: lastEvaluatedKey }))`
 * - `v`: スキーマバージョン。将来 GSI 追加等で形式を変えた際の早期失敗用。
 * - `k`: DynamoDB の `LastEvaluatedKey` そのもの。
 *
 * 改ざん検出（HMAC 署名）は行わない。理由は design.md の「カーソル設計の判断記録」を参照。
 */

const CURRENT_CURSOR_VERSION = 1;

export class InvalidCursorError extends Error {
  constructor(message = "Invalid cursor") {
    super(message);
    this.name = "InvalidCursorError";
  }
}

export function encodeCursor(lastEvaluatedKey: Record<string, unknown>): string {
  const payload = JSON.stringify({ v: CURRENT_CURSOR_VERSION, k: lastEvaluatedKey });
  return Buffer.from(payload, "utf8").toString("base64url");
}

export function decodeCursor(raw: string): Record<string, unknown> {
  if (raw.length === 0) {
    throw new InvalidCursorError("Cursor must not be empty");
  }

  // base64url として不正な文字を含む場合はここで弾く
  if (!/^[A-Za-z0-9_-]+$/.test(raw)) {
    throw new InvalidCursorError("Cursor contains invalid base64url characters");
  }

  let decoded: string;
  try {
    decoded = Buffer.from(raw, "base64url").toString("utf8");
  } catch {
    throw new InvalidCursorError("Failed to decode cursor");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    throw new InvalidCursorError("Cursor is not valid JSON");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new InvalidCursorError("Cursor payload must be an object");
  }

  const { v, k } = parsed as { v?: unknown; k?: unknown };

  if (v !== CURRENT_CURSOR_VERSION) {
    throw new InvalidCursorError(`Unsupported cursor version: ${String(v)}`);
  }

  if (typeof k !== "object" || k === null || Array.isArray(k)) {
    throw new InvalidCursorError("Cursor key must be an object");
  }

  return k as Record<string, unknown>;
}
