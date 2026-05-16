<script setup lang="ts">
import { nowAsDatetimeLocal, toDatetimeLocal } from "@/utils/date";
import type { CreateListeningLogInput } from "@/types";

const props = defineProps<{
  initialValues?: Partial<CreateListeningLogInput>;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  submit: [values: CreateListeningLogInput];
}>();

const { data: pieces, pending: piecesPending, refresh: refreshPieces } = usePiecesAll();
const { data: composers, refresh: refreshComposers } = useComposersAll();
void refreshPieces();
void refreshComposers();

const composerNameById = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  for (const c of composers.value ?? []) {
    map[c.id] = c.name;
  }
  return map;
});

const form = reactive<CreateListeningLogInput>({
  listenedAt:
    props.initialValues?.listenedAt === undefined
      ? nowAsDatetimeLocal()
      : toDatetimeLocal(props.initialValues.listenedAt),
  pieceId: props.initialValues?.pieceId ?? "",
  rating: props.initialValues?.rating ?? 3,
  isFavorite: props.initialValues?.isFavorite ?? false,
  memo: props.initialValues?.memo ?? "",
});

const selectedPiece = computed(() => (pieces.value ?? []).find((p) => p.id === form.pieceId));
const selectedComposerName = computed(() => {
  const composerId = selectedPiece.value?.composerId;
  return composerId === undefined ? "" : (composerNameById.value[composerId] ?? "");
});
const selectedVideoUrl = computed(() => selectedPiece.value?.videoUrls?.[0]);

function handleSubmit() {
  emit("submit", {
    ...form,
    listenedAt: new Date(form.listenedAt).toISOString(),
  });
}
</script>

<template>
  <form class="log-form" @submit.prevent="handleSubmit">
    <FormGroup label="鑑賞日時" input-id="listened-at" required>
      <input
        id="listened-at"
        v-model="form.listenedAt"
        type="datetime-local"
        class="native-input"
        required
      />
    </FormGroup>

    <FormGroup label="楽曲マスタから選択" input-id="piece-select" required>
      <div class="select-wrap">
        <select
          id="piece-select"
          v-model="form.pieceId"
          class="native-select"
          :disabled="piecesPending"
          required
        >
          <option value="" disabled>
            {{ piecesPending ? "読み込み中…" : "楽曲を選択してください" }}
          </option>
          <option v-for="piece in pieces" :key="piece.id" :value="piece.id">
            {{ piece.title }} / {{ composerNameById[piece.composerId] ?? "(不明)" }}
          </option>
        </select>
        <span class="select-caret" aria-hidden="true">&#x25BE;</span>
      </div>
    </FormGroup>

    <p v-if="selectedPiece" class="composer-hint smallcaps">
      Composer — {{ selectedComposerName || "(不明)" }}
    </p>

    <VideoPlayer v-if="selectedVideoUrl" :video-url="selectedVideoUrl" />

    <FormGroup label="評価">
      <RatingSelector v-model="form.rating" />
    </FormGroup>

    <div class="form-group">
      <label class="checkbox-label" for="is-favorite">
        <input id="is-favorite" v-model="form.isFavorite" type="checkbox" />
        <span class="checkbox-text smallcaps">Mark as favorite</span>
      </label>
    </div>

    <FormGroup label="感想・メモ" input-id="memo">
      <textarea
        id="memo"
        v-model="form.memo"
        rows="4"
        class="native-textarea"
        placeholder="自由に感想を書いてください…"
      />
    </FormGroup>

    <FormActions :submit-label="submitLabel" @cancel="$router.push('/listening-logs')" />
  </form>
</template>

<style scoped>
.log-form {
  background: transparent;
  border: none;
  padding: 0;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.composer-hint {
  margin: -0.8rem 0 0;
  color: var(--color-text-muted);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

/* native input/select/textarea — エディトリアル罫線スタイル */
.native-input,
.native-textarea,
.native-select {
  border: none;
  border-bottom: 1px solid var(--color-hairline-strong);
  border-radius: 0;
  padding: 0.55rem 0.1rem;
  font-size: 0.95rem;
  font-family: var(--font-sans);
  background: transparent;
  color: var(--color-text);
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.25s ease;
  font-variant-numeric: tabular-nums;
}

.native-textarea {
  font-family: var(--font-serif);
  resize: vertical;
}

.native-textarea::placeholder,
.native-input::placeholder {
  color: var(--color-text-faint);
  font-style: italic;
}

.native-input:focus,
.native-textarea:focus,
.native-select:focus {
  outline: none;
  border-bottom-color: var(--color-accent);
}

.select-wrap {
  position: relative;
  width: 100%;
}

.native-select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 1.6rem;
  cursor: pointer;
}

.select-caret {
  position: absolute;
  right: 0.3rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-accent);
  font-size: 0.85rem;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-family: var(--font-sans);
}

.checkbox-label input[type="checkbox"] {
  accent-color: var(--color-accent);
  width: 1.05rem;
  height: 1.05rem;
}

.checkbox-text {
  color: var(--color-text-muted);
}
</style>
