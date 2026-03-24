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
    <EmptyState v-if="!logs.length"
      >まだ記録がありません。最初の鑑賞記録を追加しましょう。</EmptyState
    >

    <ul v-else class="log-list">
      <ListeningLogItem
        v-for="log in logs"
        :key="log.id"
        :listening-log="log"
        @edit="router.push(`/listening-logs/${log.id}/edit`)"
        @delete="emit('delete', log.id)"
      />
    </ul>
  </div>
</template>

<style scoped>
.log-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
