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
      <strong class="description-email">{{ props.email }}</strong>
      <br />
      に送信された認証コードを入力してください。
    </p>

    <form @submit.prevent="handleSubmit">
      <FormGroup label="認証コード" input-id="code" required>
        <input
          id="code"
          v-model="code"
          type="text"
          class="code-input"
          placeholder="123456"
          autocomplete="one-time-code"
          required
        />
        <ErrorMessage v-if="props.error" :message="props.error" data-testid="error-message" />
      </FormGroup>

      <p v-if="props.infoMessage" class="info-message">
        <span class="info-mark smallcaps">Sent</span>
        {{ props.infoMessage }}
      </p>

      <ButtonPrimary type="submit" :disabled="props.isLoading">
        {{ props.isLoading ? "Verifying…" : "確認する" }}
      </ButtonPrimary>
    </form>

    <div class="resend-section">
      <p>コードが届きませんか？</p>
      <button type="button" class="resend-button" :disabled="props.isLoading" @click="handleResend">
        <span class="smallcaps">Resend code</span>
      </button>
    </div>
  </AuthFormContainer>
</template>

<style scoped>
.description {
  text-align: center;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.95rem;
  line-height: 1.5;
}

.description-email {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-accent);
  font-size: 1.05rem;
  font-weight: 500;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.code-input {
  border: none;
  border-bottom: 1px solid var(--color-hairline-strong);
  border-radius: 0;
  padding: 0.7rem 0.1rem;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.6rem;
  letter-spacing: 0.4em;
  background: transparent;
  color: var(--color-text);
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  font-variant-numeric: tabular-nums;
  transition: border-color 0.25s ease;
}

.code-input::placeholder {
  color: var(--color-text-faint);
  font-style: italic;
}

.code-input:focus {
  outline: none;
  border-bottom-color: var(--color-accent);
}

.info-message {
  border-left: 3px solid var(--color-accent);
  padding: 0.6rem 0.8rem;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.info-mark {
  color: var(--color-accent);
  font-style: normal;
}

.resend-section {
  text-align: center;
  margin-top: 1.4rem;
  color: var(--color-text-muted);
}

.resend-section p {
  margin-bottom: 0.6rem;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.9rem;
}

.resend-button {
  background: none;
  border: none;
  color: var(--color-accent);
  cursor: pointer;
  padding: 0.3rem 0;
  border-bottom: 1px solid transparent;
  transition: border-color 0.25s ease;
}

.resend-button:hover:not(:disabled) {
  border-bottom-color: var(--color-accent);
}

.resend-button:disabled {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}
</style>
