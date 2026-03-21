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
    <div class="page-header">
      <h1>鑑賞記録</h1>
      <NuxtLink to="/listening-logs/new" class="btn-primary">+ 新しい記録</NuxtLink>
    </div>

    <ListeningLogList :logs="logs" @delete="emit('delete', $event)" />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #1a1a2e;
}
</style>
