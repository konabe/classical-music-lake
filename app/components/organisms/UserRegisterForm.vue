<script setup lang="ts">
const props = defineProps<{
  isLoading: boolean;
  errors: { email: string; password: string };
  successMessage: string;
}>();

const emit = defineEmits<{
  submit: [email: string, password: string];
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
  <AuthFormContainer title="新規登録">
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
          placeholder="8文字以上で入力"
          required
        />
        <p class="password-requirements">
          <em>—</em>
          パスワードは 8 文字以上で、大文字・小文字・数字を含む必要があります
        </p>
      </FormGroup>

      <ButtonPrimary type="submit" :disabled="props.isLoading">
        {{ props.isLoading ? "Registering…" : "登録" }}
      </ButtonPrimary>
    </form>

    <div v-if="props.successMessage" class="success-message">
      <p>{{ props.successMessage }}</p>
      <NuxtLink to="/auth/login">ログイン画面へ &rarr;</NuxtLink>
    </div>

    <div class="login-link">
      <p>
        既にアカウントをお持ちですか？
        <NuxtLink to="/auth/login">ログイン &rarr;</NuxtLink>
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

.password-requirements {
  color: var(--color-text-muted);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.password-requirements em {
  color: var(--color-accent);
  font-style: italic;
  font-family: var(--font-display);
}

.success-message {
  background: transparent;
  border: 1px solid var(--color-accent);
  border-left: 3px solid var(--color-accent);
  color: var(--color-text);
  padding: 1rem 1.2rem;
  text-align: left;
  font-family: var(--font-serif);
  margin-top: 1rem;
}

.success-message p {
  font-style: italic;
  margin: 0 0 0.4rem;
}

.success-message a {
  display: inline-block;
  color: var(--color-accent);
  text-decoration: none;
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  border-bottom: 1px solid transparent;
  transition: border-color 0.25s ease;
}

.success-message a:hover {
  border-bottom-color: var(--color-accent);
}

.login-link {
  text-align: center;
  margin-top: 1.4rem;
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.login-link p {
  margin: 0;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.login-link a {
  display: inline-block;
  color: var(--color-accent);
  text-decoration: none;
  white-space: nowrap;
  font-weight: 500;
  border-bottom: 1px solid transparent;
  transition: border-color 0.25s ease;
}

.login-link a:hover {
  border-bottom-color: var(--color-accent);
}
</style>
