<script setup lang="ts">
import type { UpdateConcertLogInput } from "@/types";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const id = route.params.id as string;
const { data: log } = await useConcertLog(() => id);
const { update } = useConcertLogs();
const { error, handleSubmit } = useSubmitHandler<UpdateConcertLogInput>({
  submit: (values) => update(id, values),
  redirectTo: `/concert-logs/${id}`,
  errorMessage: "記録の更新に失敗しました。",
});
</script>

<template>
  <ConcertLogEditTemplate v-if="log" :log="log" :error="error" @submit="handleSubmit" />
</template>
