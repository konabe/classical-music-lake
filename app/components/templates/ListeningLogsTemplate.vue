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
.btn-primary {
  background: #1e2d5a;
  color: #fff;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2b3f7e;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #1e2d5a;
}
</style>
