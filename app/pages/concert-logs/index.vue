<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { data: logs } = useConcertLogs();
</script>

<template>
  <ConcertLogsTemplate :logs="logs ?? []" />
</template>
