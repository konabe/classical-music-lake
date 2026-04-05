<script setup lang="ts">
import type { ConcertLog } from "~/types";

defineProps<{
  logs: ConcertLog[];
}>();

const router = useRouter();
</script>

<template>
  <div>
    <EmptyState v-if="!logs.length"
      >まだ記録がありません。最初のコンサート記録を追加しましょう。</EmptyState
    >

    <ul v-else class="log-list">
      <ConcertLogItem
        v-for="log in logs"
        :key="log.id"
        :concert-log="log"
        @detail="router.push(`/concert-logs/${log.id}`)"
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
