<script setup lang="ts">
import { ref } from "vue";
import { nowAsDatetimeLocal, toDatetimeLocal } from "~/utils/date";
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
  listenedAt: props.initialValues?.listenedAt
    ? toDatetimeLocal(props.initialValues.listenedAt)
    : nowAsDatetimeLocal(),
  composer: props.initialValues?.composer ?? "",
  piece: props.initialValues?.piece ?? "",
  rating: props.initialValues?.rating ?? 3,
  isFavorite: props.initialValues?.isFavorite ?? false,
  memo: props.initialValues?.memo ?? "",
});

const selectedVideoUrl = ref<string | undefined>(undefined);

function handlePieceSelect(e: Event) {
  const id = (e.target as HTMLSelectElement).value;
  const found = pieces.value?.find((p) => p.id === id);
  form.piece = found?.title ?? "";
  form.composer = found?.composer ?? "";
  selectedVideoUrl.value = found?.videoUrl;
}

function handleSubmit() {
  emit("submit", { ...form, listenedAt: new Date(form.listenedAt).toISOString() });
}
</script>

<template>
  <form class="log-form" @submit.prevent="handleSubmit">
    <FormGroup label="鑑賞日時" required>
      <input v-model="form.listenedAt" type="datetime-local" required />
    </FormGroup>

    <FormGroup label="楽曲マスタから選択">
      <select class="piece-select" :disabled="piecesPending" @change="handlePieceSelect">
        <option value="">{{ piecesPending ? "読み込み中..." : "選択しない" }}</option>
        <option v-for="piece in pieces" :key="piece.id" :value="piece.id">
          {{ piece.title }} / {{ piece.composer }}
        </option>
      </select>
    </FormGroup>

    <VideoPlayer v-if="selectedVideoUrl" :video-url="selectedVideoUrl" />

    <div class="form-row">
      <FormGroup label="作曲家" required>
        <TextInput v-model="form.composer" placeholder="例: ベートーヴェン" required />
      </FormGroup>
      <FormGroup label="曲名" required>
        <TextInput v-model="form.piece" placeholder="例: 交響曲第9番" required />
      </FormGroup>
    </div>

    <FormGroup label="評価">
      <RatingSelector v-model="form.rating" />
    </FormGroup>

    <div class="form-group">
      <label class="checkbox-label">
        <input v-model="form.isFavorite" type="checkbox" />
        お気に入り
      </label>
    </div>

    <FormGroup label="感想・メモ">
      <textarea v-model="form.memo" rows="4" placeholder="自由に感想を書いてください..." />
    </FormGroup>

    <FormActions :submit-label="submitLabel" @cancel="$router.push('/listening-logs')" />
  </form>
</template>

<style scoped>
.log-form {
  background: #eaeef4;
  border: 1px solid #9aa5b4;
  border-radius: 12px;
  padding: 2rem;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
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
}

input[type="datetime-local"],
textarea,
select {
  border: 1px solid #9aa5b4;
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
  border-color: #1e2d5a;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}
</style>
