<script setup lang="ts">
import type { ListeningLog } from "~/types";

defineProps<{
  log: ListeningLog;
}>();
</script>

<template>
  <div>
    <div class="page-header">
      <NuxtLink to="/listening-logs" class="back-link">← 鑑賞記録一覧</NuxtLink>
      <ButtonLinkSecondary :to="`/listening-logs/${log.id}/edit`">編集</ButtonLinkSecondary>
    </div>

    <ListeningLogDetail :log="log" />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.back-link {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover {
  color: #333;
}
</style>
