<script setup lang="ts">
definePageMeta({ middleware: "auth" });

// useListeningLogs は useFetch の then が spread されるため thenable になる。
// `await useListeningLogs()` は asyncReturn（AsyncData本体）に解決され
// deleteLog が undefined になる。変数を分けて await することで回避する。
const listeningLogs = useListeningLogs();
await listeningLogs;
const { data: logs, refresh, deleteLog } = listeningLogs;

async function handleDelete(id: string) {
  if (!confirm("この記録を削除しますか？")) {
    return;
  }
  await deleteLog(id);
  await refresh();
}
</script>

<template>
  <ListeningLogsTemplate :logs="logs ?? []" @delete="handleDelete" />
</template>
