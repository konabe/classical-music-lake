<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const { data: logs } = useListeningLogs();
const { statistics } = useListeningLogStatistics(logs);
</script>

<template>
  <ListeningLogStatisticsTemplate :statistics="statistics" />
</template>
