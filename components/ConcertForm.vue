<script setup lang="ts">
import type { CreateConcertInput } from '~/types'

const props = defineProps<{
  initialValues?: Partial<CreateConcertInput>
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [values: CreateConcertInput]
}>()

const form = reactive({
  date: props.initialValues?.date ?? new Date().toISOString().slice(0, 10),
  venue: props.initialValues?.venue ?? '',
  title: props.initialValues?.title ?? '',
  orchestra: props.initialValues?.orchestra ?? '',
  conductor: props.initialValues?.conductor ?? '',
  soloists: props.initialValues?.soloists?.join(', ') ?? '',
  programText: props.initialValues?.program?.join('\n') ?? '',
  rating: props.initialValues?.rating ?? 3,
  isFavorite: props.initialValues?.isFavorite ?? false,
  memo: props.initialValues?.memo ?? '',
})

function handleSubmit() {
  const values: CreateConcertInput = {
    date: form.date,
    venue: form.venue,
    title: form.title,
    orchestra: form.orchestra || undefined,
    conductor: form.conductor || undefined,
    soloists: form.soloists ? form.soloists.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    program: form.programText.split('\n').map((s) => s.trim()).filter(Boolean),
    rating: form.rating,
    isFavorite: form.isFavorite,
    memo: form.memo || undefined,
  }
  emit('submit', values)
}
</script>

<template>
  <form class="concert-form" @submit.prevent="handleSubmit">
    <div class="form-row">
      <div class="form-group">
        <label>公演日 <span class="required">*</span></label>
        <input v-model="form.date" type="date" required />
      </div>
      <div class="form-group">
        <label>会場 <span class="required">*</span></label>
        <input v-model="form.venue" type="text" placeholder="例: サントリーホール" required />
      </div>
    </div>

    <div class="form-group">
      <label>公演タイトル <span class="required">*</span></label>
      <input v-model="form.title" type="text" placeholder="例: ベルリン・フィル日本公演" required />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>楽団</label>
        <input v-model="form.orchestra" type="text" placeholder="例: ベルリン・フィルハーモニー管弦楽団" />
      </div>
      <div class="form-group">
        <label>指揮者</label>
        <input v-model="form.conductor" type="text" placeholder="例: キリル・ペトレンコ" />
      </div>
    </div>

    <div class="form-group">
      <label>ソリスト（カンマ区切り）</label>
      <input v-model="form.soloists" type="text" placeholder="例: 内田光子, 庄司紗矢香" />
    </div>

    <div class="form-group">
      <label>プログラム（1行1曲） <span class="required">*</span></label>
      <textarea
        v-model="form.programText"
        rows="4"
        placeholder="例:&#10;ブラームス: 交響曲第1番&#10;ドヴォルジャーク: チェロ協奏曲"
        required
      />
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
      <textarea v-model="form.memo" rows="4" placeholder="公演の感想を書いてください..." />
    </div>

    <div class="form-actions">
      <NuxtLink to="/concerts" class="btn-cancel">キャンセル</NuxtLink>
      <button type="submit" class="btn-submit">{{ submitLabel ?? '保存する' }}</button>
    </div>
  </form>
</template>

<style scoped>
.concert-form {
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
input[type='date'],
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
