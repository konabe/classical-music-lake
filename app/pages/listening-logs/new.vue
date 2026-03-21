<script setup lang="ts">
import type { CreateListeningLogInput } from "~/types";

definePageMeta({ middleware: "auth" });

const { create } = useListeningLogs();
const error = ref<string | null>(null);

async function handleSubmit(values: CreateListeningLogInput) {
  error.value = null;
  try {
    await create(values);
    await navigateTo("/listening-logs");
  } catch {
    error.value = "記録の作成に失敗しました。";
  }
}
</script>

<template>
  <ListeningLogNewTemplate :error="error" @submit="handleSubmit" />
</template>
