import type { CreateListeningLogInput, ListeningLog, UpdateListeningLogInput } from "@/types";
import { useCrudResource, useCrudResourceItem } from "@/composables/useCrudResource";
import { useAuthenticatedApi } from "@/composables/useAuthenticatedApi";

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

export const useListeningLogCreate = () => {
  const apiBase = useApiBase();
  const { postJson } = useAuthenticatedApi();

  const create = (input: CreateListeningLogInput): Promise<ListeningLog> =>
    postJson<ListeningLog>(`${apiBase}/listening-logs`, input);

  return { create };
};
