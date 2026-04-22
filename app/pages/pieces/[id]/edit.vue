<script setup lang="ts">
import type { UpdatePieceInput } from "~/types";

definePageMeta({ middleware: ["admin"] });

const route = useRoute();
const id = computed(() => route.params.id as string);

const { data: piece, error: fetchError } = await usePiece(() => id.value);
const { updatePiece } = usePiecesPaginated();
const { data: composers, pending: composersPending, refresh: refreshComposers } = useComposersAll();
await refreshComposers();

const { error, handleSubmit } = useSubmitHandler<UpdatePieceInput>({
  submit: (values) => updatePiece(id.value, values),
  redirectTo: "/pieces",
  errorMessage: "更新に失敗しました。入力内容を確認してください。",
});
</script>

<template>
  <PieceEditTemplate
    :piece="piece ?? null"
    :fetch-error="fetchError"
    :error="error"
    :composers="composers ?? []"
    :composers-pending="composersPending"
    @submit="handleSubmit"
  />
</template>
