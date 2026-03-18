<script setup lang="ts">
import type { UpdateListeningLogInput } from "~/types";

const route = useRoute();
const { data: log } = await useListeningLog(() => route.params.id as string);
const { update } = useListeningLogs();
const error = ref<string | null>(null);

async function handleSubmit(values: UpdateListeningLogInput) {
  error.value = null;
  try {
    await update(route.params.id as string, values);
    await navigateTo(`/listening-logs/${route.params.id}`);
  } catch {
    error.value = "記録の更新に失敗しました。";
  }
}
</script>

<template>
  <div v-if="log">
    <h1 class="page-title">鑑賞記録を編集</h1>
    <p v-if="error" class="error-message">{{ error }}</p>
    <ListeningLogForm :initial-values="log" submit-label="更新する" @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}

.error-message {
  color: #e05a5a;
  margin-bottom: 1rem;
}
</style>
