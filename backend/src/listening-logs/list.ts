import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import type { ListeningLog } from "../types";

export const handler = createHandler(async () => {
  const result = await dynamo.send(new ScanCommand({ TableName: TABLE_LISTENING_LOGS }));
  const logs = (result.Items ?? []) as ListeningLog[];
  logs.sort((a, b) => b.listenedAt.localeCompare(a.listenedAt));
  return { statusCode: 200, body: logs };
});
