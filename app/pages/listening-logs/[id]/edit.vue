<script setup lang="ts">
import type { UpdateListeningLogInput } from "~/types";

definePageMeta({ middleware: "auth" });

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
  <ListeningLogEditTemplate v-if="log" :log="log" :error="error" @submit="handleSubmit" />
</template>
