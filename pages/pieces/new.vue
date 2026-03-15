<script setup lang="ts">
import type { CreatePieceInput } from "~/types";

const apiBase = useApiBase();

const form = reactive<CreatePieceInput>({
  title: "",
  composer: "",
});

const errorMessage = ref("");

async function handleSubmit() {
  errorMessage.value = "";
  try {
    await $fetch(`${apiBase}/pieces`, { method: "POST", body: form });
    await navigateTo("/pieces");
  } catch {
    errorMessage.value = "登録に失敗しました。入力内容を確認してください。";
  }
}
</script>

<template>
  <div>
    <h1 class="page-title">楽曲を追加</h1>

    <form class="piece-form" @submit.prevent="handleSubmit">
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
        <button type="submit" class="btn-primary">登録する</button>
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
</style>
