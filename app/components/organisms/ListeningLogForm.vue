<script setup lang="ts">
import { nowAsDatetimeLocal } from "~/utils/date";
import type { CreateListeningLogInput } from "~/types";

const props = defineProps<{
  initialValues?: Partial<CreateListeningLogInput>;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  submit: [values: CreateListeningLogInput];
}>();

const { data: pieces, pending: piecesPending } = usePieces();

const form = reactive<CreateListeningLogInput>({
  listenedAt: props.initialValues?.listenedAt ?? nowAsDatetimeLocal(),
  composer: props.initialValues?.composer ?? "",
  piece: props.initialValues?.piece ?? "",
  rating: props.initialValues?.rating ?? 3,
  isFavorite: props.initialValues?.isFavorite ?? false,
  memo: props.initialValues?.memo ?? "",
});

function handlePieceSelect(e: Event) {
  const id = (e.target as HTMLSelectElement).value;
  const found = pieces.value?.find((p) => p.id === id);
  form.piece = found?.title ?? "";
  form.composer = found?.composer ?? "";
}

function handleSubmit() {
  emit("submit", { ...form });
}
</script>

<template>
  <form class="log-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>鑑賞日時 <RequiredMark /></label>
      <input v-model="form.listenedAt" type="datetime-local" required />
    </div>

    <div class="form-group">
      <label>楽曲マスタから選択</label>
      <select class="piece-select" :disabled="piecesPending" @change="handlePieceSelect">
        <option value="">{{ piecesPending ? "読み込み中..." : "選択しない" }}</option>
        <option v-for="piece in pieces" :key="piece.id" :value="piece.id">
          {{ piece.title }} / {{ piece.composer }}
        </option>
      </select>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>作曲家 <RequiredMark /></label>
        <input v-model="form.composer" type="text" placeholder="例: ベートーヴェン" required />
      </div>
      <div class="form-group">
        <label>曲名 <RequiredMark /></label>
        <input v-model="form.piece" type="text" placeholder="例: 交響曲第9番" required />
      </div>
    </div>

    <div class="form-group">
      <label>評価</label>
      <RatingSelector v-model="form.rating" />
    </div>

    <div class="form-group">
      <label class="checkbox-label">
        <input v-model="form.isFavorite" type="checkbox" />
        お気に入り
      </label>
    </div>

    <div class="form-group">
      <label>感想・メモ</label>
      <textarea v-model="form.memo" rows="4" placeholder="自由に感想を書いてください..." />
    </div>

    <div class="form-actions">
      <NuxtLink to="/listening-logs" class="btn-secondary">キャンセル</NuxtLink>
      <button type="submit" class="btn-primary">{{ submitLabel ?? "保存する" }}</button>
    </div>
  </form>
</template>

<style scoped>
.log-form {
  background: #f2e6c9;
  border: 1px solid #b8995e;
  border-radius: 12px;
  padding: 2rem;
  max-width: 720px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.2rem;
}

label {
  font-size: 0.9rem;
  font-weight: bold;
  color: #444;
}

input[type="text"],
input[type="datetime-local"],
textarea,
select {
  border: 1px solid #b8995e;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  font-family: inherit;
  background: #faf3e0;
  transition: border-color 0.2s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #1a1a2e;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
