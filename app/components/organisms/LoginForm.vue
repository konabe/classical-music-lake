<script setup lang="ts">
const props = defineProps<{
  isLoading: boolean;
  errors: { email: string; password: string; general: string };
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
  <div class="login-container">
    <h1>ログイン</h1>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">メールアドレス</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="your@example.com"
          required
        />
        <ErrorMessage v-if="props.errors.email" :message="props.errors.email" />
      </div>

      <div class="form-group">
        <label for="password">パスワード</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="パスワードを入力"
          required
        />
        <ErrorMessage v-if="props.errors.password" :message="props.errors.password" />
      </div>

      <ErrorMessage v-if="props.errors.general" :message="props.errors.general" :center="true" />

      <button type="submit" :disabled="props.isLoading">
        {{ props.isLoading ? "ログイン中..." : "ログイン" }}
      </button>
    </form>

    <div class="register-link">
      <p>
        アカウントをお持ちでない方は
        <NuxtLink to="/auth/user-register">新規登録</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  background: #eaeef4;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(61, 36, 9, 0.15);
  width: 100%;
  max-width: 400px;
  border: 1px solid #9aa5b4;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1e2d5a;
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
  color: #1e2d5a;
}

input[type="email"],
input[type="password"] {
  padding: 0.75rem;
  border: 1px solid #9aa5b4;
  border-radius: 4px;
  font-size: 1rem;
  background: #faf3e0;
  transition: border-color 0.2s;
}

input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #1e2d5a;
}

button {
  padding: 0.75rem;
  background-color: #1e2d5a;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #2d2d50;
}

button:disabled {
  background-color: #a89070;
  cursor: not-allowed;
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
</style>
