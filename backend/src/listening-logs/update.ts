import type { APIGatewayProxyHandler } from "aws-lambda";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { ok, notFound, badRequest, internalError } from "../utils/response";
import type { ListeningLog, UpdateListeningLogInput } from "../types";

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id;
  if (!id) return badRequest("id is required");
  if (!event.body) return badRequest("Request body is required");

  let input: UpdateListeningLogInput;
  try {
    input = JSON.parse(event.body);
  } catch {
    return badRequest("Invalid JSON");
  }

  try {
    const existing = await dynamo.send(
      new GetCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } })
    );
    if (!existing.Item) return notFound("Listening log not found");

    const current = existing.Item as ListeningLog;
    const updated: ListeningLog = {
      ...current,
      ...input,
      id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: updated }));
    return ok(updated);
  } catch (err) {
    return internalError(err);
  }
};
