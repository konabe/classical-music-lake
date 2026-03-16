import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseBody } from "../utils/parseBody";
import type { ListeningLog } from "../types";
import { createListeningLogSchema } from "./schemas";

export const handler = createHandler(async (event) => {
  const input = parseBody(event.body as unknown, createListeningLogSchema);

  const now = new Date().toISOString();
  const item: ListeningLog = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: item }));
  return { statusCode: StatusCodes.CREATED, body: item };
}).use(jsonBodyParser);
