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
    <PageTitle>コンサート記録を編集</PageTitle>
    <ErrorMessage v-if="error" :message="error" />
    <ConcertLogForm
      :initial-values="log"
      submit-label="更新する"
      @submit="emit('submit', $event)"
    />
  </div>
</template>
