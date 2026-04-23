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
    <PageTitle>鑑賞記録を編集</PageTitle>
    <ErrorMessage v-if="error" :message="error" />
    <ListeningLogForm
      :initial-values="log"
      submit-label="更新する"
      @submit="emit('submit', $event)"
    />
  </div>
</template>
