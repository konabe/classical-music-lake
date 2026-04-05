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
    <div class="piece-info">
      <span class="piece-info-label">作曲家</span>
      <span class="piece-info-value">{{ composer }}</span>
    </div>
    <div class="piece-info">
      <span class="piece-info-label">曲名</span>
      <span class="piece-info-value">{{ piece }}</span>
    </div>

    <FormGroup label="評価">
      <RatingSelector v-model="rating" />
    </FormGroup>

    <div class="form-group">
      <label class="checkbox-label" for="is-favorite">
        <input id="is-favorite" v-model="isFavorite" type="checkbox" />
        お気に入り
      </label>
    </div>

    <FormGroup label="感想・メモ" input-id="memo">
      <textarea id="memo" v-model="memo" rows="4" placeholder="自由に感想を書いてください..." />
    </FormGroup>

    <div v-if="saved" class="success-message">保存しました！</div>

    <ButtonPrimary type="submit">記録する</ButtonPrimary>
  </form>
</template>

<style scoped>
.quick-log-form {
  background: #eaeef4;
  border: 1px solid #9aa5b4;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.piece-info {
  display: flex;
  gap: 0.8rem;
  align-items: baseline;
}

.piece-info-label {
  font-size: 0.85rem;
  color: #666;
  min-width: 4rem;
}

.piece-info-value {
  font-size: 1rem;
  color: #1e2d5a;
  font-weight: bold;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}

textarea {
  border: 1px solid #9aa5b4;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  font-family: inherit;
  background: #faf3e0;
  transition: border-color 0.2s;
}

textarea:focus {
  outline: none;
  border-color: #1e2d5a;
}

.success-message {
  color: #2a7a2a;
  font-size: 0.95rem;
  font-weight: bold;
}
</style>
