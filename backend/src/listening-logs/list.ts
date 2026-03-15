import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import type { ListeningLog } from "../types";

export const handler = createHandler(async () => {
  const logs: ListeningLog[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const result = await dynamo.send(
      new ScanCommand({ TableName: TABLE_LISTENING_LOGS, ExclusiveStartKey: lastEvaluatedKey })
    );
    logs.push(...((result.Items ?? []) as ListeningLog[]));
    lastEvaluatedKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastEvaluatedKey !== undefined);

  logs.sort((a, b) => b.listenedAt.localeCompare(a.listenedAt));
  return { statusCode: StatusCodes.OK, body: logs };
});
