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
        {{ props.isLoading ? "Signing in…" : "ログイン" }}
      </ButtonPrimary>
    </form>

    <div class="divider">
      <span class="smallcaps">Or</span>
    </div>

    <button type="button" class="btn-google-login" @click="emit('googleLogin')">
      <span class="g-mark" aria-hidden="true">G</span>
      <span class="g-label">Google でログイン</span>
    </button>

    <div class="register-link">
      <p>
        アカウントをお持ちでない方は
        <NuxtLink to="/auth/user-register">新規登録 &rarr;</NuxtLink>
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

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--color-text-muted);
  gap: 0.8rem;
  margin: 1.5rem 0 1.2rem;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid var(--color-hairline);
}

.btn-google-login {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--color-hairline-strong);
  background-color: transparent;
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease;
}

.btn-google-login:hover {
  background-color: var(--color-bg-elevated);
  border-color: var(--color-accent);
}

.g-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 1px solid var(--color-accent);
  font-family: var(--font-display);
  font-style: italic;
  font-size: 0.95rem;
  color: var(--color-accent);
  letter-spacing: 0;
}

.g-label {
  font-weight: 600;
}

.register-link {
  text-align: center;
  margin-top: 1.4rem;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.register-link p {
  margin: 0;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.register-link a {
  display: inline-block;
  color: var(--color-accent);
  text-decoration: none;
  white-space: nowrap;
  font-weight: 500;
  border-bottom: 1px solid transparent;
  transition: border-color 0.25s ease;
}

.register-link a:hover {
  border-bottom-color: var(--color-accent);
}
</style>
