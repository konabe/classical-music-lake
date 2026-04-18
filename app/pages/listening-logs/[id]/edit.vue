<script setup lang="ts">
import type { UpdateListeningLogInput } from "~/types";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const id = route.params.id as string;
const { data: log } = await useListeningLog(() => id);
const { update } = useListeningLogs();
const { error, handleSubmit } = useSubmitHandler<UpdateListeningLogInput>({
  submit: (values) => update(id, values),
  redirectTo: `/listening-logs/${id}`,
  errorMessage: "記録の更新に失敗しました。",
});
</script>

<template>
  <ListeningLogEditTemplate v-if="log" :log="log" :error="error" @submit="handleSubmit" />
</template>
