<script setup lang="ts">
import type { UpdateConcertLogInput } from "~/types";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const { data: log } = await useConcertLog(() => route.params.id as string);
const { update } = useConcertLogs();
const error = ref<string | null>(null);

async function handleSubmit(values: UpdateConcertLogInput) {
  error.value = null;
  try {
    await update(route.params.id as string, values);
    await navigateTo(`/concert-logs/${route.params.id}`);
  } catch {
    error.value = "記録の更新に失敗しました。";
  }
}
</script>

<template>
  <ConcertLogEditTemplate v-if="log" :log="log" :error="error" @submit="handleSubmit" />
</template>
