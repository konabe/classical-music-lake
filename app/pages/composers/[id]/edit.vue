<script setup lang="ts">
import type { UpdateComposerInput } from "@/types";

definePageMeta({ middleware: ["admin"] });

const route = useRoute();
const id = computed(() => route.params.id as string);

const { data: composer, error: fetchError } = await useComposer(() => id.value);
const { updateComposer } = useComposersAll();
const { error, handleSubmit } = useSubmitHandler<UpdateComposerInput>({
  submit: (values) => updateComposer(id.value, values),
  redirectTo: "/composers",
  errorMessage: "更新に失敗しました。入力内容を確認してください。",
});
</script>

<template>
  <ComposerEditTemplate
    :composer="composer ?? null"
    :fetch-error="fetchError"
    :error="error"
    @submit="handleSubmit"
  />
</template>
