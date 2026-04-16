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
      <FormGroup label="メールアドレス" input-id="email" :error-message="props.errors.email">
        <TextInput
          id="email"
          v-model="form.email"
          type="email"
          placeholder="your@example.com"
          required
        />
      </FormGroup>

      <FormGroup label="パスワード" input-id="password" :error-message="props.errors.password">
        <TextInput
          id="password"
          v-model="form.password"
          type="password"
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

.register-link a {
  color: #2d2d50;
  text-decoration: none;
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
  background-color: #ffffff;
  color: #2d2d50;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-google-login:hover {
  background-color: #f0ebe3;
}
</style>
