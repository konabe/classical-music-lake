<script setup lang="ts">
import type { ListeningLogStatistics } from "~/composables/useListeningLogStatistics";

defineProps<{
  statistics: ListeningLogStatistics;
}>();
</script>

<template>
  <div>
    <PageHeader title="鑑賞統計" />
    <div class="back-link-row">
      <NuxtLink to="/listening-logs" class="back-link">← 鑑賞記録一覧へ戻る</NuxtLink>
    </div>
    <ListeningLogStatistics :statistics="statistics" />
  </div>
</template>

<style scoped>
.back-link-row {
  margin-bottom: 1.5rem;
}

.back-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.95rem;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
