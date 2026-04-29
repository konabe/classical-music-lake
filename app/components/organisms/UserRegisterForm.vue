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
          パスワードは8文字以上で、大文字・小文字・数字を含む必要があります
        </p>
      </FormGroup>

      <ButtonPrimary type="submit" :disabled="props.isLoading">
        {{ props.isLoading ? "登録中..." : "登録" }}
      </ButtonPrimary>
    </form>

    <div v-if="props.successMessage" class="success-message">
      <p>{{ props.successMessage }}</p>
      <NuxtLink to="/auth/login">ログイン画面へ</NuxtLink>
    </div>

    <div class="login-link">
      <p>
        既にアカウントをお持ちですか？
        <NuxtLink to="/auth/login">ログイン</NuxtLink>
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
  color: #7a5c38;
  font-size: 0.875rem;
  margin: 0;
}

.success-message {
  background-color: #d8e8c0;
  color: #2a5218;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.success-message a {
  display: inline-block;
  margin-top: 0.5rem;
  color: #2a5218;
  text-decoration: underline;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #7a5c38;
}

.login-link a {
  color: var(--color-primary-soft);
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

:global(.dark) .password-requirements {
  color: #c8a878;
}

:global(.dark) .success-message {
  background-color: #2a5218;
  color: #d8e8c0;
}

:global(.dark) .success-message a {
  color: #d8e8c0;
}

:global(.dark) .login-link {
  color: #c8a878;
}
</style>
