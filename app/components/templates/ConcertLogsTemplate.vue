<script setup lang="ts">
import type { ConcertLog } from "~/types";

defineProps<{
  logs: ConcertLog[];
}>();
</script>

<template>
  <div>
    <PageHeader title="コンサート記録" new-page-path="/concert-logs/new">+ 新しい記録</PageHeader>
    <ConcertLogList :logs="logs" />
  </div>
</template>
