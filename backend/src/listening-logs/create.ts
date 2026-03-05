import type { APIGatewayProxyHandler } from "aws-lambda";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { created, badRequest, internalError } from "../utils/response";
import type { CreateListeningLogInput, ListeningLog } from "../types";

export const handler: APIGatewayProxyHandler = async (event) => {
  if (!event.body) return badRequest("Request body is required");

  let input: CreateListeningLogInput;
  try {
    const parsed: unknown = JSON.parse(event.body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return badRequest("Request body must be a JSON object");
    }
    input = parsed as CreateListeningLogInput;
  } catch {
    return badRequest("Invalid JSON");
  }

  try {
    const now = new Date().toISOString();
    const item: ListeningLog = {
      ...input,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: item }));
    return created(item);
  } catch (err) {
    return internalError(err);
  }
};
