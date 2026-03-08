<script setup lang="ts">
import type { Piece, UpdatePieceInput } from "~/types";

const route = useRoute();
const apiBase = useApiBase();
const id = route.params.id as string;

const { data: piece, error } = await useFetch<Piece>(`${apiBase}/pieces/${id}`);

const form = reactive<UpdatePieceInput>({
  title: piece.value?.title ?? "",
  composer: piece.value?.composer ?? "",
});

const errorMessage = ref("");

async function handleSubmit() {
  errorMessage.value = "";
  try {
    await $fetch(`${apiBase}/pieces/${id}`, { method: "PUT", body: form });
    await navigateTo("/pieces");
  } catch {
    errorMessage.value = "更新に失敗しました。入力内容を確認してください。";
  }
}
</script>

<template>
  <div>
    <h1 class="page-title">楽曲を編集</h1>

    <div v-if="error" class="error-message">楽曲の取得に失敗しました。</div>

    <form v-else class="piece-form" @submit.prevent="handleSubmit">
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="form-group">
        <label for="title">曲名 <span class="required">*</span></label>
        <input id="title" v-model="form.title" type="text" required placeholder="例：交響曲第9番" />
      </div>

      <div class="form-group">
        <label for="composer">作曲家 <span class="required">*</span></label>
        <input
          id="composer"
          v-model="form.composer"
          type="text"
          required
          placeholder="例：ベートーヴェン"
        />
      </div>

      <div class="form-actions">
        <NuxtLink to="/pieces" class="btn-secondary">キャンセル</NuxtLink>
        <button type="submit" class="btn-primary">更新する</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}

.piece-form {
  max-width: 480px;
}

.error-message {
  background: #fff0f0;
  border: 1px solid #f5c6c6;
  color: #c0392b;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.4rem;
  color: #333;
  font-size: 0.9rem;
}

.required {
  color: #c0392b;
}

.form-group input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #1a1a2e;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.btn-primary {
  background: #1a1a2e;
  color: #fff;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2d2d50;
}

.btn-secondary {
  background: #f0ece4;
  color: #333;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e0d8cc;
}
</style>
