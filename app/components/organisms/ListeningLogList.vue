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

    <ul v-else class="log-list stagger-children">
      <li v-for="log in logs" :key="log.id">
        <ListeningLogItem
          :listening-log="log"
          @edit="router.push(`/listening-logs/${log.id}/edit`)"
          @delete="emit('delete', log.id)"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.log-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--color-hairline);
}
</style>
