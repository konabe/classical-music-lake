import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { dynamo, queryItemsByUserId, updateItem, TABLE_CONCERT_LOGS } from "../utils/dynamodb";
import type { ConcertLog } from "../types";

export const findById = async (id: string): Promise<ConcertLog | undefined> => {
  const result = await dynamo.send(new GetCommand({ TableName: TABLE_CONCERT_LOGS, Key: { id } }));
  return result.Item as ConcertLog | undefined;
};

export const findByUserId = async (userId: string): Promise<ConcertLog[]> => {
  return queryItemsByUserId<ConcertLog>(TABLE_CONCERT_LOGS, userId);
};

export const save = async (item: ConcertLog): Promise<void> => {
  await dynamo.send(new PutCommand({ TableName: TABLE_CONCERT_LOGS, Item: item }));
};

export const update = async (id: string, input: Partial<ConcertLog>): Promise<ConcertLog> => {
  return updateItem<ConcertLog>(TABLE_CONCERT_LOGS, id, input);
};

export const remove = async (id: string): Promise<void> => {
  await dynamo.send(new DeleteCommand({ TableName: TABLE_CONCERT_LOGS, Key: { id } }));
};
