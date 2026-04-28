<script setup lang="ts">
import type { ListeningLog } from "~/types";
import type { ListeningLogFilterState } from "~/composables/useListeningLogFilter";

defineProps<{
  logs: ListeningLog[];
  filterState: ListeningLogFilterState;
  filterActive: boolean;
  totalCount: number;
}>();

const emit = defineEmits<{
  delete: [id: string];
  "update:filterState": [value: ListeningLogFilterState];
  "reset-filter": [];
}>();
</script>

<template>
  <div>
    <PageHeader title="鑑賞記録" new-page-path="/listening-logs/new">+ 新しい記録</PageHeader>
    <div class="toolbar">
      <NuxtLink to="/listening-logs/statistics" class="stats-link">📊 統計を見る</NuxtLink>
    </div>
    <ListeningLogFilter
      :model-value="filterState"
      :is-active="filterActive"
      @update:model-value="emit('update:filterState', $event)"
      @reset="emit('reset-filter')"
    />
    <p v-if="filterActive" class="filter-summary">
      {{ logs.length }} / {{ totalCount }} 件を表示中
    </p>
    <ListeningLogList :logs="logs" @delete="emit('delete', $event)" />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.stats-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.95rem;
}

.stats-link:hover {
  text-decoration: underline;
}

.filter-summary {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}
</style>
