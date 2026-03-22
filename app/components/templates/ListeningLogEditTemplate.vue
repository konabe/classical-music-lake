<script setup lang="ts">
import type { ListeningLog, UpdateListeningLogInput } from "~/types";

defineProps<{
  log: ListeningLog;
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [values: UpdateListeningLogInput];
}>();
</script>

<template>
  <div>
    <h1 class="page-title">鑑賞記録を編集</h1>
    <ErrorMessage v-if="error" :message="error" />
    <ListeningLogForm
      :initial-values="log"
      submit-label="更新する"
      @submit="emit('submit', $event)"
    />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: #1e2d5a;
  margin-bottom: 1.5rem;
}
</style>
