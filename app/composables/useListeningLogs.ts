import type { CreateListeningLogInput, ListeningLog, UpdateListeningLogInput } from "~/types";
import { useCrudResource, useCrudResourceItem } from "./useCrudResource";

export const useListeningLogs = () => {
  const { deleteItem, ...rest } = useCrudResource<
    ListeningLog,
    CreateListeningLogInput,
    UpdateListeningLogInput
  >("listening-logs");
  return { ...rest, deleteLog: deleteItem };
};

export const useListeningLog = (id: () => string) =>
  useCrudResourceItem<ListeningLog>("listening-logs", id);
