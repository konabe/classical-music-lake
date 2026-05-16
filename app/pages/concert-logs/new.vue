<script setup lang="ts">
import type { CreateConcertLogInput } from "@/types";

definePageMeta({ middleware: "auth" });

const { create } = useConcertLogs();
const { error, handleSubmit } = useSubmitHandler<CreateConcertLogInput>({
  submit: (values) => create(values),
  redirectTo: "/concert-logs",
  errorMessage: "記録の作成に失敗しました。",
});
</script>

<template>
  <ConcertLogNewTemplate :error="error" @submit="handleSubmit" />
</template>
