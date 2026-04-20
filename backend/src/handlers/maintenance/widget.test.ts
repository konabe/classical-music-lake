import { describe, it, expect, vi } from "vitest";
import { GetFunctionCommand } from "@aws-sdk/client-cloudfront";

import { buildMaintenanceFunctionCode } from "./build-function-code";
import { renderWidget } from "./widget";

const FUNCTION_NAME = "MaintenanceFunction";
const TOGGLE_ARN = "arn:aws:lambda:ap-northeast-1:123456789012:function:MaintenanceToggle";

describe("renderWidget", () => {
  it("describe=true のとき説明文を返し CloudFront を呼ばない", async () => {
    const send = vi.fn();
    const html = await renderWidget(
      { client: { send } as never, functionName: FUNCTION_NAME, toggleArn: TOGGLE_ARN },
      { describe: true }
    );
    expect(html).toMatch(/MaintenanceToggle/);
    expect(send).not.toHaveBeenCalled();
  });

  it("LIVE コードがメンテナンス ON のとき ON 状態を表示する", async () => {
    const code = buildMaintenanceFunctionCode(true);
    const send = vi.fn().mockResolvedValueOnce({
      FunctionCode: new TextEncoder().encode(code),
    });

    const html = await renderWidget(
      { client: { send } as never, functionName: FUNCTION_NAME, toggleArn: TOGGLE_ARN },
      {}
    );

    expect(send).toHaveBeenCalledTimes(1);
    const cmd = send.mock.calls[0][0] as GetFunctionCommand;
    expect(cmd).toBeInstanceOf(GetFunctionCommand);
    expect(cmd.input).toEqual({ Name: FUNCTION_NAME, Stage: "LIVE" });
    expect(html).toContain("ON");
    expect(html).toContain(TOGGLE_ARN);
    expect(html).toContain('{"enabled": true}');
    expect(html).toContain('{"enabled": false}');
  });

  it("LIVE コードがメンテナンス OFF のとき OFF 状態を表示する", async () => {
    const code = buildMaintenanceFunctionCode(false);
    const send = vi.fn().mockResolvedValueOnce({
      FunctionCode: new TextEncoder().encode(code),
    });

    const html = await renderWidget(
      { client: { send } as never, functionName: FUNCTION_NAME, toggleArn: TOGGLE_ARN },
      {}
    );
    expect(html).toContain("OFF");
    expect(html).toContain("通常稼働");
  });

  it("GetFunction が失敗したときエラーメッセージを HTML に含めて完了する", async () => {
    const send = vi.fn().mockRejectedValueOnce(new Error("no such function"));
    const html = await renderWidget(
      { client: { send } as never, functionName: FUNCTION_NAME, toggleArn: TOGGLE_ARN },
      {}
    );
    expect(html).toContain("現状取得に失敗");
    expect(html).toContain("no such function");
    // 取得に失敗しても ON/OFF ボタンは出す（運用継続性）
    expect(html).toContain(TOGGLE_ARN);
  });

  it("HTML 特殊文字が payload/arn に含まれてもエスケープされる", async () => {
    const send = vi.fn().mockResolvedValueOnce({ FunctionCode: undefined });
    const html = await renderWidget(
      {
        client: { send } as never,
        functionName: `<script>alert(1)</script>`,
        toggleArn: `arn"><img`,
      },
      {}
    );
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("arn&quot;&gt;&lt;img");
  });
});
