<script setup lang="ts">
import type { ConcertLog, UpdateConcertLogInput } from "~/types";

defineProps<{
  log: ConcertLog;
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [values: UpdateConcertLogInput];
}>();
</script>

<template>
  <div>
    <h1 class="page-title">コンサート記録を編集</h1>
    <ErrorMessage v-if="error" :message="error" />
    <ConcertLogForm
      :initial-values="log"
      submit-label="更新する"
      @submit="emit('submit', $event)"
    />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}
</style>
