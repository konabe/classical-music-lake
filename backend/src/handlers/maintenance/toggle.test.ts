import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  DescribeFunctionCommand,
  PublishFunctionCommand,
  UpdateFunctionCommand,
} from "@aws-sdk/client-cloudfront";

import { buildMaintenanceFunctionCode, isMaintenanceEnabled } from "./build-function-code";
import { toggleMaintenance } from "./toggle";

const FUNCTION_NAME = "MaintenanceFunction";

function makeDeps(overrides?: Partial<{ send: ReturnType<typeof vi.fn> }>) {
  const send = overrides?.send ?? vi.fn();
  return { client: { send } as never, functionName: FUNCTION_NAME, send };
}

describe("toggleMaintenance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enabled=true で UpdateFunction/PublishFunction を呼び出し、生成コードが 503 を返す形式になる", async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce({
        ETag: "etag-describe",
        FunctionSummary: {
          FunctionConfig: { Runtime: "cloudfront-js-2.0", Comment: "stored-comment" },
        },
      })
      .mockResolvedValueOnce({ ETag: "etag-update" })
      .mockResolvedValueOnce({});

    const { client } = makeDeps({ send });

    const result = await toggleMaintenance(
      { client, functionName: FUNCTION_NAME },
      { enabled: true }
    );

    expect(result).toEqual({
      enabled: true,
      functionName: FUNCTION_NAME,
      message: expect.stringContaining("enabled"),
    });

    expect(send).toHaveBeenCalledTimes(3);

    const describeCall = send.mock.calls[0][0] as DescribeFunctionCommand;
    expect(describeCall).toBeInstanceOf(DescribeFunctionCommand);
    expect(describeCall.input).toEqual({ Name: FUNCTION_NAME, Stage: "DEVELOPMENT" });

    const updateCall = send.mock.calls[1][0] as UpdateFunctionCommand;
    expect(updateCall).toBeInstanceOf(UpdateFunctionCommand);
    expect(updateCall.input.Name).toBe(FUNCTION_NAME);
    expect(updateCall.input.IfMatch).toBe("etag-describe");
    expect(updateCall.input.FunctionConfig).toEqual({
      Runtime: "cloudfront-js-2.0",
      Comment: "stored-comment",
    });
    const encoded = updateCall.input.FunctionCode as Uint8Array;
    const decoded = new TextDecoder().decode(encoded);
    expect(isMaintenanceEnabled(decoded)).toBe(true);
    expect(decoded).toContain("statusCode: 503");

    const publishCall = send.mock.calls[2][0] as PublishFunctionCommand;
    expect(publishCall).toBeInstanceOf(PublishFunctionCommand);
    expect(publishCall.input).toEqual({ Name: FUNCTION_NAME, IfMatch: "etag-update" });
  });

  it("enabled=false のとき生成コードがストーリーブックリライトを含む通常動作になる", async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce({
        ETag: "e1",
        FunctionSummary: { FunctionConfig: { Runtime: "cloudfront-js-2.0", Comment: "c" } },
      })
      .mockResolvedValueOnce({ ETag: "e2" })
      .mockResolvedValueOnce({});

    const { client } = makeDeps({ send });

    await toggleMaintenance({ client, functionName: FUNCTION_NAME }, { enabled: false });

    const updateCall = send.mock.calls[1][0] as UpdateFunctionCommand;
    const decoded = new TextDecoder().decode(updateCall.input.FunctionCode as Uint8Array);
    expect(isMaintenanceEnabled(decoded)).toBe(false);
    expect(decoded).toContain("/storybook/index.html");
  });

  it("enabled が boolean 以外のとき例外を投げる", async () => {
    const send = vi.fn();
    await expect(
      toggleMaintenance(
        { client: { send } as never, functionName: FUNCTION_NAME },
        { enabled: "yes" as never }
      )
    ).rejects.toThrow(/enabled: boolean/);
    expect(send).not.toHaveBeenCalled();
  });

  it("DescribeFunction が ETag を返さない場合は例外を投げる", async () => {
    const send = vi.fn().mockResolvedValueOnce({ ETag: undefined });
    await expect(
      toggleMaintenance(
        { client: { send } as never, functionName: FUNCTION_NAME },
        { enabled: true }
      )
    ).rejects.toThrow(/ETag/);
  });

  it("UpdateFunction が ETag を返さない場合は PublishFunction を呼ばず例外を投げる", async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce({
        ETag: "e1",
        FunctionSummary: { FunctionConfig: { Runtime: "cloudfront-js-2.0", Comment: "c" } },
      })
      .mockResolvedValueOnce({ ETag: undefined });
    await expect(
      toggleMaintenance(
        { client: { send } as never, functionName: FUNCTION_NAME },
        { enabled: true }
      )
    ).rejects.toThrow(/UpdateFunction/);
    expect(send).toHaveBeenCalledTimes(2);
  });
});

describe("buildMaintenanceFunctionCode", () => {
  it("enabled=true と enabled=false で出力が異なる", () => {
    const on = buildMaintenanceFunctionCode(true);
    const off = buildMaintenanceFunctionCode(false);
    expect(on).not.toBe(off);
    expect(isMaintenanceEnabled(on)).toBe(true);
    expect(isMaintenanceEnabled(off)).toBe(false);
  });

  it("出力は CloudFront Function のコードサイズ上限（10KB）に収まる", () => {
    const on = buildMaintenanceFunctionCode(true);
    const off = buildMaintenanceFunctionCode(false);
    expect(on.length).toBeLessThan(10 * 1024);
    expect(off.length).toBeLessThan(10 * 1024);
  });
});
