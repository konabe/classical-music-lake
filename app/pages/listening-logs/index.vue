<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { data: logs, refresh, deleteLog } = useListeningLogs();
const { state, filteredLogs, isActive, reset } = useListeningLogFilter(logs);
const totalCount = computed(() => logs.value?.length ?? 0);

async function handleDelete(id: string) {
  if (!confirm("この記録を削除しますか？")) {
    return;
  }
  await deleteLog(id);
  await refresh();
}
</script>

<template>
  <ListeningLogsTemplate
    :logs="filteredLogs"
    :filter-state="state"
    :filter-active="isActive"
    :total-count="totalCount"
    @delete="handleDelete"
    @update:filter-state="state = $event"
    @reset-filter="reset"
  />
</template>
