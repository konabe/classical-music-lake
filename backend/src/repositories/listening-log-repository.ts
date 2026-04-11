import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { dynamo, queryItemsByUserId, updateItem, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import type { ListeningLog } from "../types";

export const findById = async (id: string): Promise<ListeningLog | undefined> => {
  const result = await dynamo.send(
    new GetCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } })
  );
  return result.Item as ListeningLog | undefined;
};

export const findByUserId = async (userId: string): Promise<ListeningLog[]> => {
  return queryItemsByUserId<ListeningLog>(TABLE_LISTENING_LOGS, userId);
};

export const save = async (item: ListeningLog): Promise<void> => {
  await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: item }));
};

export const update = async (id: string, input: Partial<ListeningLog>): Promise<ListeningLog> => {
  return updateItem<ListeningLog>(TABLE_LISTENING_LOGS, id, input);
};

export const remove = async (id: string): Promise<void> => {
  await dynamo.send(new DeleteCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } }));
};
