import { CloudFrontClient, GetFunctionCommand } from "@aws-sdk/client-cloudfront";

import { isMaintenanceEnabled } from "./build-function-code";

export type WidgetEvent = {
  describe?: boolean;
  widgetContext?: unknown;
};

type CloudFrontFunctionClient = Pick<CloudFrontClient, "send">;

export type WidgetDeps = {
  client: CloudFrontFunctionClient;
  functionName: string;
  toggleArn: string;
};

const DESCRIBE_TEXT =
  "メンテナンスモードの現在の状態を表示し、ON/OFF ボタンで MaintenanceToggle Lambda を呼び出す。";

/**
 * CloudWatch Custom Widget の描画ハンドラ。
 *
 * - `event.describe === true`: 開発者向け説明文を返す（ダッシュボード作成 UI で利用される）
 * - それ以外: CloudFront Function の LIVE コードを `GetFunction` で取得して現在の状態を表示し、
 *   `<cwdb-action>` でラップした ON/OFF ボタンを HTML として返す
 */
export async function renderWidget(deps: WidgetDeps, event: WidgetEvent): Promise<string> {
  if (event?.describe === true) {
    return DESCRIBE_TEXT;
  }

  let enabled = false;
  let fetchError: string | undefined;
  try {
    const result = await deps.client.send(
      new GetFunctionCommand({ Name: deps.functionName, Stage: "LIVE" })
    );
    const codeBytes = result.FunctionCode;
    if (codeBytes instanceof Uint8Array) {
      const code = new TextDecoder().decode(codeBytes);
      enabled = isMaintenanceEnabled(code);
    }
  } catch (e) {
    fetchError = e instanceof Error ? e.message : String(e);
  }

  const statusLabel = enabled ? "ON（メンテナンス中）" : "OFF（通常稼働）";
  const statusColor = enabled ? "#ef4444" : "#10b981";
  const errorBlock =
    fetchError === undefined
      ? ""
      : `<p style="color:#ef4444;margin:8px 0;">現状取得に失敗: ${escapeHtml(fetchError)}</p>`;

  return `
<div style="padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
  <div style="font-size:13px;color:#64748b;margin-bottom:4px;">Function: ${escapeHtml(deps.functionName)}</div>
  <div style="font-size:18px;margin-bottom:12px;">
    現在の状態: <strong style="color:${statusColor};">${statusLabel}</strong>
  </div>
  ${errorBlock}
  <div style="display:flex;gap:8px;">
    <a class="btn btn-primary">
      <cwdb-action action="call" endpoint="${escapeHtml(deps.toggleArn)}" display="popout" confirmation="メンテナンスモードを ON にしますか？CloudFront 経由の全アクセスが 503 になります。">
        {"enabled": true}
      </cwdb-action>
      メンテナンス開始（ON）
    </a>
    <a class="btn">
      <cwdb-action action="call" endpoint="${escapeHtml(deps.toggleArn)}" display="popout" confirmation="メンテナンスモードを OFF にして通常稼働に戻しますか？">
        {"enabled": false}
      </cwdb-action>
      メンテナンス解除（OFF）
    </a>
  </div>
  <p style="font-size:12px;color:#64748b;margin-top:16px;">
    ※ 反映には CloudFront Function の伝搬（約 30 秒〜数分）を要します。状態表示はウィジェット再描画で更新されます。
  </p>
</div>`.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Required environment variable is missing: ${name}`);
  }
  return value;
}

export const handler = async (event: WidgetEvent): Promise<string> => {
  const functionName = requireEnv("MAINTENANCE_FUNCTION_NAME");
  const toggleArn = requireEnv("MAINTENANCE_TOGGLE_ARN");
  const client = new CloudFrontClient({});
  return renderWidget({ client, functionName, toggleArn }, event);
};
