<script setup lang="ts">
import type { Rating } from "~/types";

defineProps<{
  composer: string;
  piece: string;
}>();

const emit = defineEmits<{
  submit: [values: { rating: Rating; isFavorite: boolean; memo: string }];
}>();

const rating = ref<Rating>(3);
const isFavorite = ref(false);
const memo = ref("");
const saved = ref(false);

function handleSubmit() {
  emit("submit", { rating: rating.value, isFavorite: isFavorite.value, memo: memo.value });
  rating.value = 3;
  isFavorite.value = false;
  memo.value = "";
  saved.value = true;
  setTimeout(() => {
    saved.value = false;
  }, 3000);
}
</script>

<template>
  <form class="quick-log-form" @submit.prevent="handleSubmit">
    <dl class="piece-info-grid">
      <div class="piece-info-row">
        <dt class="smallcaps">Composer</dt>
        <dd class="piece-info-value">{{ composer }}</dd>
      </div>
      <div class="piece-info-row">
        <dt class="smallcaps">Piece</dt>
        <dd class="piece-info-value">{{ piece }}</dd>
      </div>
    </dl>

    <FormGroup label="Rating">
      <RatingSelector v-model="rating" />
    </FormGroup>

    <div class="form-group">
      <label class="checkbox-label" for="is-favorite">
        <input id="is-favorite" v-model="isFavorite" type="checkbox" />
        <span class="checkbox-text">Mark as favorite</span>
      </label>
    </div>

    <FormGroup label="Notes" input-id="memo">
      <textarea id="memo" v-model="memo" rows="4" placeholder="自由に感想を書いてください…" />
    </FormGroup>

    <div v-if="saved" class="success-message">
      <span aria-hidden="true">&check;</span> 保存しました
    </div>

    <div class="form-action">
      <ButtonPrimary type="submit">記録する</ButtonPrimary>
    </div>
  </form>
</template>

<style scoped>
.quick-log-form {
  background: var(--color-bg-paper);
  border: 1px solid var(--color-hairline);
  padding: clamp(1.5rem, 3vw, 2.4rem);
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  position: relative;
}

.quick-log-form::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--color-accent);
  opacity: 0.6;
}

.piece-info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-hairline);
}

.piece-info-row {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.piece-info-row dt {
  min-width: 6rem;
  color: var(--color-text-muted);
}

.piece-info-value {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.05rem;
  color: var(--color-text);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: var(--color-text);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  accent-color: var(--color-accent);
  width: 1.05rem;
  height: 1.05rem;
}

.checkbox-text {
  letter-spacing: 0.02em;
}

textarea {
  border: none;
  border-bottom: 1px solid var(--color-hairline-strong);
  border-radius: 0;
  padding: 0.6rem 0.1rem;
  font-size: 0.95rem;
  font-family: var(--font-serif);
  background: transparent;
  color: var(--color-text);
  transition: border-color 0.25s ease;
  resize: vertical;
}

textarea::placeholder {
  font-style: italic;
  color: var(--color-text-faint);
}

textarea:focus {
  outline: none;
  border-bottom-color: var(--color-accent);
}

.success-message {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-success);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.form-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}
</style>
