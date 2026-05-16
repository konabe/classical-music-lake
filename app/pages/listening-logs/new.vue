<script setup lang="ts">
import type { CreateListeningLogInput } from "@/types";

definePageMeta({ middleware: "auth" });

const { create } = useListeningLogs();
const { error, handleSubmit } = useSubmitHandler<CreateListeningLogInput>({
  submit: (values) => create(values),
  redirectTo: "/listening-logs",
  errorMessage: "記録の作成に失敗しました。",
});
</script>

<template>
  <ListeningLogNewTemplate :error="error" @submit="handleSubmit" />
</template>
