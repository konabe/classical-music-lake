/**
 * CloudFront Function (JS 2.0) のソースコードを生成する。
 *
 * - `enabled=true`: 全リクエストに 503 メンテナンスページを即時返却する
 * - `enabled=false`: 通常動作（`/storybook/`・`/storybook` を `/storybook/index.html` にリライト）
 *
 * 同一の関数コードを CDK（初期デプロイ）と Toggle Lambda（ランタイム切替）の両方から使うため、
 * この 1 ファイルに集約する。CDK の tsconfig が `cdk/` 配下しか見ないため、
 * CDK 側には同等の最小実装を別途用意している（drift に注意）。
 */

const MAINTENANCE_HTML = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>メンテナンス中 - Nocturne</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background: #0f1729; color: #e5e7eb; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card { max-width: 480px; text-align: center; }
  h1 { font-size: 28px; margin: 0 0 16px; color: #fff; }
  p { line-height: 1.7; color: #cbd5e1; margin: 0; }
</style>
</head>
<body>
<div class="card">
<h1>メンテナンス中</h1>
<p>ただいまシステムメンテナンスを実施しています。<br>ご不便をおかけいたしますが、しばらくお待ちください。</p>
</div>
</body>
</html>`;

export function buildMaintenanceFunctionCode(enabled: boolean): string {
  return `
function handler(event) {
  var MAINTENANCE = ${enabled ? "true" : "false"};
  var request = event.request;
  if (MAINTENANCE) {
    return {
      statusCode: 503,
      statusDescription: 'Service Unavailable',
      headers: {
        'content-type': { value: 'text/html; charset=utf-8' },
        'cache-control': { value: 'no-store' }
      },
      body: ${JSON.stringify(MAINTENANCE_HTML)}
    };
  }
  if (request.uri === '/storybook/' || request.uri === '/storybook') {
    request.uri = '/storybook/index.html';
  }
  return request;
}
`.trim();
}

export function isMaintenanceEnabled(code: string): boolean {
  return /var\s+MAINTENANCE\s*=\s*true/.test(code);
}
