<script setup lang="ts">
const props = defineProps<{
  email: string;
  isLoading: boolean;
  error: string;
  infoMessage: string;
}>();

const emit = defineEmits<{
  submit: [code: string];
  resend: [];
}>();

const code = ref("");

function handleSubmit() {
  if (props.isLoading) {
    return;
  }
  emit("submit", code.value);
}

function handleResend() {
  if (props.isLoading) {
    return;
  }
  emit("resend");
}
</script>

<template>
  <AuthFormContainer title="メールアドレス確認">
    <p class="description">
      <strong>{{ props.email }}</strong> に送信された認証コードを入力してください。
    </p>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="code">認証コード</label>
        <input
          id="code"
          v-model="code"
          type="text"
          placeholder="例: 123456"
          autocomplete="one-time-code"
          required
        />
        <ErrorMessage v-if="props.error" :message="props.error" data-testid="error-message" />
      </div>

      <p v-if="props.infoMessage" class="info-message">{{ props.infoMessage }}</p>

      <ButtonPrimary type="submit" :disabled="props.isLoading">
        {{ props.isLoading ? "確認中..." : "確認する" }}
      </ButtonPrimary>
    </form>

    <div class="resend-section">
      <p>コードが届きませんか？</p>
      <button type="button" class="resend-button" :disabled="props.isLoading" @click="handleResend">
        再送信
      </button>
    </div>
  </AuthFormContainer>
</template>

<style scoped>
.description {
  text-align: center;
  color: #7a5c38;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: var(--color-text);
}

input[type="text"] {
  padding: 0.75rem;
  border: 1px solid var(--color-secondary);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--color-bg-input);
  transition: border-color 0.2s;
}

input[type="text"]:focus {
  outline: none;
  border-color: var(--color-primary);
}

.info-message {
  color: #2a5218;
  background-color: #d8e8c0;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin: 0;
}

.resend-section {
  text-align: center;
  margin-top: 1.5rem;
  color: #7a5c38;
}

.resend-section p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.resend-button {
  background: none;
  border: none;
  color: var(--color-primary-soft);
  font-size: 0.9rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.resend-button:hover:not(:disabled) {
  color: var(--color-text);
}

.resend-button:disabled {
  color: #a89070;
  cursor: not-allowed;
  text-decoration: none;
}

:global(.dark .description) {
  color: #c8a878;
}

:global(.dark .info-message) {
  color: #d8e8c0;
  background-color: #2a5218;
}

:global(.dark .resend-section) {
  color: #c8a878;
}

:global(.dark .resend-button:disabled) {
  color: #6e5435;
}
</style>
