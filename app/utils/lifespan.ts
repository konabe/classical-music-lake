/**
 * 作曲家の生没年から `1770–1827` 等の表示文字列を組み立てる。
 *
 * - 両方未指定: 空文字
 * - 生年のみ: `1770–`
 * - 没年のみ: `–1827`（通常はあり得ないが堅牢性のため許容）
 * - 両方: `1770–1827`
 *
 * 区切り文字は en dash（U+2013）を使用。
 */
export function formatLifespan(birthYear?: number, deathYear?: number): string {
  if (birthYear === undefined && deathYear === undefined) {
    return "";
  }
  const left = birthYear !== undefined ? formatYear(birthYear) : "";
  const right = deathYear !== undefined ? formatYear(deathYear) : "";
  return `${left}–${right}`;
}

function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BC`;
  }
  return String(year);
}
