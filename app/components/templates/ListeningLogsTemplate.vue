<script setup lang="ts">
import type { ListeningLog } from "~/types";

defineProps<{
  logs: ListeningLog[];
}>();

const emit = defineEmits<{
  delete: [id: string];
}>();
</script>

<template>
  <div>
    <PageHeader title="鑑賞記録" new-page-path="/listening-logs/new">+ 新しい記録</PageHeader>
    <ListeningLogList :logs="logs" @delete="emit('delete', $event)" />
  </div>
</template>
