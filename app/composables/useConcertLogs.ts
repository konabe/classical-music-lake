import type { ConcertLog, CreateConcertLogInput, UpdateConcertLogInput } from "~/types";
import { useCrudResource, useCrudResourceItem } from "./useCrudResource";

export const useConcertLogs = () => {
  const { deleteItem, ...rest } = useCrudResource<
    ConcertLog,
    CreateConcertLogInput,
    UpdateConcertLogInput
  >("concert-logs");
  return { ...rest, deleteLog: deleteItem };
};

export const useConcertLog = (id: () => string) =>
  useCrudResourceItem<ConcertLog>("concert-logs", id);
