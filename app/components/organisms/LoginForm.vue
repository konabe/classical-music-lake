<script setup lang="ts">
const props = defineProps<{
  isLoading: boolean;
  errors: { email: string; password: string; general: string };
}>();

const emit = defineEmits<{
  submit: [email: string, password: string];
  googleLogin: [];
}>();

const form = reactive({
  email: "",
  password: "",
});

function handleSubmit() {
  emit("submit", form.email, form.password);
}
</script>

<template>
  <AuthFormContainer title="ログイン">
    <form @submit.prevent="handleSubmit">
      <FormGroup
        label="メールアドレス"
        input-id="email"
        required
        :error-message="props.errors.email"
      >
        <TextInput
          id="email"
          v-model="form.email"
          type="email"
          placeholder="your@example.com"
          required
        />
      </FormGroup>

      <FormGroup
        label="パスワード"
        input-id="password"
        required
        :error-message="props.errors.password"
      >
        <PasswordInput
          id="password"
          v-model="form.password"
          placeholder="パスワードを入力"
          required
        />
      </FormGroup>

      <ErrorMessage v-if="props.errors.general" :message="props.errors.general" :center="true" />

      <ButtonPrimary type="submit" :disabled="props.isLoading">
        {{ props.isLoading ? "ログイン中..." : "ログイン" }}
      </ButtonPrimary>
    </form>

    <div class="divider">
      <span>または</span>
    </div>

    <button type="button" class="btn-google-login" @click="emit('googleLogin')">
      Google でログイン
    </button>

    <div class="register-link">
      <p>
        アカウントをお持ちでない方は
        <NuxtLink to="/auth/user-register">新規登録</NuxtLink>
      </p>
    </div>
  </AuthFormContainer>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #7a5c38;
}

.register-link p {
  margin: 0;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.register-link a {
  display: inline-block;
  color: var(--color-primary-soft);
  text-decoration: none;
  white-space: nowrap;
}

.register-link a:hover {
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #7a5c38;
  gap: 0.75rem;
  margin: 1.25rem 0;
  font-size: 0.85rem;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #d4c5b0;
}

.btn-google-login {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d4c5b0;
  border-radius: 4px;
  background-color: var(--color-bg-surface);
  color: var(--color-primary-soft);
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-google-login:hover {
  background-color: var(--color-bg-elevated);
}

:global(.dark .register-link) {
  color: var(--color-text-secondary);
}

:global(.dark .register-link a) {
  color: var(--color-link);
}

:global(.dark .divider) {
  color: var(--color-text-muted);
}

:global(.dark .divider::before),
:global(.dark .divider::after) {
  border-bottom-color: var(--color-border-strong);
}

:global(.dark .btn-google-login) {
  border-color: var(--color-border-strong);
  color: var(--color-text);
}
</style>
