<script setup lang="ts">
import type { CreateListeningLogInput } from '~/types'

const props = defineProps<{
  initialValues?: Partial<CreateListeningLogInput>
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [values: CreateListeningLogInput]
}>()

const form = reactive<CreateListeningLogInput>({
  listenedAt: props.initialValues?.listenedAt ?? new Date().toISOString().slice(0, 16),
  composer: props.initialValues?.composer ?? '',
  piece: props.initialValues?.piece ?? '',
  performer: props.initialValues?.performer ?? '',
  conductor: props.initialValues?.conductor ?? '',
  rating: props.initialValues?.rating ?? 3,
  isFavorite: props.initialValues?.isFavorite ?? false,
  memo: props.initialValues?.memo ?? '',
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="log-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label>鑑賞日時 <span class="required">*</span></label>
      <input v-model="form.listenedAt" type="datetime-local" required />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>作曲家 <span class="required">*</span></label>
        <input v-model="form.composer" type="text" placeholder="例: ベートーヴェン" required />
      </div>
      <div class="form-group">
        <label>曲名 <span class="required">*</span></label>
        <input v-model="form.piece" type="text" placeholder="例: 交響曲第9番" required />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>演奏家・楽団 <span class="required">*</span></label>
        <input v-model="form.performer" type="text" placeholder="例: ベルリン・フィル" required />
      </div>
      <div class="form-group">
        <label>指揮者</label>
        <input v-model="form.conductor" type="text" placeholder="例: カラヤン" />
      </div>
    </div>

    <div class="form-group">
      <label>評価</label>
      <div class="rating-selector">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="star-btn"
          :class="{ active: n <= form.rating }"
          @click="form.rating = n"
        >★</button>
      </div>
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
      <NuxtLink to="/listening-logs" class="btn-cancel">キャンセル</NuxtLink>
      <button type="submit" class="btn-submit">{{ submitLabel ?? '保存する' }}</button>
    </div>
  </form>
</template>

<style scoped>
.log-form {
  background: #fff;
  border: 1px solid #e0d8cc;
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

.required {
  color: #e05a5a;
}

input[type='text'],
input[type='datetime-local'],
textarea {
  border: 1px solid #d0c8bc;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  font-family: inherit;
  background: #faf8f5;
  transition: border-color 0.2s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #1a1a2e;
}

.rating-selector {
  display: flex;
  gap: 0.3rem;
}

.star-btn {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #d0c8bc;
  transition: color 0.15s;
}

.star-btn.active {
  color: #c9a227;
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

.btn-cancel {
  padding: 0.6rem 1.4rem;
  border-radius: 6px;
  background: #f0ece4;
  color: #333;
  text-decoration: none;
  font-size: 0.95rem;
}

.btn-submit {
  padding: 0.6rem 1.4rem;
  border-radius: 6px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover {
  background: #2d2d50;
}
</style>
