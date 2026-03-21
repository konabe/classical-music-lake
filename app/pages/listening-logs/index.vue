<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { data: logs, refresh, deleteLog } = await useListeningLogs();

async function handleDelete(id: string) {
  if (!confirm("この記録を削除しますか？")) return;
  await deleteLog(id);
  await refresh();
}
</script>

<template>
  <ListeningLogsTemplate :logs="logs ?? []" @delete="handleDelete" />
</template>
