import {
  CloudFrontClient,
  DescribeFunctionCommand,
  UpdateFunctionCommand,
  PublishFunctionCommand,
} from "@aws-sdk/client-cloudfront";

import { buildMaintenanceFunctionCode } from "./build-function-code";

export type ToggleEvent = {
  enabled: boolean;
};

export type ToggleResult = {
  enabled: boolean;
  functionName: string;
  message: string;
};

type CloudFrontFunctionClient = Pick<CloudFrontClient, "send">;

export type ToggleDeps = {
  client: CloudFrontFunctionClient;
  functionName: string;
};

/**
 * CloudFront Function の LIVE ステージのコードを差し替えてメンテナンスモードを ON/OFF する。
 *
 * フロー:
 * 1. `DescribeFunction(Stage=DEVELOPMENT)` で現在の ETag を取得
 * 2. `UpdateFunction` で新しいコードをアップロード（DEVELOPMENT ステージ更新）
 * 3. `PublishFunction` で LIVE に昇格（約 30 秒かけて全エッジに反映される）
 */
export async function toggleMaintenance(
  deps: ToggleDeps,
  event: ToggleEvent
): Promise<ToggleResult> {
  if (typeof event?.enabled !== "boolean") {
    throw new Error("Event body must include `enabled: boolean`");
  }

  const describe = await deps.client.send(
    new DescribeFunctionCommand({
      Name: deps.functionName,
      Stage: "DEVELOPMENT",
    })
  );

  const describeEtag = describe.ETag;
  const runtime = describe.FunctionSummary?.FunctionConfig?.Runtime ?? "cloudfront-js-2.0";
  const comment =
    describe.FunctionSummary?.FunctionConfig?.Comment ?? "Maintenance toggle function";
  if (describeEtag === undefined) {
    throw new Error(`Failed to fetch ETag for function: ${deps.functionName}`);
  }

  const code = buildMaintenanceFunctionCode(event.enabled);
  const update = await deps.client.send(
    new UpdateFunctionCommand({
      Name: deps.functionName,
      IfMatch: describeEtag,
      FunctionConfig: { Runtime: runtime, Comment: comment },
      FunctionCode: new TextEncoder().encode(code),
    })
  );
  const updateEtag = update.ETag;
  if (updateEtag === undefined) {
    throw new Error(`UpdateFunction did not return ETag for: ${deps.functionName}`);
  }

  await deps.client.send(
    new PublishFunctionCommand({
      Name: deps.functionName,
      IfMatch: updateEtag,
    })
  );

  return {
    enabled: event.enabled,
    functionName: deps.functionName,
    message: event.enabled
      ? "Maintenance mode enabled. Changes will propagate to all edges within ~30 seconds."
      : "Maintenance mode disabled. Changes will propagate to all edges within ~30 seconds.",
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Required environment variable is missing: ${name}`);
  }
  return value;
}

export const handler = async (event: ToggleEvent): Promise<ToggleResult> => {
  const functionName = requireEnv("MAINTENANCE_FUNCTION_NAME");
  const client = new CloudFrontClient({});
  return toggleMaintenance({ client, functionName }, event);
};
