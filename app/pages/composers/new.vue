<script setup lang="ts">
import type { CreateComposerInput } from "@/types";

definePageMeta({ middleware: ["admin"] });

const { createComposer } = useComposersAll();
const { error, handleSubmit } = useSubmitHandler<CreateComposerInput>({
  submit: (values) => createComposer(values),
  redirectTo: "/composers",
  errorMessage: "登録に失敗しました。入力内容を確認してください。",
});
</script>

<template>
  <ComposerNewTemplate :error="error" @submit="handleSubmit" />
</template>
