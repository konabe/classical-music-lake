<script setup lang="ts">
import type { PageResult } from "~/composables/usePaginatedList";
import type { PieceWork } from "~/types";

const apiBase = useApiBase();
const { data, pending } = useFetch<PageResult<PieceWork>>(`${apiBase}/pieces`);
const { data: composers, refresh: refreshComposers } = useComposersAll();
void refreshComposers();

const { isAdmin } = useAuth();
const isAdminUser = isAdmin();

const composerNameById = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  for (const c of composers.value ?? []) {
    map[c.id] = c.name;
  }
  return map;
});
</script>

<template>
  <HomeTemplate
    :pieces="data?.items ?? []"
    :loading="pending"
    :is-admin="isAdminUser"
    :composer-name-by-id="composerNameById"
  />
</template>
