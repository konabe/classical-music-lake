import type { CreateListeningLogInput, ListeningLog, UpdateListeningLogInput } from "~/types";

export const useListeningLogs = () => {
  const apiBase = useApiBase();
  const list = useFetch<ListeningLog[]>(`${apiBase}/listening-logs`);

  const create = (input: CreateListeningLogInput) =>
    $fetch<ListeningLog>(`${apiBase}/listening-logs`, { method: "POST", body: input });

  const update = (id: string, input: UpdateListeningLogInput) =>
    $fetch<ListeningLog>(`${apiBase}/listening-logs/${id}`, { method: "PUT", body: input });

  const deleteLog = (id: string) => $fetch(`${apiBase}/listening-logs/${id}`, { method: "DELETE" });

  return { ...list, create, update, deleteLog };
};

export const useListeningLog = (id: () => string) => {
  const apiBase = useApiBase();
  return useFetch<ListeningLog>(() => `${apiBase}/listening-logs/${id()}`);
};
