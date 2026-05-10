<script setup lang="ts">
import type { PieceWork, UpdatePieceInput } from "~/types";

definePageMeta({ middleware: ["admin"] });

const route = useRoute();
const id = computed(() => route.params.id as string);

const { data: piece, error: fetchError } = await usePiece(() => id.value);
const { updatePiece } = usePiecesPaginated();
const { data: composers, pending: composersPending, refresh: refreshComposers } = useComposersAll();
await refreshComposers();

const { data: movements } = useMovements(() => id.value);

const workPiece = computed<PieceWork | null>(() =>
  piece.value !== null && piece.value !== undefined && piece.value.kind === "work"
    ? piece.value
    : null,
);

const { error, handleSubmit } = useSubmitHandler<UpdatePieceInput>({
  submit: (values) => updatePiece(id.value, values),
  redirectTo: "/pieces",
  errorMessage: "更新に失敗しました。入力内容を確認してください。",
});
</script>

<template>
  <PieceEditTemplate
    :piece="workPiece"
    :fetch-error="fetchError"
    :error="error"
    :composers="composers ?? []"
    :composers-pending="composersPending"
    :movements="movements ?? []"
    @submit="handleSubmit"
  />
</template>
