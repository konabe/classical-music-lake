<script setup lang="ts">
import type { ListeningLog } from "~/types";

defineProps<{
  logs: ListeningLog[];
}>();

const emit = defineEmits<{
  delete: [id: string];
}>();

const router = useRouter();
</script>

<template>
  <div>
    <div class="page-header">
      <h1>鑑賞記録</h1>
      <ButtonPrimary @click="router.push('/listening-logs/new')">+ 新しい記録</ButtonPrimary>
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
  color: #1e2d5a;
}
</style>
