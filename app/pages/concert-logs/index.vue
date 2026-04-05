<script setup lang="ts">
definePageMeta({ middleware: "auth" });

// useConcertLogs は useFetch の then が spread されるため thenable になる。
// `await useConcertLogs()` は asyncReturn（AsyncData本体）に解決され
// create が undefined になる。変数を分けて await することで回避する。
const concertLogs = useConcertLogs();
await concertLogs;
const { data: logs } = concertLogs;
</script>

<template>
  <ConcertLogsTemplate :logs="logs ?? []" />
</template>
